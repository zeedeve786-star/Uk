import { useParams } from 'react-router-dom';
import { useState } from 'react';
import { useAsyncData } from '../hooks/useAsyncData';
import { bookingsApi } from '../api/adminService';
import { Card } from '../ui/Card';
import { Select } from '../ui/Input';
import { Button } from '../ui/Button';
import { Alert } from '../ui/Alert';
import { Badge } from '../ui/Badge';
import type { AdminBookingRow } from '../models';
import styles from './BookingDetailPage.module.css';

const STATUS_OPTIONS: AdminBookingRow['bookingStatus'][] = [
  'PENDING',
  'CONFIRMED',
  'CANCELLED',
  'COMPLETED',
];

export function BookingDetailPage() {
  const { reference } = useParams<{ reference: string }>();

  const { data: booking, status, setData } = useAsyncData(
    () => bookingsApi.getOne(reference!),
    [reference],
  );

  const [updating, setUpdating] = useState(false);

  const [feedback, setFeedback] = useState<{
    tone: 'success' | 'error';
    message: string;
  } | null>(null);

  if (status === 'loading') {
    return <p>Loading…</p>;
  }

  if (status === 'forbidden') {
    return (
      <Alert tone="error">
        You do not have permission to view this booking.
      </Alert>
    );
  }

  if (status === 'error' || !booking) {
    return <Alert tone="error">Booking not found.</Alert>;
  }

  async function handleStatusChange(
    bookingReference: string,
    newStatus: AdminBookingRow['bookingStatus'],
  ) {
    setUpdating(true);
    setFeedback(null);

    try {
      const updated = await bookingsApi.updateStatus(
        bookingReference,
        newStatus,
      );

      setData(updated);

      setFeedback({
        tone: 'success',
        message: 'Booking status updated.',
      });
    } catch {
      setFeedback({
        tone: 'error',
        message: 'Failed to update booking status.',
      });
    } finally {
      setUpdating(false);
    }
  }

  return (
    <div className={styles.wrapper}>
      <h1 className={styles.heading}>
        Booking {booking.bookingReference}
      </h1>

      {feedback && (
        <Alert tone={feedback.tone}>
          {feedback.message}
        </Alert>
      )}

      <Card>
        <dl className={styles.details}>
          <div>
            <dt>Customer</dt>
            <dd>
              {booking.customerName} · {booking.customerEmail} ·{' '}
              {booking.customerPhone}
            </dd>
          </div>

          <div>
            <dt>Journey</dt>
            <dd>
              {booking.pickup} → {booking.destination}
            </dd>
          </div>

          <div>
            <dt>Date/time</dt>
            <dd>
              {booking.journeyDate} {booking.journeyTime}
            </dd>
          </div>

          <div>
            <dt>Passengers</dt>
            <dd>{booking.passengerCount}</dd>
          </div>

          <div>
            <dt>Vehicle</dt>
            <dd>{booking.vehicleCategory}</dd>
          </div>

          <div>
            <dt>Original fare</dt>
            <dd>
              £{(booking.originalFarePence / 100).toFixed(2)}
            </dd>
          </div>

          <div>
            <dt>Discount</dt>
            <dd>{booking.discountCode ?? 'None'}</dd>
          </div>

          <div>
            <dt>Final fare</dt>
            <dd>
              £{(booking.finalFarePence / 100).toFixed(2)}
            </dd>
          </div>

          <div>
            <dt>Payment status</dt>
            <dd>
              <Badge
                tone={
                  booking.paymentStatus === 'PAID'
                    ? 'success'
                    : 'neutral'
                }
              >
                {booking.paymentStatus}
              </Badge>
            </dd>
          </div>
        </dl>
      </Card>

      <Card className={styles.statusCard}>
        <p className={styles.statusLabel}>Booking status</p>

        <div className={styles.statusRow}>
          <Select
            value={booking.bookingStatus}
            onChange={() => undefined}
            disabled
          >
            {STATUS_OPTIONS.map((statusOption) => (
              <option key={statusOption} value={statusOption}>
                {statusOption}
              </option>
            ))}
          </Select>

          <div className={styles.statusButtons}>
            {STATUS_OPTIONS
              .filter((statusOption) => statusOption !== booking.bookingStatus)
              .map((statusOption) => (
                <Button
                  key={statusOption}
                  variant="secondary"
                  disabled={updating}
                  onClick={() =>
                    handleStatusChange(
                      booking.bookingReference,
                      statusOption,
                    )
                  }
                >
                  Set {statusOption}
                </Button>
              ))}
          </div>
        </div>
      </Card>
    </div>
  );
}