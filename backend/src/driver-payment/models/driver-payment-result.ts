import {
  DriverPaymentFrequency,
  DriverPaymentMethod,
  DriverPaymentProvider,
  DriverPaymentStatus,
} from '@prisma/client';

export interface DriverPaymentResult {
  id: string;
  driverId: string;
  driverEmail: string;
  driverPhone: string | null;
  frequency: DriverPaymentFrequency;
  amountPence: number;
  currency: string;
  paymentDate: string;
  status: DriverPaymentStatus;
  paymentMethod: DriverPaymentMethod;
  provider: DriverPaymentProvider;
  paymentReference: string | null;
  transferReference: string | null;
  externalTransactionId: string | null;
  notes: string | null;
  payrollPeriodStart: string | null;
  payrollPeriodEnd: string | null;
  rideCount: number;
  createdByUserId: string | null;
  approvedAt: string | null;
  transferredAt: string | null;
  paidAt: string | null;
  failedAt: string | null;
  createdAt: string;
  updatedAt: string;
}
