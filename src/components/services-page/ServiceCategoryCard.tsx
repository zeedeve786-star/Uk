import type { ServiceCategoryContent } from '../../models/service-content';
import { getCategoryDisplay } from '../../config/service-content';
import styles from './ServiceCategoryCard.module.css';

export function ServiceCategoryCard({ category }: { category: ServiceCategoryContent }) {
  const display = getCategoryDisplay(category.slug);
  if (!display) return null;

  return (
    <article className={styles.card}>
      <div className={styles.icon} aria-hidden="true">{category.iconPlaceholder}</div>
      <h2 className={styles.title}>{display.label}</h2>
      <p className={styles.summary}>{display.summary}</p>
      <p className={styles.count}>{category.entries.length} guides in progress</p>
      <div className={styles.actions}>
        <a href={category.path} className={styles.primaryLink}>View {display.label.toLowerCase()}</a>
        <a href={display.href} className={styles.secondaryLink}>Start a booking</a>
      </div>
    </article>
  );
}