import { serviceCategoryContent } from '../../config/service-content';
import { ServiceCategoryCard } from './ServiceCategoryCard';
import styles from './ServiceCategoryGrid.module.css';

export function ServiceCategoryGrid() {
  return (
    <section className={styles.section} aria-label="Service categories">
      <div className={styles.grid}>
        {serviceCategoryContent.map((category) => (
          <ServiceCategoryCard key={category.slug} category={category} />
        ))}
      </div>
    </section>
  );
}