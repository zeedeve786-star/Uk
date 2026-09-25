import { BookingStatus, PaymentStatus } from '@prisma/client';
import { VehicleCategoryId } from '../../fare/dto/calculate-fare.dto';

export type Currency = 'GBP';

export interface BookingResult {
  bookingReference: string;
  pickup: string;
  destination: string;
  extraStops: string[];
  journeyDate: string;
  journeyTime: string;
  customerName: string;
  customerEmail: string;
  customerPhone: string;
  passengerCount: number;
  luggageCount: number | null;
  handCarryCount: number | null;
  vehicleCategory: VehicleCategoryId;
  pricing: {
    originalFare: number;
    discountCode: string | null;
    discountAmount: number;
    finalFare: number;
    currency: Currency;
  };
  paymentStatus: PaymentStatus;
  bookingStatus: BookingStatus;
  createdAt: string;
}