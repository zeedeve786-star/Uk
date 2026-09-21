import { useParams } from 'react-router-dom';
import { useEffect, useState } from 'react';
import { useAsyncData } from '../hooks/useAsyncData';
import { ridesApi } from '../api/rideService';
import { AdminApiError } from '../api/adminHttpClient';
import { driversApi } from '../api/driverService';
import { Card } from '../ui/Card';
import { Badge } from '../ui/Badge';
import { Button } from '../ui/Button';
import { Alert } from '../ui/Alert';
import { Field, Select } from '../ui/Input';
import type { RideRow, RideStatus, DriverProfileRow, VehicleCategoryId } from '../models';
import styles from './RideDetailPage.module.css';

const NEXT_STATUS_OPTIONS: Record<RideStatus, RideStatus[]> = {
  SCHEDULED: ['IN_PROGRESS', 'CANCELLED'],
  IN_PROGRESS: ['COMPLETED', 'CANCELLED'],
  COMPLETED: [],
  CANCELLED: [],
};

export function RideDetailPage() {
  const { reference } = useParams<{ reference: string }>();
  const { data: ride, status, setData } = useAsyncData(() => ridesApi.getOne(reference!), [reference]);
  const [updating, setUpdating] = useState(false);
  const [feedback, setFeedback] = useState<{ tone: 'success' | 'error'; message: string } | null>(null);

  const [assignableDrivers, setAssignableDrivers] = useState<DriverProfileRow[]>([]);
  const [currentDriver, setCurrentDriver] = useState<DriverProfileRow | null>(null);
  const [selectedDriverId, setSelectedDriverId] = useState('');

  useEffect(() => {
    if (!ride) return;
    const category = ride.booking.vehicleCategory.toLowerCase() as VehicleCategoryId;
    driversApi.listAssignable(category).then(setAssignableDrivers).catch(() => setAssignableDrivers([]));

    if (ride.driverId) {
      driversApi.getOne(ride.driverId).then(setCurrentDriver).catch(() => setCurrentDriver(null));
      setSelectedDriverId(ride.driverId);
    } else {
      setCurrentDriver(null);
      setSelectedDriverId('');
    }
  }, [ride?.rideReference, ride?.driverId]);

  if (status === 'loading') return <p>Loading…</p>;
  if (status === 'forbidden') return <Alert tone="error">You do not have permission to view this ride.</Alert>;
  if (status === 'error' || !ride) return <Alert tone="error">Ride not found.</Alert>;

  async function handleStatusChange(nextStatus: RideStatus) {
    setUpdating(true);
    setFeedback(null);
    try {
      const updated = await ridesApi.updateStatus(ride!.rideReference, nextStatus);
      setData(updated);
      setFeedback({ tone: 'success', message: `Ride status updated to ${nextStatus}.` });
    } catch (error) {
      setFeedback({
        tone: 'error',
        message:
          error instanceof AdminApiError
            ? `Status update failed (${error.status}): ${error.message}`
            : 'Failed to update ride status.',
      });
    } finally {
      setUpdating(false);
    }
  }

  async function handleAssignDriver(e: React.FormEvent) {
    e.preventDefault();
    setUpdating(true);
    setFeedback(null);
    try {
      const updated = await ridesApi.assignDriver(ride!.rideReference, selectedDriverId || null);
      setData(updated);
      setFeedback({ tone: 'success', message: 'Driver assignment updated.' });
    } catch (error) {
      setFeedback({
        tone: 'error',
        message:
          error instanceof AdminApiError
            ? `Driver assignment failed (${error.status}): ${error.message}`
            : 'Failed to update driver assignment.',
      });
    } finally {
      setUpdating(false);
    }
  }

  const nextOptions = NEXT_STATUS_OPTIONS[ride.status];
  const driverOptions =
    currentDriver && !assignableDrivers.some((d) => d.id === currentDriver.id)
      ? [currentDriver, ...assignableDrivers]
      : assignableDrivers;

  return (
    <div className={styles.wrapper}>
      <h1 className={styles.heading}>Ride {ride.rideReference}</h1>
      {feedback && <Alert tone={feedback.tone}>{feedback.message}</Alert>}

      <Card>
        <dl className={styles.details}>
          <div><dt>Booking</dt><dd>{ride.booking.bookingReference}</dd></div>
          <div><dt>Customer</dt><dd>{ride.booking.customerName}</dd></div>
          <div><dt>Journey</dt><dd>{ride.booking.pickup} → {ride.booking.destination}</dd></div>
          <div><dt>Date/time</dt><dd>{ride.booking.journeyDate} {ride.booking.journeyTime}</dd></div>
          <div><dt>Vehicle</dt><dd>{ride.booking.vehicleCategory}</dd></div>
          <div><dt>Fare</dt><dd>£{(ride.booking.finalFarePence / 100).toFixed(2)}</dd></div>
          <div><dt>Payment status</dt><dd><Badge tone={ride.booking.paymentStatus === 'PAID' ? 'success' : 'neutral'}>{ride.booking.paymentStatus}</Badge></dd></div>
          <div><dt>Ride status</dt><dd><Badge tone="neutral">{ride.status}</Badge></dd></div>
          <div><dt>Driver</dt><dd>{currentDriver?.email ?? 'Unassigned'}</dd></div>
        </dl>
      </Card>

      <Card className={styles.actionsCard}>
        <p className={styles.actionLabel}>Update status</p>
        {nextOptions.length === 0 ? (
          <p className={styles.terminalNote}>This ride is in a terminal state — no further status changes are possible.</p>
        ) : (
          <div className={styles.statusButtons}>
            {nextOptions.map((s) => (
              <Button key={s} variant="secondary" disabled={updating} onClick={() => handleStatusChange(s)}>Set {s}</Button>
            ))}
          </div>
        )}
      </Card>

      <Card className={styles.actionsCard}>
        <p className={styles.actionLabel}>Assign driver</p>
        <form onSubmit={handleAssignDriver} className={styles.driverForm}>
          <Field label={`Driver (available for ${ride.booking.vehicleCategory})`}>
            <Select value={selectedDriverId} onChange={(e) => setSelectedDriverId(e.target.value)}>
              <option value="">Unassigned</option>
              {driverOptions.map((d) => <option key={d.id} value={d.id}>{d.email}</option>)}
            </Select>
          </Field>
          <Button type="submit" disabled={updating || nextOptions.length === 0}>{updating ? 'Saving…' : 'Update assignment'}</Button>
        </form>
        {driverOptions.length === 0 && <p className={styles.driverNote}>No drivers currently available for this vehicle category.</p>}
      </Card>
    </div>
  );
}
