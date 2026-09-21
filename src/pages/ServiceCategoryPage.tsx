import type { ServiceType } from '../models/booking';
import { getCategoryContent, getCategoryDisplay } from '../config/service-content';
import { Breadcrumbs } from '../components/services-page/Breadcrumbs';
import { ServiceArticleCard } from '../components/services-page/ServiceArticleCard';
import { VehicleSuitabilityNote } from '../components/services-page/VehicleSuitabilityNote';
import { RelatedServices } from '../components/services-page/RelatedServices';
import { FinalBookingCTA } from '../components/home/FinalBookingCTA';
import { ServicesQuoteCTA } from '../components/services-page/ServicesQuoteCTA';
import styles from './ServiceCategoryPage.module.css';

interface ServiceCategoryPageProps {
  categorySlug: ServiceType;
}

// Single generic component for all 4 categories (airport/railway/cruise/event) —
// intended to be mounted at /services/:categorySlug once routing exists.
export function ServiceCategoryPage({ categorySlug }: ServiceCategoryPageProps) {
  const category = getCategoryContent(categorySlug);
  const display = getCategoryDisplay(categorySlug);

  if (!category || !display) {
    return (
      <div className={styles.notFound}>
        <p>Service category not found.</p>
      </div>
    );
  }

  return (
    <div className={styles.page}>
      <Breadcrumbs
        items={[
          { label: 'Home', href: '/' },
          { label: 'Services', href: '/services' },
          { label: display.label, href: category.path },
        ]}
      />

      <section className={styles.hero} aria-label={`${display.label} overview`}>
        <h1 className={styles.heading}>{display.label}</h1>
        <p className={styles.body}>{display.summary}</p>
        <div className={styles.actions}>
          <a href={display.href} className={styles.primaryCta}>Start a booking</a>
          <a href="#quote" className={styles.secondaryCta}>Request a quote</a>
        </div>
      </section>

      <section className={styles.entries} aria-label={`${display.label} guides`}>
        <h2 className={styles.entriesHeading}>Guides</h2>
        <p className={styles.entriesNote}>
          Content below is placeholder structure only, pending final client content.
        </p>
        <div className={styles.grid}>
          {category.entries.map((entry) => (
            <ServiceArticleCard key={entry.id} entry={entry} />
          ))}
        </div>
      </section>

      <VehicleSuitabilityNote />
      <RelatedServices excludeSlug={categorySlug} />
      <FinalBookingCTA />
      <ServicesQuoteCTA />
    </div>
  );
}