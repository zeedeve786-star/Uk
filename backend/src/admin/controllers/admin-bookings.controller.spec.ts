import { BookingStatus, Role } from '@prisma/client';
import { AdminBookingsController } from './admin-bookings.controller';

describe('AdminBookingsController', () => {
  it('updates booking status and records an audit entry', async () => {
    const bookingService = {
      listBookings: jest.fn(),
      getBookingByReference: jest.fn(),
      updateBookingStatus: jest
        .fn()
        .mockResolvedValue({
          bookingReference: 'BK-1',
          bookingStatus: BookingStatus.CONFIRMED,
        }),
    };

    const audit = { record: jest.fn() };

    const controller = new AdminBookingsController(
      bookingService as any,
      audit as any,
    );

    const actor = {
      id: 'admin-1',
      email: 'a@a.com',
      role: Role.ADMIN,
      isMasterAdmin: false,
      adminPermissions: [],
    };

    const result = await controller.updateStatus(
      'BK-1',
      { bookingStatus: BookingStatus.CONFIRMED },
      actor,
    );

    expect(bookingService.updateBookingStatus).toHaveBeenCalledWith(
      'BK-1',
      BookingStatus.CONFIRMED,
    );
    expect(audit.record).toHaveBeenCalledWith(
      'admin-1',
      'UPDATE_BOOKING_STATUS',
      'Booking',
      'BK-1',
      expect.any(Object),
    );
    expect(result.bookingStatus).toBe(BookingStatus.CONFIRMED);
  });
});
