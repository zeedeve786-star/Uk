import styles from './HumanSupport.module.css';

export function HumanSupport() {
  return (
    <section id="support" className={styles.section} aria-labelledby="human-support-heading">
      <div className={styles.inner}>
        <span className={styles.eyebrow}>Human Support</span>

        <h2 id="human-support-heading" className={styles.heading}>
          Need help with your airport transfer?
        </h2>

        <p className={styles.body}>
          Our team is here to help with bookings, special requirements,
          airport transfers, and any questions about your journey.
        </p>

        <a href="#quote" className={styles.link}>
          Talk to our team
        </a>
      </div>
    </section>
  );
}
