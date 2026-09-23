import { ConflictException, Injectable, NotFoundException } from '@nestjs/common';
import { VehicleCategory as PrismaVehicleCategory } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { VehicleCategoryId } from '../fare/dto/calculate-fare.dto';
import { CreateVehicleContentDto } from './dto/create-vehicle-content.dto';
import { UpdateVehicleContentDto } from './dto/update-vehicle-content.dto';

const vehicleCategoryToPrismaEnum: Record<VehicleCategoryId, PrismaVehicleCategory> = {
  [VehicleCategoryId.SALOON]: PrismaVehicleCategory.SALOON,
  [VehicleCategoryId.ESTATE]: PrismaVehicleCategory.ESTATE,
  [VehicleCategoryId.MPV]: PrismaVehicleCategory.MPV,
  [VehicleCategoryId.EXECUTIVE]: PrismaVehicleCategory.EXECUTIVE,
  [VehicleCategoryId.EIGHT_SEATER]: PrismaVehicleCategory.EIGHT_SEATER,
};

@Injectable()
export class VehicleContentService {
  constructor(private readonly prisma: PrismaService) {}

  async create(dto: CreateVehicleContentDto) {
    const vehicleCategory = vehicleCategoryToPrismaEnum[dto.vehicleCategory];

    const existing = await this.prisma.vehicleContent.findUnique({ where: { vehicleCategory } });
    if (existing) {
      throw new ConflictException('Content for this vehicle category already exists — use update instead');
    }

    return this.prisma.vehicleContent.create({
      data: {
        vehicleCategory,
        title: dto.title,
        description: dto.description,
        imageUrls: dto.imageUrls ?? [],
        videoUrls: dto.videoUrls ?? [],
        active: dto.active ?? true,
      },
    });
  }

  async list() {
    return this.prisma.vehicleContent.findMany({ orderBy: { vehicleCategory: 'asc' } });
  }

  async getById(id: string) {
    const entry = await this.prisma.vehicleContent.findUnique({ where: { id } });
    if (!entry) {
      throw new NotFoundException('Vehicle content not found');
    }
    return entry;
  }

  async update(id: string, dto: UpdateVehicleContentDto) {
    await this.getById(id);
    return this.prisma.vehicleContent.update({ where: { id }, data: dto });
  }

  async delete(id: string) {
    await this.getById(id);
    await this.prisma.vehicleContent.delete({ where: { id } });
  }

  // --- Public read: only active entries ---

  async listActive() {
    return this.prisma.vehicleContent.findMany({ where: { active: true }, orderBy: { vehicleCategory: 'asc' } });
  }
}