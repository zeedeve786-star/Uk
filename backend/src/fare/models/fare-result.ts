export type Currency = 'GBP';

export interface FareResult {
  baseFare: number;
  distance: number;
  distanceCharge: number;
  extraStopCharge: number;
  vehicleMultiplier: number;
  totalFare: number;
  currency: Currency;
}