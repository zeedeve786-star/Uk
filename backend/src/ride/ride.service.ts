import { BadRequestException, ConflictException, Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateRideDto } from './dto/create-ride.dto';
import { AssignDriverDto } from './dto/assign-driver.dto';
import { UpdateRideNotesDto } from './dto/update-ride-notes.dto';
import { RideResult } from './models/ride-result';
import { generateRideReference } from './ride-reference.util';
import { isTransitionAllowed } from './ride-status.rules';
import { RideStatus, DriverStatus, NotificationRecipientType, NotificationType, Prisma } from '@prisma/client';
import { NotificationService } from '../notification/notification.service';
import { FareService } from '../fare/fare.service';

const MAX_REFERENCE_ATTEMPTS = 5;

const rideWithBooking = Prisma.validator<Prisma.RideDefaultArgs>()({
  include: { booking: true },
});
type RideWithBooking = Prisma.RideGetPayload<typeof rideWithBooking>;

function toResult(ride: RideWithBooking): RideResult {
  return {
    id: ride.id,
    rideReference: ride.rideReference,
    status: ride.status,
    driverId: ride.driverId,
    operationalNotes: ride.operationalNotes,
    createdAt: ride.createdAt.toISOString(),
    updatedAt: ride.updatedAt.toISOString(),
    booking: {
      bookingReference: ride.booking.bookingReference,
      pickup: ride.booking.pickup,
      destination: ride.booking.destination,
      extraStops: ride.booking.extraStops,
      journeyDate: ride.booking.journeyDate.toISOString().slice(0, 10),
      journeyTime: ride.booking.journeyTime,
      customerName: ride.booking.customerName,
      customerEmail: ride.booking.customerEmail,
      customerPhone: ride.booking.customerPhone,
      passengerCount: ride.booking.passengerCount,
      vehicleCategory: ride.booking.vehicleCategory,
      finalFarePence: ride.booking.finalFarePence,
      currency: ride.booking.currency,
      paymentStatus: ride.booking.paymentStatus,
      bookingStatus: ride.booking.bookingStatus,
    },
  };
}

