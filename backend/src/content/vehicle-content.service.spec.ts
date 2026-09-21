import { ConflictException, NotFoundException } from '@nestjs/common';
import { VehicleCategory as PrismaVehicleCategory } from '@prisma/client';
import { VehicleContentService } from './vehicle-content.service';
import { VehicleCategoryId } from '../fare/dto/calculate-fare.dto';

function baseEntry(overrides: Partial<any> = {}) {
  return {
    id: 'vc-1',
    vehicleCategory: PrismaVehicleCategory.SALOON,
    title: 'Saloon',
    description: 'Comfortable saloon car',
    imageUrls: [],
    videoUrls: [],
    active: true,
    createdAt: new Date(),
    updatedAt: new Date(),
    ...overrides,
  };
}

describe('VehicleContentService', () => {
  let prisma: any;
  let service: VehicleContentService;

  beforeEach(() => {
    prisma = { vehicleContent: { create: jest.fn(), findUnique: jest.fn(), findMany: jest.fn(), update: jest.fn(), delete: jest.fn() } };
    service = new VehicleContentService(prisma);
  });

  it('creates content for a vehicle category', async () => {
    prisma.vehicleContent.findUnique.mockResolvedValue(null);
    prisma.vehicleContent.create.mockResolvedValue(baseEntry());

    await service.create({ vehicleCategory: VehicleCategoryId.SALOON, title: 'Saloon', description: 'x' } as any);

    expect(prisma.vehicleContent.create).toHaveBeenCalledWith(
      expect.objectContaining({ data: expect.objectContaining({ vehicleCategory: PrismaVehicleCategory.SALOON }) }),
    );
  });

  it('rejects creating a second entry for the same vehicle category', async () => {
    prisma.vehicleContent.findUnique.mockResolvedValue(baseEntry());
    await expect(
      service.create({ vehicleCategory: VehicleCategoryId.SALOON, title: 'Saloon', description: 'x' } as any),
    ).rejects.toThrow(ConflictException);
  });

  it('throws NotFoundException for an unknown id', async () => {
    prisma.vehicleContent.findUnique.mockResolvedValue(null);
    await expect(service.getById('missing')).rejects.toThrow(NotFoundException);
  });

  it('lists only active content for the public read path', async () => {
    prisma.vehicleContent.findMany.mockResolvedValue([]);
    await service.listActive();
    expect(prisma.vehicleContent.findMany).toHaveBeenCalledWith(
      expect.objectContaining({ where: { active: true } }),
    );
  });
});