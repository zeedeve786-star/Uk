import { VehicleCategoryId } from '../../fare/dto/calculate-fare.dto';

export interface AvailabilityBlockResult {
  id: string;
  vehicleCategory: VehicleCategoryId;
  startsAt: string;
  endsAt: string;
  reason: string | null;
  createdAt: string;
}

export interface ConflictingBooking {
  bookingReference: string;
  journeyDate: string;
  journeyTime: string;
  bookingStatus: string;
}

export interface AvailabilityCheckResult {
  vehicleCategory: VehicleCategoryId;
  date: string;
  time: string;
  available: boolean;
  conflictingBlocks: AvailabilityBlockResult[];
  conflictingBookings: ConflictingBooking[];
}
