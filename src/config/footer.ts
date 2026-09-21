export interface FooterLink {
  label: string;
  href: string;
}

export interface FooterColumn {
  title: string;
  links: FooterLink[];
}

export const footerColumns: FooterColumn[] = [
  {
    title: 'Navigation',
    links: [
      { label: 'Home', href: '#home' },
      { label: 'Services', href: '#services-airport' },
      { label: 'Vehicles', href: '#vehicles' },
      { label: 'Areas', href: '#areas' },
      { label: 'About', href: '#about' },
    ],
  },
  {
    title: 'Customer',
    links: [
      { label: 'Support', href: '#support' },
      { label: 'Request a quote', href: '#quote' },
      { label: 'Booking information', href: '#home' },
      { label: 'FAQs', href: '#faqs' },
    ],
  },
  {
    title: 'Legal',
    links: [
      { label: 'Terms', href: '#terms' },
      { label: 'Privacy', href: '#privacy' },
      { label: 'Cookie Policy', href: '#cookie-policy' },
      { label: 'Refund Policy', href: '#refund-policy' },
    ],
  },
];

export const footerContact = {
  phoneDisplay: '+44 0000 000000',
  phoneTel: '+440000000000',
  email: 'info@yourtransportcompany.example',
  social: [
    { label: 'Facebook', href: '#' },
    { label: 'Instagram', href: '#' },
  ],
};
