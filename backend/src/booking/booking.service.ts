import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { BookingStatus, NotificationRecipientType, NotificationType, Prisma, VehicleCategory as PrismaVehicleCategory } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { FareService } from '../fare/fare.service';
import { DiscountService } from '../discount/discount.service';
import { NotificationService } from '../notification/notification.service';
import { VehicleCategoryId } from '../fare/dto/calculate-fare.dto';
import { CreateBookingDto } from './dto/create-booking.dto';
import { BookingResult } from './models/booking-result';
import { generateBookingReference } from './booking-reference.util';
import { RideStatus, DriverStatus } from '@prisma/client';

const MAX_REFERENCE_ATTEMPTS = 5;
const MINIMUM_ADVANCE_HOURS = 4;

const vehicleCategoryToPrismaEnum: Record<VehicleCategoryId, PrismaVehicleCategory> = {
  [VehicleCategoryId.SALOON]: PrismaVehicleCategory.SALOON,
  [VehicleCategoryId.ESTATE]: PrismaVehicleCategory.ESTATE,
  [VehicleCategoryId.MPV]: PrismaVehicleCategory.MPV,
  [VehicleCategoryId.EXECUTIVE]: PrismaVehicleCategory.EXECUTIVE,
  [VehicleCategoryId.EIGHT_SEATER]: PrismaVehicleCategory.EIGHT_SEATER,
};

function toPence(pounds: number): number {
  return Math.round(pounds * 100);
}

function toPounds(pence: number): number {
  return Math.round(pence) / 100;
}

