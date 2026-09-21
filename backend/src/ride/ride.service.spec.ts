import { BadRequestException, ConflictException, NotFoundException } from '@nestjs/common';
import { RideStatus, DriverStatus, BookingStatus, PaymentStatus } from '@prisma/client';
import { RideService } from './ride.service';

function baseBooking(overrides: Partial<any> = {}) {
  return {
    id: 'booking-1', bookingReference: 'BK-TESTREF-0001', pickup: 'A', destination: 'B',
    extraStops: [], journeyDate: new Date('2026-01-01'), journeyTime: '14:30',
    customerName: 'Jane Doe', customerEmail: 'jane@example.com', customerPhone: '+447000000000',
    passengerCount: 2, vehicleCategory: 'SALOON', finalFarePence: 2300, currency: 'GBP',
    paymentStatus: PaymentStatus.PAID, bookingStatus: BookingStatus.CONFIRMED, ...overrides,
  };
}

function baseRide(overrides: Partial<any> = {}) {
  return {
    id: 'ride-1', rideReference: 'RD-TESTREF-0001', bookingId: 'booking-1', driverId: null,
    status: RideStatus.SCHEDULED, operationalNotes: null,
    createdAt: new Date(), updatedAt: new Date(), booking: baseBooking(), ...overrides,
  };
}

function baseDriver(overrides: Partial<any> = {}) {
  return { id: 'driver-1', userId: 'user-1', status: DriverStatus.AVAILABLE, vehicleCategory: null, phone: null, ...overrides };
}

