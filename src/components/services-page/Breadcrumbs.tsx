import type { BreadcrumbItem } from '../../models/service-content';
import styles from './Breadcrumbs.module.css';

// Structured data is derived only from the real breadcrumb trail passed in —
// no invented business/schema data is included here.
export function buildBreadcrumbSchema(items: BreadcrumbItem[]) {
  return {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: items.map((item, index) => ({
      '@type': 'ListItem',
      position: index + 1,
      name: item.label,
      item: item.href,
    })),
  };
}

export function Breadcrumbs({ items }: { items: BreadcrumbItem[] }) {
  return (
    <nav aria-label="Breadcrumb" className={styles.nav}>
      <ol className={styles.list}>
        {items.map((item, index) => (
          <li key={item.href} className={styles.item}>
            {index === items.length - 1 ? (
              <span aria-current="page" className={styles.current}>{item.label}</span>
            ) : (
              <a href={item.href} className={styles.link}>{item.label}</a>
            )}
            {index < items.length - 1 && <span className={styles.separator} aria-hidden="true">/</span>}
          </li>
        ))}
      </ol>
    </nav>
  );
}