@Injectable()
export class BookingService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly fareService: FareService,
    private readonly discountService: DiscountService,
    private readonly notificationService: NotificationService,
  ) {}

  async createBooking(dto: CreateBookingDto): Promise<BookingResult> {
    const extraStops = dto.extraStops ?? [];

    const journeyAt = new Date(`${dto.journeyDate}T${dto.journeyTime}:00.000Z`);
    if (Number.isNaN(journeyAt.getTime())) {
      throw new BadRequestException('Invalid journey date or time');
    }

    const minimumJourneyAt = new Date(
      Date.now() + MINIMUM_ADVANCE_HOURS * 60 * 60 * 1000,
    );

    if (journeyAt.getTime() < minimumJourneyAt.getTime()) {
      throw new BadRequestException(
        `Bookings must be made at least ${MINIMUM_ADVANCE_HOURS} hours in advance`,
      );
    }

    const fareResult = await this.fareService.calculateFare({
      distanceMiles: dto.distanceMiles,
      vehicleCategory: dto.vehicleCategory,
      extraStopCount: extraStops.length,
    });

    const originalFarePence = toPence(fareResult.totalFare);
    let discountAmountPence = 0;
    let finalFarePence = originalFarePence;
    let appliedDiscountCode: string | null = null;

    if (dto.discountCode) {
      const discountResult = await this.discountService.calculateDiscount({
        code: dto.discountCode,
        originalAmount: fareResult.totalFare,
      });
      discountAmountPence = toPence(discountResult.discountAmount);
      finalFarePence = toPence(discountResult.finalAmount);
      appliedDiscountCode = discountResult.discountCode;
    }

    const record = await this.createWithUniqueReference({
      pickup: dto.pickup,
      destination: dto.destination,
      extraStops: extraStops as Prisma.InputJsonValue,
      journeyDate: new Date(`${dto.journeyDate}T00:00:00.000Z`),
      journeyTime: dto.journeyTime,
      customerName: dto.customerName,
      customerEmail: dto.customerEmail,
      customerPhone: dto.customerPhone,
      passengerCount: dto.passengerCount,
      vehicleCategory: vehicleCategoryToPrismaEnum[dto.vehicleCategory],
      originalFarePence,
      discountCode: appliedDiscountCode,
      discountAmountPence,
      finalFarePence,
      currency: fareResult.currency,
    });

    await this.notificationService.notify({
      type: NotificationType.BOOKING_CREATED,
      recipientType: NotificationRecipientType.CUSTOMER,
      recipientContact: record.customerEmail,
      referenceType: 'Booking',
      referenceId: record.bookingReference,
      message: `Booking ${record.bookingReference} created: ${record.pickup} → ${record.destination} on ${dto.journeyDate} at ${record.journeyTime}.`,
    });

    await this.createRideForBooking(record.id);

    return {
      bookingReference: record.bookingReference,
      pickup: record.pickup,
      destination: record.destination,
      extraStops,
      journeyDate: dto.journeyDate,
      journeyTime: record.journeyTime,
      customerName: record.customerName,
      customerEmail: record.customerEmail,
      customerPhone: record.customerPhone,
      passengerCount: record.passengerCount,
      vehicleCategory: dto.vehicleCategory,
      pricing: {
        originalFare: toPounds(record.originalFarePence),
        discountCode: record.discountCode,
        discountAmount: toPounds(record.discountAmountPence),
        finalFare: toPounds(record.finalFarePence),
        currency: 'GBP',
      },
      paymentStatus: record.paymentStatus,
      bookingStatus: record.bookingStatus,
      createdAt: record.createdAt.toISOString(),
    };
  }

  private async createRideForBooking(bookingId: string): Promise<void> {
    const existingRide = await this.prisma.ride.findUnique({
      where: { bookingId },
    });

    if (existingRide) {
      return;
    }

    const booking = await this.prisma.booking.findUnique({
      where: { id: bookingId },
    });

    if (!booking) {
      return;
    }

    const driver = await this.prisma.driverProfile.findFirst({
      where: {
        status: DriverStatus.AVAILABLE,
        vehicleCategory: booking.vehicleCategory,
      },
      orderBy: {
        updatedAt: 'asc',
      },
    });

    const rideReference = `RD-${Date.now().toString(16).toUpperCase()}-${Math.random()
      .toString(16)
      .slice(2, 8)
      .toUpperCase()}`;

    const earningConfig = await this.fareService.calculateDriverEarning(
      booking.finalFarePence,
    );

    await this.prisma.$transaction(async (tx) => {
      const ride = await tx.ride.create({
        data: {
          bookingId: booking.id,
          rideReference,
          status: RideStatus.SCHEDULED,
          driverId: driver?.id ?? null,
          driverEarningPence: driver ? earningConfig.driverEarningPence : null,
          driverEarningSource: driver ? earningConfig.source : null,
          driverEarningLocked: false,
        },
      });

      if (driver) {
        await tx.driverProfile.update({
          where: { id: driver.id },
          data: { status: DriverStatus.ON_RIDE },
        });
      }

      return ride;
    });

    if (driver) {
      await this.notificationService.notify({
        type: NotificationType.DRIVER_ASSIGNED,
        recipientType: NotificationRecipientType.DRIVER,
        recipientUserId: driver.userId,
        referenceType: 'Ride',
        referenceId: rideReference,
        message: `You have been assigned to ride ${rideReference} (booking ${booking.bookingReference}).`,
      });
    }
  }

  private async createWithUniqueReference(
    data: Omit<Prisma.BookingUncheckedCreateInput, 'bookingReference'>,
  ) {
    for (let attempt = 0; attempt < MAX_REFERENCE_ATTEMPTS; attempt += 1) {
      const bookingReference = generateBookingReference();
      try {
        return await this.prisma.booking.create({ data: { ...data, bookingReference } });
      } catch (error) {
        const isUniqueViolation =
          error instanceof Prisma.PrismaClientKnownRequestError && error.code === 'P2002';
        if (!isUniqueViolation || attempt === MAX_REFERENCE_ATTEMPTS - 1) {
          throw error;
        }
      }
    }
    throw new Error('Failed to generate a unique booking reference');
  }

  async listBookings() {
    return this.prisma.booking.findMany({ orderBy: { createdAt: 'desc' } });
  }

  async getBookingByReference(bookingReference: string) {
    const booking = await this.prisma.booking.findUnique({ where: { bookingReference } });
    if (!booking) {
      throw new NotFoundException('Booking not found');
    }
    return booking;
  }

  async updateBookingStatus(bookingReference: string, bookingStatus: BookingStatus) {
    await this.getBookingByReference(bookingReference);
    return this.prisma.booking.update({ where: { bookingReference }, data: { bookingStatus } });
  }
}
