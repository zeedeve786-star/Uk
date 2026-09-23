import { vehicleCatalog } from '../../config/vehicles';
import styles from './VehicleSuitabilityNote.module.css';

export function VehicleSuitabilityNote() {
  return (
    <section id="vehicles" className={styles.section} aria-label="Vehicle suitability">
      <h2 className={styles.heading}>Choosing a vehicle</h2>
      <p className={styles.body}>
        Vehicle suitability depends on passengers and luggage for your journey. The available
        categories are:
      </p>
      <ul className={styles.list}>
        {vehicleCatalog.map((vehicle) => (
          <li key={vehicle.id} className={styles.item}>
            <span className={styles.name}>{vehicle.name}</span>
            <span className={styles.meta}>{vehicle.passengerCapacity} passengers · {vehicle.luggageCapacity} luggage</span>
          </li>
        ))}
      </ul>
      <p className={styles.note}>Exact fares are confirmed during booking, not shown here.</p>
    </section>
  );
}