@Injectable()
export class RideService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly notificationService: NotificationService,
    private readonly fareService: FareService,
  ) {}

  async createFromBooking(dto: CreateRideDto): Promise<RideResult> {
    const booking = await this.prisma.booking.findUnique({ where: { bookingReference: dto.bookingReference } });
    if (!booking) {
      throw new NotFoundException('Booking not found');
    }
    if (booking.bookingStatus === 'CANCELLED') {
      throw new BadRequestException('Cannot create a ride for a cancelled booking');
    }

    const existingRide = await this.prisma.ride.findUnique({ where: { bookingId: booking.id } });
    if (existingRide) {
      throw new ConflictException('A ride already exists for this booking');
    }

    const ride = await this.createWithUniqueReference({ bookingId: booking.id, operationalNotes: dto.operationalNotes });
    return toResult(ride);
  }

  private async createWithUniqueReference(data: { bookingId: string; operationalNotes?: string }): Promise<RideWithBooking> {
    for (let attempt = 0; attempt < MAX_REFERENCE_ATTEMPTS; attempt += 1) {
      const rideReference = generateRideReference();
      try {
        return await this.prisma.ride.create({ data: { ...data, rideReference }, include: { booking: true } });
      } catch (error) {
        const isUniqueViolation = error instanceof Prisma.PrismaClientKnownRequestError && error.code === 'P2002';
        if (!isUniqueViolation || attempt === MAX_REFERENCE_ATTEMPTS - 1) {
          throw error;
        }
      }
    }
    throw new Error('Failed to generate a unique ride reference');
  }

  async list(): Promise<RideResult[]> {
    const rides = await this.prisma.ride.findMany({ include: { booking: true }, orderBy: { createdAt: 'desc' } });
    return rides.map(toResult);
  }

  private async getRecord(rideReference: string): Promise<RideWithBooking> {
    const ride = await this.prisma.ride.findUnique({ where: { rideReference }, include: { booking: true } });
    if (!ride) {
      throw new NotFoundException('Ride not found');
    }
    return ride;
  }

  async getByReference(rideReference: string): Promise<RideResult> {
    return toResult(await this.getRecord(rideReference));
  }

  async updateStatus(rideReference: string, nextStatus: RideStatus): Promise<RideResult> {
    const ride = await this.getRecord(rideReference);

    if (!isTransitionAllowed(ride.status, nextStatus)) {
      throw new BadRequestException(`Cannot transition ride from ${ride.status} to ${nextStatus}`);
    }

    const updated = await this.prisma.$transaction(async (tx) => {
      const updatedRide = await tx.ride.update({ where: { rideReference }, data: { status: nextStatus }, include: { booking: true } });

      if ((nextStatus === RideStatus.COMPLETED || nextStatus === RideStatus.CANCELLED) && ride.driverId) {
        await tx.driverProfile
          .update({ where: { id: ride.driverId }, data: { status: DriverStatus.AVAILABLE } })
          .catch(() => undefined);
      }

      return updatedRide;
    });

    await this.notificationService.notify({
      type: NotificationType.RIDE_STATUS_CHANGED,
      recipientType: NotificationRecipientType.CUSTOMER,
      recipientContact: updated.booking.customerEmail,
      referenceType: 'Ride',
      referenceId: updated.rideReference,
      message: `Ride ${updated.rideReference} for booking ${updated.booking.bookingReference} is now ${nextStatus}.`,
    });

    return toResult(updated);
  }

  async assignDriver(rideReference: string, dto: AssignDriverDto): Promise<RideResult> {
    const ride = await this.getRecord(rideReference);
    if (ride.status === RideStatus.COMPLETED || ride.status === RideStatus.CANCELLED) {
      throw new BadRequestException('Cannot change driver assignment on a completed or cancelled ride');
    }

    const previousDriverId = ride.driverId;
    let assignedDriver: { userId: string } | null = null;

    if (dto.driverId) {
      const driver = await this.prisma.driverProfile.findUnique({ where: { id: dto.driverId } });
      if (!driver) {
        throw new NotFoundException('Driver profile not found');
      }
      if (driver.status === DriverStatus.ON_RIDE && driver.id !== previousDriverId) {
        throw new ConflictException('Driver is already assigned to another active ride');
      }
      assignedDriver = driver;
    }

    const updated = await this.prisma.$transaction(async (tx) => {
      const updateData: Prisma.RideUpdateInput = {
        driver: dto.driverId
          ? { connect: { id: dto.driverId } }
          : { disconnect: true },
      };

      if (dto.driverId) {
        const earning = await this.fareService.calculateDriverEarning(
          ride.booking.finalFarePence,
        );

        updateData.driverEarningPence = earning.driverEarningPence;
        updateData.driverEarningSource = earning.source;
        updateData.driverEarningLocked = false;
      } else {
        updateData.driverEarningPence = null;
        updateData.driverEarningSource = null;
        updateData.driverEarningLocked = false;
      }

      const updatedRide = await tx.ride.update({
        where: { rideReference },
        data: updateData,
        include: { booking: true },
      });

      if (previousDriverId && previousDriverId !== dto.driverId) {
        await tx.driverProfile.update({ where: { id: previousDriverId }, data: { status: DriverStatus.AVAILABLE } }).catch(() => undefined);
      }
      if (dto.driverId) {
        await tx.driverProfile.update({ where: { id: dto.driverId }, data: { status: DriverStatus.ON_RIDE } });
      }

      return updatedRide;
    });

    // Only notify on a genuine new assignment — not on unassignment, and not
    // when reassigning to the same driver that was already on the ride.
    if (dto.driverId && dto.driverId !== previousDriverId && assignedDriver) {
      await this.notificationService.notify({
        type: NotificationType.DRIVER_ASSIGNED,
        recipientType: NotificationRecipientType.DRIVER,
        recipientUserId: assignedDriver.userId,
        referenceType: 'Ride',
        referenceId: updated.rideReference,
        message: `You have been assigned to ride ${updated.rideReference} (booking ${updated.booking.bookingReference}).`,
      });
    }

    return toResult(updated);
  }

  async updateNotes(rideReference: string, dto: UpdateRideNotesDto): Promise<RideResult> {
    await this.getRecord(rideReference);
    const updated = await this.prisma.ride.update({ where: { rideReference }, data: { operationalNotes: dto.operationalNotes }, include: { booking: true } });
    return toResult(updated);
  }
}
