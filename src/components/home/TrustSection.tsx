import { useState } from 'react';
import { trustPoints } from '../../config/trust';
import styles from './TrustSection.module.css';

const detailContent = [
  {
    eyebrow: 'Journey planning',
    headline: 'A booking experience built around your journey.',
    description:
      'Your journey starts with clear pickup, destination, date and travel details so the transfer can be planned before you travel.',
    tags: ['Pre-booked', 'Clear journey details', 'Private transport'],
  },
  {
    eyebrow: 'Vehicle choice',
    headline: 'Choose transport around your passengers and luggage.',
    description:
      'Select from the available vehicle categories according to the size of your group, luggage and journey requirements.',
    tags: ['Vehicle choice', 'Passenger focused', 'Luggage aware'],
  },
  {
    eyebrow: 'Clear pricing',
    headline: 'Understand your journey before you confirm.',
    description:
      'The booking experience is designed to make the selected vehicle and journey fare clear before you complete your booking.',
    tags: ['Fare visibility', 'Journey review', 'Secure checkout'],
  },
  {
    eyebrow: 'Travel support',
    headline: 'A private transport experience from booking to arrival.',
    description:
      'From your initial booking through your planned journey, the service is designed around a straightforward and dependable customer experience.',
    tags: ['Customer support', 'Journey updates', 'Private transfer'],
  },
];

export function TrustSection() {
  const [activeIndex, setActiveIndex] = useState(0);

  const activePoint = trustPoints[activeIndex];
  const activeDetail = detailContent[activeIndex];

  return (
    <section
      className={styles.section}
      aria-label="Why choose our private transport service"
    >
      <div className={styles.inner}>
        <div className={styles.intro}>
          <div className={styles.eyebrow}>
            <span className={styles.eyebrowLine} />
            The transport experience
          </div>

          <h2 className={styles.heading}>
            Private transport designed around
            <span> the customer.</span>
          </h2>

          <p className={styles.description}>
            From airport transfers and railway journeys to cruise ports
            and events, every part of the booking experience is designed
            to make private transport simple, clear and comfortable.
          </p>

          <div className={styles.customerPath}>
            <div className={styles.pathTop}>
              <span>YOUR JOURNEY</span>
              <span>BOOK → TRAVEL → ARRIVE</span>
            </div>

            <div className={styles.pathLine}>
              <span className={styles.pathStart}>BOOK</span>
              <i />
              <span>PLAN</span>
              <i />
              <span>TRAVEL</span>
              <i />
              <span className={styles.pathEnd}>ARRIVE</span>
            </div>
          </div>
        </div>

        <div className={styles.experience}>
          <div className={styles.experienceHeader}>
            <div>
              <span className={styles.panelEyebrow}>
                Customer experience
              </span>
              <strong>Why travel with us</strong>
            </div>

            <span className={styles.panelStatus}>
              <i />
              Service ready
            </span>
          </div>

          <div className={styles.experienceBody}>
            <nav
              className={styles.pointRail}
              aria-label="Transport service benefits"
            >
              {trustPoints.map((point, index) => (
                <button
                  key={point.title}
                  type="button"
                  className={`${styles.pointButton} ${
                    index === activeIndex
                      ? styles.pointButtonActive
                      : ''
                  }`}
                  onMouseEnter={() => setActiveIndex(index)}
                  onFocus={() => setActiveIndex(index)}
                  onClick={() => setActiveIndex(index)}
                  aria-pressed={index === activeIndex}
                >
                  <span className={styles.pointNumber}>
                    {String(index + 1).padStart(2, '0')}
                  </span>

                  <span className={styles.pointText}>
                    <strong>{point.title}</strong>
                    <small>{point.description}</small>
                  </span>

                  <span className={styles.pointArrow}>↗</span>
                </button>
              ))}
            </nav>

            <article className={styles.detailPanel} key={activeIndex}>
              <div className={styles.detailTop}>
                <span>{activeDetail.eyebrow}</span>
                <b>{String(activeIndex + 1).padStart(2, '0')}</b>
              </div>

              <div className={styles.detailIcon}>
                <span />
              </div>

              <h3>{activeDetail.headline}</h3>

              <p>{activeDetail.description}</p>

              <div className={styles.tags}>
                {activeDetail.tags.map((tag) => (
                  <span key={tag}>{tag}</span>
                ))}
              </div>

              <a href="#booking" className={styles.detailAction}>
                Plan your journey
                <span>→</span>
              </a>
            </article>
          </div>
        </div>
      </div>
    </section>
  );
}