describe('RideService', () => {
  let prisma: any;
  let notificationService: { notify: jest.Mock };
  let service: RideService;

  beforeEach(() => {
    prisma = {
      booking: { findUnique: jest.fn() },
      ride: { findUnique: jest.fn(), findMany: jest.fn(), create: jest.fn(), update: jest.fn() },
      driverProfile: { findUnique: jest.fn(), update: jest.fn().mockResolvedValue({}) },
      $transaction: jest.fn((callback: any) => callback(prisma)),
    };
    notificationService = { notify: jest.fn() };
    service = new RideService(
      prisma,
      notificationService as any,
      {
        calculateDriverEarning: jest.fn().mockResolvedValue({
          driverEarningPence: 0,
          companyChargePence: 0,
          source: 'FARE_CONFIGURATION:NONE',
        }),
      } as any,
    );
  });

  it('creates a ride from an existing, non-cancelled booking', async () => {
    prisma.booking.findUnique.mockResolvedValue(baseBooking());
    prisma.ride.findUnique.mockResolvedValue(null);
    prisma.ride.create.mockResolvedValue(baseRide());

    const result = await service.createFromBooking({ bookingReference: 'BK-TESTREF-0001' });
    expect(result.rideReference).toBe('RD-TESTREF-0001');
  });

  it('rejects creating a ride for an unknown booking', async () => {
    prisma.booking.findUnique.mockResolvedValue(null);
    await expect(service.createFromBooking({ bookingReference: 'BK-UNKNOWN' })).rejects.toThrow(NotFoundException);
  });

  it('rejects creating a ride for a cancelled booking', async () => {
    prisma.booking.findUnique.mockResolvedValue(baseBooking({ bookingStatus: BookingStatus.CANCELLED }));
    await expect(service.createFromBooking({ bookingReference: 'BK-TESTREF-0001' })).rejects.toThrow(BadRequestException);
  });

  it('rejects creating a second ride for a booking that already has one', async () => {
    prisma.booking.findUnique.mockResolvedValue(baseBooking());
    prisma.ride.findUnique.mockResolvedValue(baseRide());
    await expect(service.createFromBooking({ bookingReference: 'BK-TESTREF-0001' })).rejects.toThrow(ConflictException);
  });

  it('allows a valid status transition and notifies the customer', async () => {
    prisma.ride.findUnique.mockResolvedValue(baseRide({ status: RideStatus.SCHEDULED }));
    prisma.ride.update.mockResolvedValue(baseRide({ status: RideStatus.IN_PROGRESS }));

    const result = await service.updateStatus('RD-TESTREF-0001', RideStatus.IN_PROGRESS);

    expect(result.status).toBe(RideStatus.IN_PROGRESS);
    expect(notificationService.notify).toHaveBeenCalledWith(
      expect.objectContaining({ type: 'RIDE_STATUS_CHANGED', recipientContact: 'jane@example.com' }),
    );
  });

  it('rejects an invalid status transition and does not notify', async () => {
    prisma.ride.findUnique.mockResolvedValue(baseRide({ status: RideStatus.SCHEDULED }));
    await expect(service.updateStatus('RD-TESTREF-0001', RideStatus.COMPLETED)).rejects.toThrow(BadRequestException);
    expect(notificationService.notify).not.toHaveBeenCalled();
  });

  it('rejects any transition attempt on a terminal ride', async () => {
    prisma.ride.findUnique.mockResolvedValue(baseRide({ status: RideStatus.COMPLETED }));
    await expect(service.updateStatus('RD-TESTREF-0001', RideStatus.IN_PROGRESS)).rejects.toThrow(BadRequestException);
  });

  it('releases the assigned driver back to AVAILABLE when a ride completes', async () => {
    prisma.ride.findUnique.mockResolvedValue(baseRide({ status: RideStatus.IN_PROGRESS, driverId: 'driver-1' }));
    prisma.ride.update.mockResolvedValue(baseRide({ status: RideStatus.COMPLETED, driverId: 'driver-1' }));
    prisma.driverProfile.update.mockResolvedValue(baseDriver({ status: DriverStatus.AVAILABLE }));

    await service.updateStatus('RD-TESTREF-0001', RideStatus.COMPLETED);

    expect(prisma.driverProfile.update).toHaveBeenCalledWith({ where: { id: 'driver-1' }, data: { status: DriverStatus.AVAILABLE } });
  });

  it('throws NotFoundException for an unknown ride reference', async () => {
    prisma.ride.findUnique.mockResolvedValue(null);
    await expect(service.getByReference('RD-UNKNOWN')).rejects.toThrow(NotFoundException);
  });

  it('assigns an available driver, marks them ON_RIDE, and sends a DRIVER_ASSIGNED notification', async () => {
    prisma.ride.findUnique.mockResolvedValue(baseRide({ status: RideStatus.SCHEDULED, driverId: null }));
    prisma.driverProfile.findUnique.mockResolvedValue(baseDriver({ status: DriverStatus.AVAILABLE }));
    prisma.ride.update.mockResolvedValue(baseRide({ driverId: 'driver-1' }));

    const result = await service.assignDriver('RD-TESTREF-0001', { driverId: 'driver-1' });

    expect(result.driverId).toBe('driver-1');
    expect(notificationService.notify).toHaveBeenCalledWith(
      expect.objectContaining({ type: 'DRIVER_ASSIGNED', recipientType: 'DRIVER', recipientUserId: 'user-1' }),
    );
  });

  it('does not send a DRIVER_ASSIGNED notification when unassigning', async () => {
    prisma.ride.findUnique.mockResolvedValue(baseRide({ status: RideStatus.SCHEDULED, driverId: 'driver-1' }));
    prisma.ride.update.mockResolvedValue(baseRide({ driverId: null }));

    await service.assignDriver('RD-TESTREF-0001', {});

    expect(notificationService.notify).not.toHaveBeenCalled();
  });

  it('does not send a duplicate DRIVER_ASSIGNED notification when reassigning the same driver', async () => {
    prisma.ride.findUnique.mockResolvedValue(baseRide({ status: RideStatus.SCHEDULED, driverId: 'driver-1' }));
    prisma.driverProfile.findUnique.mockResolvedValue(baseDriver({ id: 'driver-1', status: DriverStatus.ON_RIDE }));
    prisma.ride.update.mockResolvedValue(baseRide({ driverId: 'driver-1' }));

    await service.assignDriver('RD-TESTREF-0001', { driverId: 'driver-1' });

    expect(notificationService.notify).not.toHaveBeenCalled();
  });

  it('rejects assigning a driver who does not exist', async () => {
    prisma.ride.findUnique.mockResolvedValue(baseRide({ status: RideStatus.SCHEDULED }));
    prisma.driverProfile.findUnique.mockResolvedValue(null);
    await expect(service.assignDriver('RD-TESTREF-0001', { driverId: 'missing-driver' })).rejects.toThrow(NotFoundException);
  });

  it('rejects assigning a driver who is already on another active ride', async () => {
    prisma.ride.findUnique.mockResolvedValue(baseRide({ status: RideStatus.SCHEDULED, driverId: null }));
    prisma.driverProfile.findUnique.mockResolvedValue(baseDriver({ id: 'driver-2', status: DriverStatus.ON_RIDE }));
    await expect(service.assignDriver('RD-TESTREF-0001', { driverId: 'driver-2' })).rejects.toThrow(ConflictException);
  });

  it('rejects driver reassignment on a completed ride', async () => {
    prisma.ride.findUnique.mockResolvedValue(baseRide({ status: RideStatus.COMPLETED }));
    await expect(service.assignDriver('RD-TESTREF-0001', { driverId: 'driver-1' })).rejects.toThrow(BadRequestException);
  });

  it('exposes payment status from the related Booking without duplicating it', async () => {
    prisma.ride.findUnique.mockResolvedValue(baseRide({ booking: baseBooking({ paymentStatus: PaymentStatus.PAID }) }));
    const result = await service.getByReference('RD-TESTREF-0001');
    expect(result.booking.paymentStatus).toBe(PaymentStatus.PAID);
  });
});
