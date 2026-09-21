import { BadRequestException, ConflictException, NotFoundException } from '@nestjs/common';
import { DriverStatus, Role, VehicleCategory as PrismaVehicleCategory } from '@prisma/client';
import { DriverService } from './driver.service';
import { VehicleCategoryId } from '../fare/dto/calculate-fare.dto';

function baseUser(overrides: Partial<any> = {}) {
  return { id: 'user-1', email: 'driver@example.com', role: Role.DRIVER, ...overrides };
}

function baseProfile(overrides: Partial<any> = {}) {
  return {
    id: 'driver-1', userId: 'user-1', status: DriverStatus.OFFLINE,
    vehicleCategory: null, phone: null, createdAt: new Date(), updatedAt: new Date(),
    user: baseUser(), ...overrides,
  };
}

describe('DriverService', () => {
  let prisma: any;
  let service: DriverService;

  beforeEach(() => {
    prisma = {
      user: { findUnique: jest.fn() },
      driverProfile: { findUnique: jest.fn(), findMany: jest.fn(), create: jest.fn(), update: jest.fn() },
    };
    service = new DriverService(prisma);
  });

  it('creates a profile for an existing user with the DRIVER role', async () => {
    prisma.user.findUnique.mockResolvedValue(baseUser());
    prisma.driverProfile.findUnique.mockResolvedValue(null);
    prisma.driverProfile.create.mockResolvedValue(baseProfile());

    const result = await service.createProfile({ userId: 'user-1' });
    expect(result.userId).toBe('user-1');
    expect(result.email).toBe('driver@example.com');
  });

  it('rejects creating a profile for a non-existent user', async () => {
    prisma.user.findUnique.mockResolvedValue(null);
    await expect(service.createProfile({ userId: 'missing' })).rejects.toThrow(NotFoundException);
  });

  it('rejects creating a profile for a user without the DRIVER role', async () => {
    prisma.user.findUnique.mockResolvedValue(baseUser({ role: Role.CUSTOMER }));
    await expect(service.createProfile({ userId: 'user-1' })).rejects.toThrow(BadRequestException);
  });

  it('rejects creating a duplicate profile for the same user', async () => {
    prisma.user.findUnique.mockResolvedValue(baseUser());
    prisma.driverProfile.findUnique.mockResolvedValue(baseProfile());
    await expect(service.createProfile({ userId: 'user-1' })).rejects.toThrow(ConflictException);
  });

  it('maps vehicleCategory correctly on create', async () => {
    prisma.user.findUnique.mockResolvedValue(baseUser());
    prisma.driverProfile.findUnique.mockResolvedValue(null);
    prisma.driverProfile.create.mockResolvedValue(baseProfile({ vehicleCategory: PrismaVehicleCategory.SALOON }));

    const result = await service.createProfile({ userId: 'user-1', vehicleCategory: VehicleCategoryId.SALOON });
    expect(prisma.driverProfile.create).toHaveBeenCalledWith(
      expect.objectContaining({ data: expect.objectContaining({ vehicleCategory: PrismaVehicleCategory.SALOON }) }),
    );
    expect(result.vehicleCategory).toBe(VehicleCategoryId.SALOON);
  });

  it('throws NotFoundException for an unknown profile id', async () => {
    prisma.driverProfile.findUnique.mockResolvedValue(null);
    await expect(service.getById('missing')).rejects.toThrow(NotFoundException);
  });

  it('rejects directly setting status to ON_RIDE', async () => {
    await expect(service.updateStatus('driver-1', DriverStatus.ON_RIDE)).rejects.toThrow(BadRequestException);
    expect(prisma.driverProfile.update).not.toHaveBeenCalled();
  });

  it('allows setting status to AVAILABLE', async () => {
    prisma.driverProfile.findUnique.mockResolvedValue(baseProfile());
    prisma.driverProfile.update.mockResolvedValue(baseProfile({ status: DriverStatus.AVAILABLE }));

    const result = await service.updateStatus('driver-1', DriverStatus.AVAILABLE);
    expect(result.status).toBe(DriverStatus.AVAILABLE);
  });

  it('lists only AVAILABLE drivers for assignment', async () => {
    prisma.driverProfile.findMany.mockResolvedValue([]);
    await service.listAssignable();
    expect(prisma.driverProfile.findMany).toHaveBeenCalledWith(
      expect.objectContaining({ where: { status: DriverStatus.AVAILABLE } }),
    );
  });

  it('filters assignable drivers by vehicle category when provided', async () => {
    prisma.driverProfile.findMany.mockResolvedValue([]);
    await service.listAssignable(VehicleCategoryId.MPV);
    expect(prisma.driverProfile.findMany).toHaveBeenCalledWith(
      expect.objectContaining({ where: { status: DriverStatus.AVAILABLE, vehicleCategory: PrismaVehicleCategory.MPV } }),
    );
  });

  it('updates profile phone without touching vehicleCategory when omitted', async () => {
    prisma.driverProfile.findUnique.mockResolvedValue(baseProfile());
    prisma.driverProfile.update.mockResolvedValue(baseProfile({ phone: '+447111111111' }));

    await service.updateProfile('driver-1', { phone: '+447111111111' });
    expect(prisma.driverProfile.update).toHaveBeenCalledWith({
      where: { id: 'driver-1' },
      data: { phone: '+447111111111' },
      include: { user: true },
    });
  });
});
