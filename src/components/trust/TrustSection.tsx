import { trustPoints } from '../../config/trust';
import styles from './TrustSection.module.css';

export function TrustSection() {
  return (
    <section className={styles.section} aria-label="Why book with us">
      <div className={styles.inner}>
        <div className={styles.introPanel}>
          <div className={styles.eyebrow}>
            <span className={styles.liveDot} />
            Transport network assurance
          </div>

          <div className={styles.headingRow}>
            <div>
              <h2 className={styles.heading}>
                Travel with confidence
              </h2>

              <p className={styles.intro}>
                Every journey is managed through a simple,
                reliable transport experience — from booking
                through arrival.
              </p>
            </div>

            <div className={styles.networkStatus}>
              <span className={styles.statusLine} />
              <div>
                <strong>Journey ready</strong>
                <span>Private transfer network</span>
              </div>
            </div>
          </div>
        </div>

        <div className={styles.assurancePanel}>
          <div className={styles.panelHeader}>
            <span>Service assurance</span>
            <span className={styles.panelCode}>TRANSPORT / 01</span>
          </div>

          <div className={styles.grid}>
            {trustPoints.map((point, index) => (
              <article
                key={point.title}
                className={styles.point}
              >
                <div className={styles.pointTop}>
                  <span className={styles.pointNumber}>
                    {String(index + 1).padStart(2, '0')}
                  </span>

                  <span className={styles.pointSignal}>
                    <i />
                    Active
                  </span>
                </div>

                <h3 className={styles.title}>
                  {point.title}
                </h3>

                <p className={styles.description}>
                  {point.description}
                </p>

                <div className={styles.pointLine} />
              </article>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
