import { QuoteRequest } from '../quote/QuoteRequest';
import styles from './ServicesQuoteCTA.module.css';

export function ServicesQuoteCTA() {
  return (
    <section id="quote" className={styles.section} aria-label="Request a custom quote">
      <div className={styles.inner}>
        <h2 className={styles.heading}>Need help choosing a service?</h2>
        <p className={styles.body}>
          For larger groups, events or bespoke transport, request a quote and our team will follow
          up directly. You can also <a href="#support" className={styles.inlineLink}>speak to our team</a>.
        </p>
        <QuoteRequest />
      </div>
    </section>
  );
}