import { BadRequestException, ConflictException, Injectable, NotFoundException } from '@nestjs/common';
import { DriverStatus, Role, VehicleCategory as PrismaVehicleCategory } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { VehicleCategoryId } from '../fare/dto/calculate-fare.dto';
import { CreateDriverProfileDto } from './dto/create-driver-profile.dto';
import { UpdateDriverProfileDto } from './dto/update-driver-profile.dto';
import { DriverProfileResult } from './models/driver-profile-result';

const vehicleCategoryToPrismaEnum: Record<VehicleCategoryId, PrismaVehicleCategory> = {
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

function toResult(profile: any): DriverProfileResult {
  return {
    id: profile.id,
    userId: profile.userId,
    name: profile.name,
    email: profile.user.email,
    status: profile.status,
    vehicleCategory: profile.vehicleCategory
      ? prismaEnumToVehicleCategoryId[profile.vehicleCategory as PrismaVehicleCategory]
      : null,
    phone: profile.phone,
    createdAt: profile.createdAt.toISOString(),
    updatedAt: profile.updatedAt.toISOString(),
  };
}

@Injectable()
export class DriverService {
  constructor(private readonly prisma: PrismaService) {}

  async createProfile(dto: CreateDriverProfileDto): Promise<DriverProfileResult> {
    const user = await this.prisma.user.findUnique({ where: { id: dto.userId } });
    if (!user) {
      throw new NotFoundException('User not found');
    }
    if (user.role !== Role.DRIVER) {
      throw new BadRequestException('User must have the DRIVER role to receive an operational profile');
    }

    const existing = await this.prisma.driverProfile.findUnique({ where: { userId: dto.userId } });
    if (existing) {
      throw new ConflictException('This user already has a driver profile');
    }

    const profile = await this.prisma.driverProfile.create({
      data: {
        userId: dto.userId,
        name: dto.name,
        vehicleCategory: dto.vehicleCategory ? vehicleCategoryToPrismaEnum[dto.vehicleCategory] : undefined,
        phone: dto.phone,
      },
      include: { user: true },
    });
    return toResult(profile);
  }

  async list(): Promise<DriverProfileResult[]> {
    const profiles = await this.prisma.driverProfile.findMany({ include: { user: true }, orderBy: { createdAt: 'desc' } });
    return profiles.map(toResult);
  }

  private async getRecord(id: string) {
    const profile = await this.prisma.driverProfile.findUnique({ where: { id }, include: { user: true } });
    if (!profile) {
      throw new NotFoundException('Driver profile not found');
    }
    return profile;
  }

  async getById(id: string): Promise<DriverProfileResult> {
    return toResult(await this.getRecord(id));
  }

  async listAssignable(vehicleCategory?: VehicleCategoryId): Promise<DriverProfileResult[]> {
    const profiles = await this.prisma.driverProfile.findMany({
      where: {
        status: DriverStatus.AVAILABLE,
        ...(vehicleCategory ? { vehicleCategory: vehicleCategoryToPrismaEnum[vehicleCategory] } : {}),
      },
      include: { user: true },
      orderBy: { createdAt: 'desc' },
    });
    return profiles.map(toResult);
  }

  async updateStatus(id: string, status: DriverStatus): Promise<DriverProfileResult> {
    if (status === DriverStatus.ON_RIDE) {
      throw new BadRequestException(
        'ON_RIDE is a system-managed status set automatically by ride assignment and cannot be set directly',
      );
    }
    await this.getRecord(id);
    const profile = await this.prisma.driverProfile.update({ where: { id }, data: { status }, include: { user: true } });
    return toResult(profile);
  }

  async updateProfile(id: string, dto: UpdateDriverProfileDto): Promise<DriverProfileResult> {
    await this.getRecord(id);
    const profile = await this.prisma.driverProfile.update({
      where: { id },
      data: {
        ...(dto.vehicleCategory !== undefined ? { vehicleCategory: vehicleCategoryToPrismaEnum[dto.vehicleCategory] } : {}),
        ...(dto.name !== undefined ? { name: dto.name } : {}),
        ...(dto.phone !== undefined ? { phone: dto.phone } : {}),
      },
      include: { user: true },
    });
    return toResult(profile);
  }
}
