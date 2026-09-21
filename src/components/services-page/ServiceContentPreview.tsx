import { serviceCategoryContent } from '../../config/service-content';
import { getCategoryDisplay } from '../../config/service-content';
import { ServiceArticleCard } from './ServiceArticleCard';
import styles from './ServiceContentPreview.module.css';

const PREVIEW_COUNT = 2;

export function ServiceContentPreview() {
  return (
    <section className={styles.section} aria-label="Service guides preview">
      <h2 className={styles.heading}>Guides and information</h2>
      <p className={styles.note}>
        Content below is placeholder structure, shown to preview the SEO/content architecture.
        Real guides will replace these once client content is confirmed.
      </p>

      {serviceCategoryContent.map((category) => {
        const display = getCategoryDisplay(category.slug);
        return (
          <div key={category.slug} className={styles.categoryBlock}>
            <div className={styles.categoryHeader}>
              <h3 className={styles.categoryTitle}>{display?.label}</h3>
              <a href={category.path} className={styles.viewAll}>View all {category.entries.length} guides</a>
            </div>
            <div className={styles.grid}>
              {category.entries.slice(0, PREVIEW_COUNT).map((entry) => (
                <ServiceArticleCard key={entry.id} entry={entry} />
              ))}
            </div>
          </div>
        );
      })}
    </section>
  );
}