import type { ServiceType } from '../models/booking';
import { getEntry, getCategoryDisplay } from '../config/service-content';
import { Breadcrumbs } from '../components/services-page/Breadcrumbs';
import { RelatedServices } from '../components/services-page/RelatedServices';
import { FinalBookingCTA } from '../components/home/FinalBookingCTA';
import styles from './ServiceArticlePage.module.css';

interface ServiceArticlePageProps {
  categorySlug: ServiceType;
  entrySlug: string;
}

// Single generic component for all 32 content entries — intended for
// /services/:categorySlug/:entrySlug once routing exists.
export function ServiceArticlePage({ categorySlug, entrySlug }: ServiceArticlePageProps) {
  const entry = getEntry(categorySlug, entrySlug);
  const display = getCategoryDisplay(categorySlug);

  if (!entry || !display) {
    return (
      <div className={styles.notFound}>
        <p>Guide not found.</p>
      </div>
    );
  }

  return (
    <div className={styles.page}>
      <Breadcrumbs
        items={[
          { label: 'Home', href: '/' },
          { label: 'Services', href: '/services' },
          { label: display.label, href: `/services/${categorySlug}` },
          { label: entry.title, href: entry.path },
        ]}
      />

      <article className={styles.article}>
        <p className={styles.status}>{entry.status === 'published' ? 'Published' : 'Draft — placeholder content'}</p>
        <h1 className={styles.title}>{entry.title}</h1>
        <p className={styles.body}>{entry.body}</p>

        <div className={styles.ctas}>
          <a href={display.href} className={styles.primaryCta}>Start a booking</a>
          <a href="#quote" className={styles.secondaryCta}>Request a quote</a>
          <a href="#support" className={styles.secondaryCta}>Speak to our team</a>
        </div>
      </article>

      <RelatedServices excludeSlug={categorySlug} />
      <FinalBookingCTA />
    </div>
  );
}