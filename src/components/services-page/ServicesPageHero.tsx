import styles from './ServicesPageHero.module.css';

export function ServicesPageHero() {
  return (
    <section className={styles.hero} aria-label="Services introduction">
      <h1 className={styles.heading}>Services</h1>
      <p className={styles.body}>
        Professional pre-booked private transport covering airport, railway, cruise and event
        journeys. Every journey is arranged in advance, with your vehicle and fare confirmed before
        you travel.
      </p>
    </section>
  );
}