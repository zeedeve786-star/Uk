import { BookingWidget } from './BookingWidget';
import styles from './BookingHero.module.css';

export function BookingHero() {
  return (
    <section
      id="home"
      className={styles.hero}
      aria-label="UK private transport and airport transfer booking"
    >
      <div className={styles.heroBackdrop} aria-hidden="true">
        <div className={styles.backdropTerminal} />
        <div className={styles.backdropLight} />
        <div className={styles.backdropRoad} />
      </div>

      <div className={styles.heroInner}>
        <div className={styles.leftColumn}>

          {/* 01 — MAIN EYE-CATCHING CONTENT */}
          <article className={`${styles.contentCard} ${styles.featureCard}`}>
            <span className={styles.cardKicker}>
              UK PRIVATE TRANSFERS
            </span>

            <h1>
              Your journey.
              <span>Our priority.</span>
            </h1>

            <p>
              Professional private transport for airport transfers,
              railway stations, cruise terminals and events across England.
              Plan your journey, choose your vehicle and see your fare
              before you confirm.
            </p>

            <div className={styles.featureMeta}>
              <span>Airport Transfers</span>
              <i />
              <span>Railway Travel</span>
              <i />
              <span>Cruise &amp; Events</span>
            </div>

            <div className={styles.featureAccent}>
              <strong>01</strong>
              <span>Simple booking. Clear journey details.</span>
            </div>
          </article>

          {/* 02 — CUSTOMER SATISFACTION / EXPERIENCE */}
          <article className={`${styles.contentCard} ${styles.satisfactionCard}`}>
            <div className={styles.cardTop}>
              <span className={styles.cardKicker}>CUSTOMER EXPERIENCE</span>
              <strong>02</strong>
            </div>

            <h2>
              Travel with
              <span>confidence.</span>
            </h2>

            <p>
              A straightforward private transfer experience starts with
              clear information. Your pickup, destination, passengers,
              luggage, vehicle and fare are presented clearly throughout
              the booking journey.
            </p>

            <div className={styles.satisfactionPoints}>
              <span>
                <i>✓</i>
                Clear journey information
              </span>
              <span>
                <i>✓</i>
                Vehicle choice for your needs
              </span>
              <span>
                <i>✓</i>
                Secure online payment
              </span>
              <span>
                <i>✓</i>
                Human support when needed
              </span>
            </div>
          </article>

          {/* 03 + 04 — REVIEW-STYLE CUSTOMER VALUE AREA */}
          <div className={styles.feedbackGrid}>

            <article className={`${styles.contentCard} ${styles.feedbackCard}`}>
              <div className={styles.cardTop}>
                <span className={styles.cardKicker}>WHAT CUSTOMERS VALUE</span>
                <strong>03</strong>
              </div>

              <div className={styles.feedbackMark}>“</div>

              <h3>
                Clear from
                <span>the start.</span>
              </h3>

              <p>
                Customers can review the important parts of their journey
                before continuing — helping keep the booking process
                straightforward and easy to understand.
              </p>

              <div className={styles.feedbackLine}>
                <span />
                <small>JOURNEY CLARITY</small>
              </div>
            </article>

            <article className={`${styles.contentCard} ${styles.feedbackCard}`}>
              <div className={styles.cardTop}>
                <span className={styles.cardKicker}>THE JOURNEY EXPERIENCE</span>
                <strong>04</strong>
              </div>

              <div className={styles.feedbackMark}>✦</div>

              <h3>
                More than
                <span>a booking.</span>
              </h3>

              <p>
                From airport pickup to your final destination, the service
                is designed around useful journey information, practical
                vehicle choices and a clear path to confirmation.
              </p>

              <div className={styles.feedbackLine}>
                <span />
                <small>PRIVATE TRANSPORT</small>
              </div>
            </article>

          </div>

        </div>

        <div className={styles.rightColumn}>
          <div className={styles.bookingPanel}>
            <div className={styles.bookingHeader}>
              <div>
                <span>ONLINE BOOKING</span>
                <h2>Book your journey</h2>
                <p>Enter your journey details to get your quote.</p>
              </div>

              <div className={styles.online}>
                <i />
                ONLINE
              </div>
            </div>

            <div className={styles.widgetArea}>
              <BookingWidget />
            </div>

            <div className={styles.bookingFooter}>
              <span>
                ✓ Secure booking &nbsp; · &nbsp; ✓ Clear fare &nbsp; · &nbsp; ✓ Human support
              </span>
            </div>
          </div>
        </div>

      </div>
    </section>
  );
}
