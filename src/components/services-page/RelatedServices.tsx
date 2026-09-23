import type { ServiceType } from '../../models/booking';
import { serviceCategoryContent, getCategoryDisplay } from '../../config/service-content';
import styles from './RelatedServices.module.css';

export function RelatedServices({ excludeSlug }: { excludeSlug: ServiceType }) {
  const related = serviceCategoryContent.filter((c) => c.slug !== excludeSlug);

  return (
    <nav aria-label="Related services" className={styles.wrapper}>
      <h2 className={styles.heading}>Related services</h2>
      <ul className={styles.list}>
        {related.map((category) => {
          const display = getCategoryDisplay(category.slug);
          return (
            <li key={category.slug}>
              <a href={category.path} className={styles.link}>{display?.label}</a>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}