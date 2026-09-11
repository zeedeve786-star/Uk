export interface ServiceLink {
  label: string;
  href: string;
}

export interface SiteConfig {
  websiteName: string;
  logo: {
    src: string | null;
    alt: string;
  };
  phoneNumber: {
    display: string;
    tel: string;
  };
  promotionMessage: string;
  navigation: {
    home: { label: string; href: string };
    contact: { label: string; href: string };
  };
  services: ServiceLink[];
}

export const siteConfig: SiteConfig = {
  websiteName: 'Your Transport Company',
  logo: {
    src: null,
    alt: 'Your Transport Company logo',
  },
  phoneNumber: {
    display: '+44 0000 000000',
    tel: '+440000000000',
  },
  promotionMessage: 'SPECIAL OFFER • SAVE 10% ON SELECTED AIRPORT TRANSFERS',
  navigation: {
    home: { label: 'Home', href: '#home' },
    contact: { label: 'Contact Us', href: '#contact' },
  },
  services: [
    { label: 'Airport Taxi Services', href: '#services-airport' },
    { label: 'Cruise Services', href: '#services-cruise' },
    { label: 'Events Services', href: '#services-events' },
  ],
};
