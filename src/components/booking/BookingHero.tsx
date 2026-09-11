import { BookingWidget } from './BookingWidget';
import styles from './BookingHero.module.css';

export function BookingHero() {
  return (
    <section id="home" className={styles.hero} aria-label="Book your journey">
      <div className={styles.intro}>
        <h1 className={styles.heading}>Pre-booked private transport across England</h1>
        <p className={styles.subheading}>
          Airport, railway, cruise and event transfers with a fare confirmed before you travel and a
          human team behind every booking.
        </p>

        <ul className={styles.trustList}>
          <li>Fixed pickup time, no street hailing</li>
          <li>Fare shown before you confirm</li>
          <li>Support from a person, not a chatbot</li>
        </ul>

        <div className={styles.ctaRow}>
          <a href="#quote" className={styles.secondaryCta}>Request a custom quote</a>
          <a href="#support" className={styles.secondaryCta}>Talk to support</a>
        </div>
      </div>

      <div className={styles.widgetColumn}>
        <BookingWidget />
      </div>
    </section>
  );
}
