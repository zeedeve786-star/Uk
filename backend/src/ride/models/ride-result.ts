import { BookingStatus, PaymentStatus, RideStatus, VehicleCategory } from '@prisma/client';

export interface RideResult {
  id: string;
  rideReference: string;
  status: RideStatus;
  driverId: string | null;
  operationalNotes: string | null;
  createdAt: string;
  updatedAt: string;
  booking: {
    bookingReference: string;
    pickup: string;
    destination: string;
    extraStops: unknown;
    journeyDate: string;
    journeyTime: string;
    customerName: string;
    customerEmail: string;
    customerPhone: string;
    passengerCount: number;
    vehicleCategory: VehicleCategory;
    finalFarePence: number;
    currency: string;
    paymentStatus: PaymentStatus;
    bookingStatus: BookingStatus;
  };
}
