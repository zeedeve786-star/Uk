import { Role } from '@prisma/client';
import { AdminAvailabilityController } from './admin-availability.controller';

describe('AdminAvailabilityController', () => {
  it('creates a block and records an audit entry', async () => {
    const availabilityService = {
      createBlock: jest.fn().mockResolvedValue({
        id: 'block-1',
        vehicleCategory: 'saloon',
      }),
    } as any;

    const audit = { record: jest.fn() };

    const controller = new AdminAvailabilityController(
      availabilityService,
      audit as any,
    );

    const actor = {
      id: 'admin-1',
      email: 'a@a.com',
      role: Role.ADMIN,
      isMasterAdmin: true,
      adminPermissions: [],
    };

    const result = await controller.createBlock(
      { vehicleCategory: 'saloon' } as any,
      actor,
    );

    expect(availabilityService.createBlock).toHaveBeenCalled();
    expect(audit.record).toHaveBeenCalledWith(
      'admin-1',
      'CREATE_AVAILABILITY_BLOCK',
      'AvailabilityBlock',
      'block-1',
      expect.any(Object),
    );
    expect(result.id).toBe('block-1');
  });

  it('runs a check without recording an audit entry', async () => {
    const availabilityService = {
      checkAvailability: jest.fn().mockResolvedValue({ available: true }),
    } as any;

    const audit = { record: jest.fn() };

    const controller = new AdminAvailabilityController(
      availabilityService,
      audit as any,
    );

    const result = await controller.check({
      vehicleCategory: 'saloon',
      date: '2026-03-01',
      time: '10:00',
    } as any);

    expect(availabilityService.checkAvailability).toHaveBeenCalled();
    expect(audit.record).not.toHaveBeenCalled();
    expect(result.available).toBe(true);
  });

  it('records an audit entry on delete', async () => {
    const availabilityService = {
      deleteBlock: jest.fn().mockResolvedValue(undefined),
    } as any;

    const audit = { record: jest.fn() };

    const controller = new AdminAvailabilityController(
      availabilityService,
      audit as any,
    );

    const actor = {
      id: 'admin-1',
      email: 'a@a.com',
      role: Role.ADMIN,
      isMasterAdmin: true,
      adminPermissions: [],
    };

    await controller.deleteBlock('block-1', actor);

    expect(availabilityService.deleteBlock).toHaveBeenCalledWith('block-1');
    expect(audit.record).toHaveBeenCalledWith(
      'admin-1',
      'DELETE_AVAILABILITY_BLOCK',
      'AvailabilityBlock',
      'block-1',
    );
  });
});
