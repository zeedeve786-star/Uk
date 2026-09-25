import { DriverStatus } from '@prisma/client';
import { VehicleCategoryId } from '../../fare/dto/calculate-fare.dto';

export interface DriverProfileResult {
  id: string;
  userId: string;
  name: string | null;
  email: string;
  status: DriverStatus;
  vehicleCategory: VehicleCategoryId | null;
  phone: string | null;
  createdAt: string;
  updatedAt: string;
}
