export type PaymentStatus = 'idle' | 'pending' | 'success' | 'failed' | 'cancelled';

export interface PaymentRequest {
  bookingReference: string;
  amount: number;
  currency: 'GBP';
}

export interface PaymentResult {
  status: PaymentStatus;
  provider: 'stripe';
  transactionId?: string;
  failureReason?: string;
}
