import { ServicesPageHero } from '../components/services-page/ServicesPageHero';
import { ServiceCategoryGrid } from '../components/services-page/ServiceCategoryGrid';
import { HowItWorksSection } from '../components/home/HowItWorksSection';
import { VehicleSuitabilityNote } from '../components/services-page/VehicleSuitabilityNote';
import { ServiceContentPreview } from '../components/services-page/ServiceContentPreview';
import { FinalBookingCTA } from '../components/home/FinalBookingCTA';
import { ServicesQuoteCTA } from '../components/services-page/ServicesQuoteCTA';
import { HumanSupport } from '../components/support/HumanSupport';
import styles from './ServicesPage.module.css';

// Not mounted into App.tsx yet — see integration notes. Intended for a future
// "/services" route, composed entirely from existing + new reusable components.
export function ServicesPage() {
  return (
    <div className={styles.page}>
      <ServicesPageHero />
      <ServiceCategoryGrid />
      <HowItWorksSection />
      <VehicleSuitabilityNote />
      <ServiceContentPreview />
      <FinalBookingCTA />
      <ServicesQuoteCTA />
      <HumanSupport />
    </div>
  );
}