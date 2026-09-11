import type { BookingRecord } from '../../models/booking';
import { vehicleCatalog } from '../../config/vehicles';
import styles from './BookingConfirmation.module.css';

interface BookingConfirmationProps {
  booking: BookingRecord;
  onStartNewBooking: () => void;
}

export function BookingConfirmation({ booking, onStartNewBooking }: BookingConfirmationProps) {
  const vehicle = vehicleCatalog.find((v) => v.id === booking.vehicleId);
  const finalAmount = booking.fare.finalAmount ?? booking.fare.amount;

  return (
    <div className={styles.wrapper}>
      <p className={styles.reference}>Booking reference: {booking.reference}</p>

      <dl className={styles.details}>
        <div><dt>Pickup</dt><dd>{booking.journey.pickup}</dd></div>
        <div><dt>Destination</dt><dd>{booking.journey.dropoff}</dd></div>
        <div><dt>Date</dt><dd>{booking.journey.date}</dd></div>
        <div><dt>Time</dt><dd>{booking.journey.time}</dd></div>
        <div><dt>Vehicle</dt><dd>{vehicle?.name}</dd></div>
        <div><dt>Fare</dt><dd>£{finalAmount.toFixed(2)}</dd></div>
        <div><dt>Payment status</dt><dd>{booking.payment.status}</dd></div>
      </dl>

      <p className={styles.note}>
        A confirmation will also be sent to you once messaging integration is connected. If you need to
        make changes, contact human support with your booking reference.
      </p>

      <button type="button" className={styles.newBookingButton} onClick={onStartNewBooking}>Make another booking</button>
    </div>
  );
}
