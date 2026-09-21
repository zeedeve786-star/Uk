import { PaymentStatus } from '@prisma/client';

export type Currency = 'GBP';

export interface PaymentResult {
  bookingReference: string;
  paymentIntentId: string;
  clientSecret: string;
  amount: number;
  currency: Currency;
  status: PaymentStatus;
}