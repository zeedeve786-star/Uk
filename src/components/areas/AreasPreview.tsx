import { areasConfig } from '../../config/areas';
import styles from './AreasPreview.module.css';

export function AreasPreview() {
  return (
    <section id="areas" className={styles.section} aria-label="Areas we cover">
      <div className={styles.inner}>
        <h2 className={styles.heading}>Areas we cover</h2>
        <p className={styles.body}>{areasConfig.supportingCopy}</p>
        <a href="#areas" className={styles.cta}>Check service areas</a>
      </div>
    </section>
  );
}
