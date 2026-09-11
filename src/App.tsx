import './styles/tokens.css';
import { Header } from './components/header/Header';
import { PromotionalTicker } from './components/PromotionalTicker';
import { BookingHero } from './components/booking/BookingHero';
import { ServicesSection } from './components/services/ServicesSection';
import { TrustSection } from './components/trust/TrustSection';
import { ReviewsSection } from './components/reviews/ReviewsSection';
import { QuoteRequest } from './components/quote/QuoteRequest';
import { HumanSupport } from './components/support/HumanSupport';
import { Footer } from './components/layout/Footer';
import styles from './App.module.css';

function App() {
  return (
    <div className={styles.app}>
      <Header />
      <PromotionalTicker />

      <main>
        <BookingHero />
        <ServicesSection />
        <TrustSection />
        <ReviewsSection />

        <section id="quote" className={styles.quoteSection} aria-label="Request a quote">
          <div className={styles.quoteInner}>
            <h2 className={styles.quoteHeading}>Need a custom quote?</h2>
            <p className={styles.quoteBody}>
              For larger groups or bespoke event transport, request a quote and our team will follow up
              directly.
            </p>
            <QuoteRequest />
          </div>
        </section>

        <HumanSupport />
      </main>

      <Footer />
    </div>
  );
}

export default App;
