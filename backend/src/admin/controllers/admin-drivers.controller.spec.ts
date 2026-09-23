import { DriverStatus, Role } from '@prisma/client';
import { AdminDriversController } from './admin-drivers.controller';

describe('AdminDriversController', () => {
  it('creates a driver profile and records an audit entry', async () => {
    const driverService = { createProfile: jest.fn().mockResolvedValue({ id: 'driver-1' }) } as any;
    const audit = { record: jest.fn() };
    const controller = new AdminDriversController(driverService, audit as any);
    const actor = { id: 'admin-1', email: 'a@a.com', role: Role.ADMIN, isMasterAdmin: true, adminPermissions: [] };

    const result = await controller.create({ userId: 'user-1' } as any, actor);

    expect(driverService.createProfile).toHaveBeenCalledWith({ userId: 'user-1' });
    expect(audit.record).toHaveBeenCalledWith('admin-1', 'CREATE_DRIVER_PROFILE', 'DriverProfile', 'driver-1', { userId: 'user-1' });
    expect(result.id).toBe('driver-1');
  });

  it('updates driver status and records an audit entry', async () => {
    const driverService = { updateStatus: jest.fn().mockResolvedValue({ id: 'driver-1', status: DriverStatus.AVAILABLE }) } as any;
    const audit = { record: jest.fn() };
    const controller = new AdminDriversController(driverService, audit as any);
    const actor = { id: 'admin-1', email: 'a@a.com', role: Role.ADMIN, isMasterAdmin: true, adminPermissions: [] };

    await controller.updateStatus('driver-1', { status: DriverStatus.AVAILABLE }, actor);

    expect(driverService.updateStatus).toHaveBeenCalledWith('driver-1', DriverStatus.AVAILABLE);
    expect(audit.record).toHaveBeenCalledWith('admin-1', 'UPDATE_DRIVER_STATUS', 'DriverProfile', 'driver-1', { status: DriverStatus.AVAILABLE });
  });
});
