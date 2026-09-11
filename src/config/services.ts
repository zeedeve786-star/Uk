import type { ServiceType } from '../models/booking';

export interface ServiceContent {
  id: ServiceType;
  label: string;
  referenceLabel: string;
  summary: string;
  href: string;
}

export const serviceContent: ServiceContent[] = [
  {
    id: 'airport',
    label: 'Airport Taxi Services',
    referenceLabel: 'Airport',
    summary: 'Pre-booked airport transfers timed around your flight.',
    href: '#services-airport',
  },
  {
    id: 'railway',
    label: 'Railway Services',
    referenceLabel: 'Railway station',
    summary: 'Reliable transfers to and from mainline railway stations.',
    href: '#services-railway',
  },
  {
    id: 'cruise',
    label: 'Cruise Services',
    referenceLabel: 'Cruise port',
    summary: 'Port transfers for cruise departures and arrivals.',
    href: '#services-cruise',
  },
  {
    id: 'event',
    label: 'Events Services',
    referenceLabel: 'Event type',
    summary: 'Private group transport for weddings, corporate events and occasions.',
    href: '#services-events',
  },
];
