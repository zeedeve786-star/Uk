import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { BookingStatus, NotificationRecipientType, NotificationType, Prisma, VehicleCategory as PrismaVehicleCategory } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { FareService } from '../fare/fare.service';
import { AvailabilityService } from '../availability/availability.service';
import { DiscountService } from '../discount/discount.service';
import { NotificationService } from '../notification/notification.service';
import { VehicleCategoryId } from '../fare/dto/calculate-fare.dto';
import { CreateBookingDto } from './dto/create-booking.dto';
import { BookingResult } from './models/booking-result';
import { generateBookingReference } from './booking-reference.util';

const MAX_REFERENCE_ATTEMPTS = 5;
const MINIMUM_ADVANCE_HOURS = 4;


const VEHICLE_CAPACITY: Record<VehicleCategoryId, {
  passengers: number;
  suitcases: number;
  handCarry: number;
}> = {
  [VehicleCategoryId.SALOON]: { passengers: 4, suitcases: 2, handCarry: 1 },
  [VehicleCategoryId.ESTATE]: { passengers: 4, suitcases: 3, handCarry: 2 },
  [VehicleCategoryId.MPV]: { passengers: 5, suitcases: 4, handCarry: 2 },
  [VehicleCategoryId.EXECUTIVE]: { passengers: 3, suitcases: 2, handCarry: 1 },
  [VehicleCategoryId.EIGHT_SEATER]: { passengers: 8, suitcases: 6, handCarry: 4 },
};

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
    private readonly availabilityService: AvailabilityService,
    private readonly discountService: DiscountService,
    private readonly notificationService: NotificationService,
  ) {}

  async createBooking(dto: CreateBookingDto): Promise<BookingResult> {
    const extraStops = dto.extraStops ?? [];

    const capacity = VEHICLE_CAPACITY[dto.vehicleCategory];
    const suitcases = dto.luggageCount ?? 0;
    const handCarry = dto.handCarryCount ?? 0;

    if (dto.passengerCount > capacity.passengers) {
      throw new BadRequestException(
        `${dto.vehicleCategory} supports a maximum of ${capacity.passengers} passengers`,
      );
    }

    if (suitcases > capacity.suitcases) {
      throw new BadRequestException(
        `${dto.vehicleCategory} supports a maximum of ${capacity.suitcases} suitcases`,
      );
    }

    if (handCarry > capacity.handCarry) {
      throw new BadRequestException(
        `${dto.vehicleCategory} supports a maximum of ${capacity.handCarry} hand-carry items`,
      );
    }


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

    const requestedDateTime = new Date(
      `${dto.journeyDate}T${dto.journeyTime}:00.000Z`,
    );
    const minimumBookingTime = new Date(Date.now() + 4 * 60 * 60 * 1000);

    if (requestedDateTime < minimumBookingTime) {
      throw new BadRequestException(
        'Bookings must be made at least 4 hours before the journey time',
      );
    }

    const availability = await this.availabilityService.checkAvailability({
      date: dto.journeyDate,
      time: dto.journeyTime,
      vehicleCategory: dto.vehicleCategory,
    });

    if (!availability.available) {
      throw new BadRequestException(
        'The selected vehicle is not available for this journey time',
      );
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
      leadPassengerName: dto.leadPassengerName,
      leadPassengerEmail: dto.leadPassengerEmail,
      leadPassengerPhone: dto.leadPassengerPhone,
      passengerCount: dto.passengerCount,
      luggageCount: dto.luggageCount,
      handCarryCount: dto.handCarryCount,
      luggageNotes: dto.luggageNotes,
      customerNotes: dto.customerNotes,
      vehicleCategory: vehicleCategoryToPrismaEnum[dto.vehicleCategory],
      estimatedDistanceMiles: dto.distanceMiles,
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
      luggageCount: record.luggageCount,
      handCarryCount: record.handCarryCount,
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
    const booking = await this.prisma.booking.findUnique({
      where: { bookingReference },
      include: {
        ride: {
          include: {
            driver: true,
          },
        },
      },
    });

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
