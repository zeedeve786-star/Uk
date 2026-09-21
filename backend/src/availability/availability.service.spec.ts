import { BadRequestException, NotFoundException } from '@nestjs/common';
import { VehicleCategory as PrismaVehicleCategory, BookingStatus } from '@prisma/client';
import { AvailabilityService } from './availability.service';
import { VehicleCategoryId } from '../fare/dto/calculate-fare.dto';

function baseBlock(overrides: Partial<any> = {}) {
  return {
    id: 'block-1',
    vehicleCategory: PrismaVehicleCategory.SALOON,
    startsAt: new Date('2026-02-01T00:00:00.000Z'),
    endsAt: new Date('2026-02-02T00:00:00.000Z'),
    reason: 'Maintenance',
    createdAt: new Date(),
    updatedAt: new Date(),
    ...overrides,
  };
}

describe('AvailabilityService', () => {
  let prisma: any;
  let service: AvailabilityService;

  beforeEach(() => {
    prisma = {
      availabilityBlock: {
        create: jest.fn(),
        findMany: jest.fn(),
        findUnique: jest.fn(),
        delete: jest.fn(),
      },
      booking: {
        findMany: jest.fn(),
      },
    };

    service = new AvailabilityService(prisma);
  });

  it('creates a valid availability block', async () => {
    prisma.availabilityBlock.create.mockResolvedValue(baseBlock());

    const result = await service.createBlock({
      vehicleCategory: VehicleCategoryId.SALOON,
      startsAt: '2026-02-01T00:00:00.000Z',
      endsAt: '2026-02-02T00:00:00.000Z',
      reason: 'Maintenance',
    });

    expect(result.reason).toBe('Maintenance');
  });

  it('rejects a block where endsAt is before startsAt', async () => {
    await expect(
      service.createBlock({
        vehicleCategory: VehicleCategoryId.SALOON,
        startsAt: '2026-02-02T00:00:00.000Z',
        endsAt: '2026-02-01T00:00:00.000Z',
      }),
    ).rejects.toThrow(BadRequestException);

    expect(prisma.availabilityBlock.create).not.toHaveBeenCalled();
  });

  it('rejects a block where endsAt equals startsAt', async () => {
    await expect(
      service.createBlock({
        vehicleCategory: VehicleCategoryId.SALOON,
        startsAt: '2026-02-01T00:00:00.000Z',
        endsAt: '2026-02-01T00:00:00.000Z',
      }),
    ).rejects.toThrow(BadRequestException);
  });

  it('lists blocks ordered by start time', async () => {
    prisma.availabilityBlock.findMany.mockResolvedValue([]);

    await service.listBlocks();

    expect(prisma.availabilityBlock.findMany).toHaveBeenCalledWith({
      orderBy: { startsAt: 'asc' },
    });
  });

  it('throws NotFoundException when deleting an unknown block', async () => {
    prisma.availabilityBlock.findUnique.mockResolvedValue(null);

    await expect(service.deleteBlock('missing')).rejects.toThrow(NotFoundException);
  });

  it('reports available when there are no blocks or bookings for the slot', async () => {
    prisma.availabilityBlock.findMany.mockResolvedValue([]);
    prisma.booking.findMany.mockResolvedValue([]);

    const result = await service.checkAvailability({
      vehicleCategory: VehicleCategoryId.SALOON,
      date: '2026-03-01',
      time: '10:00',
    });

    expect(result.available).toBe(true);
    expect(result.conflictingBlocks).toHaveLength(0);
    expect(result.conflictingBookings).toHaveLength(0);
  });

  it('reports unavailable when the target falls inside an admin block', async () => {
    prisma.availabilityBlock.findMany.mockResolvedValue([baseBlock()]);
    prisma.booking.findMany.mockResolvedValue([]);

    const result = await service.checkAvailability({
      vehicleCategory: VehicleCategoryId.SALOON,
      date: '2026-02-01',
      time: '12:00',
    });

    expect(result.available).toBe(false);
    expect(result.conflictingBlocks).toHaveLength(1);
  });

  it('reports unavailable on an exact date+time+category booking collision', async () => {
    prisma.availabilityBlock.findMany.mockResolvedValue([]);
    prisma.booking.findMany.mockResolvedValue([
      {
        bookingReference: 'BK-1',
        journeyDate: new Date('2026-03-01T00:00:00.000Z'),
        journeyTime: '10:00',
        bookingStatus: BookingStatus.CONFIRMED,
      },
    ]);

    const result = await service.checkAvailability({
      vehicleCategory: VehicleCategoryId.SALOON,
      date: '2026-03-01',
      time: '10:00',
    });

    expect(result.available).toBe(false);
    expect(result.conflictingBookings).toHaveLength(1);
  });

  it('excludes cancelled bookings from the conflict query', async () => {
    prisma.availabilityBlock.findMany.mockResolvedValue([]);
    prisma.booking.findMany.mockResolvedValue([]);

    await service.checkAvailability({
      vehicleCategory: VehicleCategoryId.SALOON,
      date: '2026-03-01',
      time: '10:00',
    });

    expect(prisma.booking.findMany).toHaveBeenCalledWith(
      expect.objectContaining({
        where: expect.objectContaining({
          bookingStatus: { not: 'CANCELLED' },
        }),
      }),
    );
  });
});
