export type ServiceType = 'airport' | 'railway' | 'cruise' | 'event';

export interface JourneyDetails {
  serviceType: ServiceType;
  pickup: string;
  viaStops: string[];
  dropoff: string;
  date: string;
  time: string;
  passengers: number;
  luggage: number;
  referencePoint?: string;
  eventType?: string;
  groupNotes?: string;
}

export interface JourneyValidationErrors {
  pickup?: string;
  dropoff?: string;
  date?: string;
  time?: string;
  passengers?: string;
  referencePoint?: string;
  advanceNotice?: string;
}

export type BookingStep = 'journey' | 'vehicle' | 'details' | 'review' | 'payment' | 'confirmation';

export interface CustomerDetails {
  fullName: string;
  email: string;
  phone: string;
  leadPassengerName: string;
  passengerCount: number;
  luggageNotes?: string;
  notes?: string;
}

export interface CustomerDetailsValidationErrors {
  fullName?: string;
  email?: string;
  phone?: string;
  leadPassengerName?: string;
  passengerCount?: string;
}

export interface BookingRecord {
  reference: string;
  journey: JourneyDetails;
  vehicleId: import('./vehicle').VehicleCategoryId;
  fare: import('./vehicle').FareResult;
  customer: CustomerDetails;
  payment: import('./payment').PaymentResult;
  createdAt: string;
}
