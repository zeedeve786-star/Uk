import { lazy, Suspense } from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import './styles/tokens.css';
import { Header } from './components/header/Header';
import { PromotionalTicker } from './components/PromotionalTicker';
import { BookingHero } from './components/booking/BookingHero';
import { FleetSection } from './components/fleet/FleetSection';
import { VehicleDetailPage } from './pages/VehicleDetailPage';
import { ServicesSection } from './components/services/ServicesSection';
import { HowItWorksSection } from './components/home/HowItWorksSection';
import { TrustSection } from './components/home/TrustSection';
import { ReviewsSection } from './components/reviews/ReviewsSection';
import { QuoteRequest } from './components/quote/QuoteRequest';
import { HumanSupport } from './components/support/HumanSupport';
import { AreasPreview } from './components/areas/AreasPreview';
import { FinalBookingCTA } from './components/home/FinalBookingCTA';
import { FAQSection } from './components/faq/FAQSection';
import { Footer } from './components/layout/Footer';
import { WhatsAppFloat } from './components/whatsapp/WhatsAppFloat';
const AdminApp = lazy(() => import('./admin/AdminApp').then((module) => ({ default: module.AdminApp })));
import styles from './App.module.css';

function CustomerSite() {
  return (
    <div className={styles.app}>
      <Header />
      <PromotionalTicker />
            <WhatsAppFloat />
<main>
        <div id="booking"><BookingHero /></div>
        <FleetSection />
        <ServicesSection />
        <HowItWorksSection />
        <TrustSection />
        <section id="quote" className={styles.quoteSection} aria-label="Request a quote">
          <div className={styles.quoteInner}>
            <h2 className={styles.quoteHeading}>Need something beyond a standard journey?</h2>
            <p className={styles.quoteBody}>
              Tell us what you need — larger groups, events, bespoke transport or special
              requirements — and our team can prepare a custom quote.
            </p>
            <QuoteRequest />
          </div>
        </section>
        <ReviewsSection />
        <HumanSupport />
        <AreasPreview />
        <FAQSection />
        <FinalBookingCTA />
      </main>
      <Footer />
    </div>
  );
}

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/admin/*" element={<Suspense fallback={null}><AdminApp /></Suspense>} />
        <Route path="/vehicles/:category" element={<VehicleDetailPage />} />
        <Route path="/*" element={<CustomerSite />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;