import { RideStatus, Role } from '@prisma/client';
import { AdminRidesController } from './admin-rides.controller';

describe('AdminRidesController', () => {
  it('creates a ride and records an audit entry', async () => {
    const rideService = { createFromBooking: jest.fn().mockResolvedValue({ rideReference: 'RD-1' }) } as any;
    const audit = { record: jest.fn() };
    const controller = new AdminRidesController(rideService, audit as any);
    const actor = { id: 'admin-1', email: 'a@a.com', role: Role.ADMIN, isMasterAdmin: true, adminPermissions: [] };

    const result = await controller.create({ bookingReference: 'BK-1' } as any, actor);

    expect(rideService.createFromBooking).toHaveBeenCalledWith({ bookingReference: 'BK-1' });
    expect(audit.record).toHaveBeenCalledWith('admin-1', 'CREATE_RIDE', 'Ride', 'RD-1', expect.any(Object));
    expect(result.rideReference).toBe('RD-1');
  });

  it('updates ride status and records an audit entry', async () => {
    const rideService = { updateStatus: jest.fn().mockResolvedValue({ rideReference: 'RD-1', status: RideStatus.IN_PROGRESS }) } as any;
    const audit = { record: jest.fn() };
    const controller = new AdminRidesController(rideService, audit as any);
    const actor = { id: 'admin-1', email: 'a@a.com', role: Role.ADMIN, isMasterAdmin: true, adminPermissions: [] };

    await controller.updateStatus('RD-1', { status: RideStatus.IN_PROGRESS }, actor);

    expect(rideService.updateStatus).toHaveBeenCalledWith('RD-1', RideStatus.IN_PROGRESS);
    expect(audit.record).toHaveBeenCalledWith('admin-1', 'UPDATE_RIDE_STATUS', 'Ride', 'RD-1', { status: RideStatus.IN_PROGRESS });
  });
});