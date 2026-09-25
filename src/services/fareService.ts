import type { JourneyDetails } from '../models/booking';
import type { FareResult, VehicleCategoryId } from '../models/vehicle';
import { API_BASE_URL } from '../config/api';

interface BackendFareResponse {
  totalFare?: number;
  totalFarePence?: number;
  amount?: number;
  currency?: string;
  discountAmount?: number;
  finalAmount?: number;
}

export async function getFareEstimate(
  journey: JourneyDetails,
  vehicleId: VehicleCategoryId,
): Promise<FareResult> {
  const response = await fetch(`${API_BASE_URL}/fare/calculate`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      distanceMiles: journey.distanceMiles,
      vehicleCategory: vehicleId,
      extraStopCount: journey.viaStops.length,
    }),
  });

  if (!response.ok) {
    throw new Error(`Fare calculation failed (${response.status})`);
  }

  const data = (await response.json()) as BackendFareResponse;

  const amount =
    typeof data.totalFare === 'number'
      ? data.totalFare
      : typeof data.amount === 'number'
        ? data.amount
        : typeof data.totalFarePence === 'number'
          ? data.totalFarePence / 100
          : null;

  if (amount === null) {
    throw new Error('Fare calculation returned no valid amount');
  }

  return {
    amount,
    currency: 'GBP',
    ...(typeof data.discountAmount === 'number'
      ? { discountAmount: data.discountAmount }
      : {}),
    ...(typeof data.finalAmount === 'number'
      ? { finalAmount: data.finalAmount }
      : {}),
    source: 'fare-engine',
  };
}
