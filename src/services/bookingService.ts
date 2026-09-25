import type { CustomerDetails, JourneyDetails, BookingRecord } from '../models/booking';
import type { VehicleCategoryId } from '../models/vehicle';
import { apiPost } from './httpClient';

interface BackendBookingResponse {
  bookingReference: string;
  vehicleCategory: VehicleCategoryId;
  pricing: {
    originalFare: number;
    discountCode: string | null;
    discountAmount: number;
    finalFare: number;
    currency: 'GBP';
  };
  createdAt: string;
}

export async function createBookingRecord(
  journey: JourneyDetails,
  vehicleId: VehicleCategoryId,
  customer: CustomerDetails,
): Promise<BookingRecord> {
  const response = await apiPost<BackendBookingResponse>('/bookings', {
    pickup: journey.pickup,
    destination: journey.dropoff,
    extraStops: journey.viaStops,
    journeyDate: journey.date,
    journeyTime: journey.time,
    customerName: customer.fullName,
    customerEmail: customer.email,
    customerPhone: customer.phone,
    leadPassengerName: customer.leadPassengerName,
    passengerCount: customer.passengerCount,
    luggageCount: journey.luggage,
    handCarryCount: journey.handCarry,
    luggageNotes: customer.luggageNotes,
    customerNotes: customer.notes,
    vehicleCategory: vehicleId,
    distanceMiles: journey.distanceMiles,
  });

  return {
    reference: response.bookingReference,
    journey,
    vehicleId: response.vehicleCategory,
    fare: {
      amount: response.pricing.originalFare,
      currency: response.pricing.currency,
      discountAmount: response.pricing.discountAmount || undefined,
      finalAmount: response.pricing.finalFare,
      source: 'fare-engine',
    },
    customer,
    payment: { status: 'pending', provider: 'stripe' },
    createdAt: response.createdAt,
  };
}