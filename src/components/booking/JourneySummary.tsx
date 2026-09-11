import type { JourneyDetails } from '../../models/booking';
import { serviceContent } from '../../config/services';
import styles from './JourneySummary.module.css';

interface JourneySummaryProps {
  journey: JourneyDetails;
  onEdit: () => void;
}

export function JourneySummary({ journey, onEdit }: JourneySummaryProps) {
  const service = serviceContent.find((s) => s.id === journey.serviceType);

  return (
    <div className={styles.summary}>
      <div className={styles.header}>
        <span className={styles.label}>Journey</span>
        <button type="button" className={styles.editButton} onClick={onEdit}>Edit journey</button>
      </div>

      <dl className={styles.details}>
        <div><dt>Service</dt><dd>{service?.label ?? journey.serviceType}</dd></div>
        <div><dt>Pickup</dt><dd>{journey.pickup}</dd></div>
        {journey.viaStops.length > 0 && <div><dt>Via</dt><dd>{journey.viaStops.join(', ')}</dd></div>}
        <div><dt>Destination</dt><dd>{journey.dropoff}</dd></div>
        <div><dt>Date</dt><dd>{journey.date}</dd></div>
        <div><dt>Time</dt><dd>{journey.time}</dd></div>
        <div><dt>Passengers</dt><dd>{journey.passengers}</dd></div>
      </dl>
    </div>
  );
}
