export type VehicleCategoryId = 'saloon' | 'estate' | 'mpv' | 'executive' | 'eight-seater';

export interface VehicleCategory {
  id: VehicleCategoryId;
  name: string;
  description: string;
  passengerCapacity: number;
  luggageCapacity: number;
  imagePlaceholder: string;
}

export interface FareResult {
  amount: number;
  currency: 'GBP';
  discountAmount?: number;
  finalAmount?: number;
  source: 'fare-engine';
}

export interface VehicleOption {
  category: VehicleCategory;
  available: boolean;
  fare?: FareResult;
}
