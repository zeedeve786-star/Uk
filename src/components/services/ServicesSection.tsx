import { useState } from 'react';
import { serviceContent } from '../../config/services';
import styles from './ServicesSection.module.css';

const seoContent: Record<string, { insight: string; seo: string }> = {
  airport: {
    insight:
      'Pre-booked private airport transport with a clear journey plan, professional service and a comfortable vehicle matched to your trip.',
    seo:
      'Book reliable airport transfers across England with convenient private transport, professional drivers and a smooth pre-booked journey.',
  },
  cruise: {
    insight:
      'A planned cruise transfer designed around your departure or arrival time, helping you travel between home, hotel and cruise port with less hassle.',
    seo:
      'Book private cruise transfers across England with comfortable vehicles, planned pickup times and dependable transport to major cruise ports.',
  },
  railway: {
    insight:
      'Private railway station transfers that connect your home, hotel or destination with the station while keeping your journey simple and organised.',
    seo:
      'Book private railway station transfers across England with convenient pickup, comfortable vehicles and reliable pre-booked transport.',
  },
  events: {
    insight:
      'Flexible private transport for events, meetings and special occasions, with a journey planned around your schedule and group requirements.',
    seo:
      'Book private event transport in England for meetings, occasions and group travel with comfortable vehicles and convenient pre-booked journeys.',
  },
};

export function ServicesSection() {
  const [activeId, setActiveId] = useState(serviceContent[0]?.id ?? '');
  const [locked, setLocked] = useState(false);

  const activeService =
    serviceContent.find((service) => service.id === activeId) ??
    serviceContent[0];

  if (!activeService) return null;

  const content =
    seoContent[activeService.id] ?? {
      insight: activeService.summary,
      seo: activeService.summary,
    };

  return (
    <section
      id="services"
      className={styles.section}
      aria-label="Our services"
    >
      <div className={styles.inner}>
        <div className={styles.headingBlock}>
          <span className={styles.eyebrow}>Private transport network</span>

          <h2 className={styles.heading}>Our services</h2>

          <p className={styles.intro}>
            Choose a journey type to explore the service before you book.
          </p>
        </div>

        <div className={styles.explorer}>
          <div className={styles.serviceRail}>
            <div className={styles.railLabel}>
              <span>01</span>
              Journey services
            </div>

            <div className={styles.serviceList}>
              {serviceContent.map((service, index) => {
                const isActive = service.id === activeId;

                return (
                  <button
                    key={service.id}
                    type="button"
                    className={`${styles.serviceButton} ${
                      isActive ? styles.serviceButtonActive : ''
                    }`}
                    onMouseEnter={() => {
                      if (!locked) setActiveId(service.id);
                    }}
                    onFocus={() => {
                      if (!locked) setActiveId(service.id);
                    }}
                    onClick={() => {
                      setActiveId(service.id);
                      setLocked(true);
                    }}
                    aria-pressed={isActive}
                  >
                    <span className={styles.buttonNumber}>
                      {String(index + 1).padStart(2, '0')}
                    </span>

                    <span className={styles.buttonText}>
                      <strong>{service.label}</strong>
                      <small>{service.referenceLabel}</small>
                    </span>

                    <span className={styles.buttonArrow}>↗</span>
                  </button>
                );
              })}
            </div>

            {locked && (
              <button
                type="button"
                className={styles.unlockButton}
                onClick={() => setLocked(false)}
              >
                Resume hover preview
              </button>
            )}
          </div>

          <article
            className={styles.preview}
            key={activeService.id}
          >
            <div className={styles.previewTop}>
              <span className={styles.previewTag}>
                AI SERVICE SUMMARY
              </span>

              <span className={styles.previewIndex}>
                {String(
                  serviceContent.findIndex(
                    (service) => service.id === activeService.id,
                  ) + 1,
                ).padStart(2, '0')}
                / {String(serviceContent.length).padStart(2, '0')}
              </span>
            </div>

            <div className={styles.previewBody}>
              <span className={styles.previewLabel}>
                {activeService.referenceLabel}
              </span>

              <h3>{activeService.label}</h3>

              <p className={styles.insight}>
                {content.insight}
              </p>

              <div className={styles.seoBox}>
                <div className={styles.seoHeader}>
                  <span>SEO / BLOG PREVIEW</span>
                  <span className={styles.aiBadge}>AI</span>
                </div>

                <p>{content.seo}</p>
              </div>

              <a
                href="#booking"
                className={styles.previewAction}
              >
                Start a booking
                <span>→</span>
              </a>
            </div>
          </article>
        </div>
      </div>
    </section>
  );
}
