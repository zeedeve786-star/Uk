import type { VehicleOption } from '../../models/vehicle';
import styles from './VehicleCard.module.css';

interface VehicleCardProps {
  option: VehicleOption;
  selected: boolean;
  onSelect: () => void;
}

export function VehicleCard({ option, selected, onSelect }: VehicleCardProps) {
  const { category, available, fare } = option;

  return (
    <div className={styles.card} data-selected={selected} data-unavailable={!available}>
      <div className={styles.imagePlaceholder} aria-hidden="true">{category.imagePlaceholder}</div>

      <div className={styles.body}>
        <h3 className={styles.name}>{category.name}</h3>
        <p className={styles.description}>{category.description}</p>

        <dl className={styles.capacity}>
          <div><dt>Passengers</dt><dd>{category.passengerCapacity}</dd></div>
          <div><dt>Luggage</dt><dd>{category.luggageCapacity}</dd></div>
          <div><dt>Hand carry</dt><dd>{category.handCarryCapacity}</dd></div>
        </dl>

        <div className={styles.fareRow}>
          {fare ? (
            <span className={styles.fare}>
              {fare.discountAmount ? (
                <>
                  <span className={styles.fareOriginal}>£{fare.amount.toFixed(2)}</span>
                  <span className={styles.fareFinal}>£{(fare.finalAmount ?? fare.amount).toFixed(2)}</span>
                </>
              ) : (
                <span className={styles.fareFinal}>£{fare.amount.toFixed(2)}</span>
              )}
              <span className={styles.fareNote}>estimated, confirmed at checkout</span>
            </span>
          ) : (
            <span className={styles.fareNote}>Fare shown once selected</span>
          )}
        </div>

        <button type="button" className={styles.selectButton} onClick={onSelect} disabled={!available}>
          {available ? (selected ? 'Selected' : 'Select vehicle') : 'Unavailable for this journey'}
        </button>
      </div>
    </div>
  );
}
