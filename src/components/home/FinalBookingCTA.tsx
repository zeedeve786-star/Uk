import styles from './FinalBookingCTA.module.css';

export function FinalBookingCTA() {
  return (
    <section className={styles.section} aria-label="Start your booking">
      <div className={styles.inner}>
        <h2 className={styles.heading}>Ready to plan your journey?</h2>
        <p className={styles.body}>
          Enter your journey details to view suitable vehicle options and continue with your booking.
        </p>
        <div className={styles.actions}>
          <a href="#home" className={styles.primary}>Start a booking</a>
          <a href="#quote" className={styles.secondary}>Request a custom quote</a>
        </div>
      </div>
    </section>
  );
}