import type { JourneyDetails } from '../models/booking';
import type { FareResult, VehicleCategoryId } from '../models/vehicle';

export async function getFareEstimate(
  journey: JourneyDetails,
  vehicleId: VehicleCategoryId,
): Promise<FareResult> {
  await new Promise((resolve) => setTimeout(resolve, 300));

  const baseByVehicle: Record<VehicleCategoryId, number> = {
    saloon: 45,
    estate: 52,
    mpv: 65,
    executive: 85,
    'eight-seater': 95,
  };

  const amount = baseByVehicle[vehicleId] + journey.viaStops.length * 8;
  const isPromotional = journey.serviceType === 'airport';
  const discountAmount = isPromotional ? Math.round(amount * 0.1) : undefined;
  const finalAmount = discountAmount ? amount - discountAmount : amount;

  return {
    amount,
    currency: 'GBP',
    discountAmount,
    finalAmount,
    source: 'fare-engine',
  };
}
