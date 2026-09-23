import {
  DriverPaymentFrequency,
  DriverPaymentMethod,
  DriverPaymentProvider,
  DriverPaymentStatus,
} from '@prisma/client';

export class CreateDriverPaymentDto {
  driverId!: string;
  frequency!: DriverPaymentFrequency;
  amountPence!: number;
  paymentDate!: string;
  status?: DriverPaymentStatus;
  paymentMethod?: DriverPaymentMethod;
  provider?: DriverPaymentProvider;
  paymentReference?: string;
  transferReference?: string;
  externalTransactionId?: string;
  notes?: string;
  payrollPeriodStart?: string;
  payrollPeriodEnd?: string;
  rideCount?: number;
}
