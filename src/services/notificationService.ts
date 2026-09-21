import type { BookingRecord } from '../models/booking';

export async function notifyBookingCreated(
  booking: BookingRecord,
): Promise<void> {
  await new Promise((resolve) => setTimeout(resolve, 200));

  console.info('Booking notification:', booking.reference);
}