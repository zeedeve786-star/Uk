import styles from './QuoteRequest.module.css';

export function QuoteRequest() {
  return (
    <form className={styles.form}>
      <div className={styles.field}>
        <label htmlFor="quote-name">Name</label>
        <input id="quote-name" name="name" type="text" autoComplete="name" />
      </div>

      <div className={styles.field}>
        <label htmlFor="quote-contact">Contact</label>
        <input id="quote-contact" name="contact" type="text" autoComplete="email" />
      </div>

      <div className={styles.field}>
        <label htmlFor="quote-details">Journey requirements</label>
        <textarea id="quote-details" name="details" rows={5} />
      </div>

      <button type="submit" className={styles.submit}>
        Request a quote
      </button>
    </form>
  );
}
