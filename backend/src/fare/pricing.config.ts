import { VehicleCategoryId } from './dto/calculate-fare.dto';

/**
 * TEMPORARY FOUNDATION PRICING VALUES.
 *
 * No approved client fare/pricing values exist in the repository at the time
 * of writing this module. These are development placeholders only — they
 * exist so the calculation architecture can be built and tested now, and are
 * intended to be replaced by admin-managed configuration in a later module.
 * Do not treat these figures as final business pricing.
 */
export const fareConfig = {
  currency: 'GBP' as const,
  baseFarePence: 500,
  perMilePence: 150,
  perExtraStopPence: 300,
  minimumFarePence: 800,
  vehicleMultipliers: {
    [VehicleCategoryId.SALOON]: 1.0,
    [VehicleCategoryId.ESTATE]: 1.1,
    [VehicleCategoryId.MPV]: 1.3,
    [VehicleCategoryId.EXECUTIVE]: 1.6,
    [VehicleCategoryId.EIGHT_SEATER]: 1.8,
  } as Record<VehicleCategoryId, number>,
};