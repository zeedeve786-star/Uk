import type { BookingRecord, CustomerDetails, JourneyDetails } from '../models/booking';
import type { FareResult, VehicleCategoryId } from '../models/vehicle';
import type { PaymentResult } from '../models/payment';

export async function createBookingRecord(
  journey: JourneyDetails,
  vehicleId: VehicleCategoryId,
  fare: FareResult,
  customer: CustomerDetails,
  payment: PaymentResult,
): Promise<BookingRecord> {
  await new Promise((resolve) => setTimeout(resolve, 300));

  return {
    reference: `BK-${Math.random().toString(36).slice(2, 8).toUpperCase()}`,
    journey,
    vehicleId,
    fare,
    customer,
    payment,
    createdAt: new Date().toISOString(),
  };
}
