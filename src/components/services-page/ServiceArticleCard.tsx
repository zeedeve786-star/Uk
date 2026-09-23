import type { ServiceContentEntry } from '../../models/service-content';
import styles from './ServiceArticleCard.module.css';

export function ServiceArticleCard({ entry }: { entry: ServiceContentEntry }) {
  return (
    <article className={styles.card}>
      <p className={styles.status}>{entry.status === 'published' ? 'Published' : 'Draft — placeholder'}</p>
      <h3 className={styles.title}>{entry.title}</h3>
      <p className={styles.excerpt}>{entry.excerpt}</p>
      <a href={entry.path} className={styles.link}>Read guide</a>
    </article>
  );
}