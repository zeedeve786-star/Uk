import type { ServiceType } from './booking';

export interface QuoteContactDetails {
  fullName: string;
  email: string;
  phone: string;
}

export interface QuoteJourneyDetails {
  serviceType: ServiceType;
  pickup: string;
  dropoff: string;
  date?: string;
  passengers?: number;
  notes?: string;
}

export type QuoteStatus = 'pending' | 'submitted';

export interface QuoteRequestRecord {
  reference: string;
  contact: QuoteContactDetails;
  journey: QuoteJourneyDetails;
  status: QuoteStatus;
  submittedAt: string;
}
