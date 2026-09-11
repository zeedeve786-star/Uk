import type { CustomerDetails, JourneyDetails } from '../../models/booking';
import type { FareResult, VehicleCategoryId } from '../../models/vehicle';
import { vehicleCatalog } from '../../config/vehicles';
import { JourneySummary } from './JourneySummary';
import styles from './ReviewBooking.module.css';

interface ReviewBookingProps {
  journey: JourneyDetails;
  vehicleId: VehicleCategoryId;
  fare: FareResult;
  customer: CustomerDetails;
  onEditJourney: () => void;
  onEditVehicle: () => void;
  onEditCustomer: () => void;
  onConfirm: () => void;
  isProcessing: boolean;
}

export function ReviewBooking({
  journey,
  vehicleId,
  fare,
  customer,
  onEditJourney,
  onEditVehicle,
  onEditCustomer,
  onConfirm,
  isProcessing,
}: ReviewBookingProps) {
  const vehicle = vehicleCatalog.find((v) => v.id === vehicleId);
  const finalAmount = fare.finalAmount ?? fare.amount;

  return (
    <div className={styles.wrapper}>
      <JourneySummary journey={journey} onEdit={onEditJourney} />

      <div className={styles.card}>
        <div className={styles.cardHeader}>
          <span className={styles.label}>Vehicle</span>
          <button type="button" className={styles.editButton} onClick={onEditVehicle}>Edit vehicle</button>
        </div>
        <p className={styles.vehicleName}>{vehicle?.name}</p>
      </div>

      <div className={styles.card}>
        <div className={styles.cardHeader}>
          <span className={styles.label}>Passenger details</span>
          <button type="button" className={styles.editButton} onClick={onEditCustomer}>Edit passenger details</button>
        </div>
        <dl className={styles.details}>
          <div><dt>Name</dt><dd>{customer.fullName}</dd></div>
          <div><dt>Email</dt><dd>{customer.email}</dd></div>
          <div><dt>Phone</dt><dd>{customer.phone}</dd></div>
          <div><dt>Lead passenger</dt><dd>{customer.leadPassengerName}</dd></div>
        </dl>
      </div>

      <div className={styles.card}>
        <span className={styles.label}>Fare</span>
        <div className={styles.fareRow}><span>Journey fare</span><span>£{fare.amount.toFixed(2)}</span></div>
        {fare.discountAmount ? (
          <div className={styles.fareRow}><span>Discount</span><span>−£{fare.discountAmount.toFixed(2)}</span></div>
        ) : null}
        <div className={`${styles.fareRow} ${styles.fareTotal}`}><span>Total</span><span>£{finalAmount.toFixed(2)}</span></div>
        <p className={styles.policy}>
          This fare is provided by the fare engine and is confirmed before payment. Final charges are
          authorised by the payment provider, not by this website.
        </p>
      </div>

      <button type="button" className={styles.confirmButton} onClick={onConfirm} disabled={isProcessing}>
        {isProcessing ? 'Processing…' : 'Continue to payment'}
      </button>
    </div>
  );
}
