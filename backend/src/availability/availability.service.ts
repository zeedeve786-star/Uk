import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { AvailabilityBlock, VehicleCategory as PrismaVehicleCategory } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { VehicleCategoryId } from '../fare/dto/calculate-fare.dto';
import { CreateAvailabilityBlockDto } from './dto/create-availability-block.dto';
import { CheckAvailabilityDto } from './dto/check-availability.dto';
import {
  AvailabilityBlockResult,
  AvailabilityCheckResult,
} from './models/availability-result';

const vehicleCategoryToPrismaEnum: Record<string, PrismaVehicleCategory> = {
  [VehicleCategoryId.SALOON]: PrismaVehicleCategory.SALOON,
  [VehicleCategoryId.ESTATE]: PrismaVehicleCategory.ESTATE,
  [VehicleCategoryId.MPV]: PrismaVehicleCategory.MPV,
  [VehicleCategoryId.EXECUTIVE]: PrismaVehicleCategory.EXECUTIVE,
  [VehicleCategoryId.EIGHT_SEATER]: PrismaVehicleCategory.EIGHT_SEATER,
};

const prismaEnumToVehicleCategoryId: Record<PrismaVehicleCategory, VehicleCategoryId> = {
  [PrismaVehicleCategory.SALOON]: VehicleCategoryId.SALOON,
  [PrismaVehicleCategory.ESTATE]: VehicleCategoryId.ESTATE,
  [PrismaVehicleCategory.MPV]: VehicleCategoryId.MPV,
  [PrismaVehicleCategory.EXECUTIVE]: VehicleCategoryId.EXECUTIVE,
  [PrismaVehicleCategory.EIGHT_SEATER]: VehicleCategoryId.EIGHT_SEATER,
};

function toBlockResult(block: AvailabilityBlock): AvailabilityBlockResult {
  return {
    id: block.id,
    vehicleCategory: prismaEnumToVehicleCategoryId[block.vehicleCategory],
    startsAt: block.startsAt.toISOString(),
    endsAt: block.endsAt.toISOString(),
    reason: block.reason,
    createdAt: block.createdAt.toISOString(),
  };
}

@Injectable()
export class AvailabilityService {
  constructor(private readonly prisma: PrismaService) {}

  async createBlock(dto: CreateAvailabilityBlockDto): Promise<AvailabilityBlockResult> {
    const startsAt = new Date(dto.startsAt);
    const endsAt = new Date(dto.endsAt);

    if (Number.isNaN(startsAt.getTime()) || Number.isNaN(endsAt.getTime())) {
      throw new BadRequestException('Invalid availability dates');
    }

    if (endsAt <= startsAt) {
      throw new BadRequestException('endsAt must be after startsAt');
    }

    const block = await this.prisma.availabilityBlock.create({
      data: {
        vehicleCategory: vehicleCategoryToPrismaEnum[dto.vehicleCategory],
        startsAt,
        endsAt,
        reason: dto.reason,
      },
    });

    return toBlockResult(block);
  }

  async listBlocks(): Promise<AvailabilityBlockResult[]> {
    const blocks = await this.prisma.availabilityBlock.findMany({
      orderBy: { startsAt: 'asc' },
    });

    return blocks.map(toBlockResult);
  }

  async deleteBlock(id: string): Promise<void> {
    const existing = await this.prisma.availabilityBlock.findUnique({
      where: { id },
    });

    if (!existing) {
      throw new NotFoundException('Availability block not found');
    }

    await this.prisma.availabilityBlock.delete({
      where: { id },
    });
  }

  async checkAvailability(dto: CheckAvailabilityDto): Promise<AvailabilityCheckResult> {
    const prismaCategory = vehicleCategoryToPrismaEnum[dto.vehicleCategory];
    const targetInstant = new Date(`${dto.date}T${dto.time}:00.000Z`);

    if (Number.isNaN(targetInstant.getTime())) {
      throw new BadRequestException('Invalid date/time');
    }

    const [blocks, bookings] = await Promise.all([
      this.prisma.availabilityBlock.findMany({
        where: {
          vehicleCategory: prismaCategory,
          startsAt: { lte: targetInstant },
          endsAt: { gt: targetInstant },
        },
      }),
      this.prisma.booking.findMany({
        where: {
          vehicleCategory: prismaCategory,
          journeyDate: new Date(`${dto.date}T00:00:00.000Z`),
          journeyTime: dto.time,
          bookingStatus: { not: 'CANCELLED' },
        },
      }),
    ]);

    return {
      vehicleCategory: dto.vehicleCategory as VehicleCategoryId,
      date: dto.date,
      time: dto.time,
      available: blocks.length === 0 && bookings.length === 0,
      conflictingBlocks: blocks.map(toBlockResult),
      conflictingBookings: bookings.map((b) => ({
        bookingReference: b.bookingReference,
        journeyDate: b.journeyDate.toISOString().slice(0, 10),
        journeyTime: b.journeyTime,
        bookingStatus: b.bookingStatus,
      })),
    };
  }
}
