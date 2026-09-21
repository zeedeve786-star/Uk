import type { PaymentResult } from '../models/payment';
import { apiPost } from './httpClient';
import { getStripe } from './stripeClient';

interface BackendPaymentResponse {
  bookingReference: string;
  paymentIntentId: string;
  clientSecret: string;
  amount: number;
  currency: 'GBP';
  status: string;
}

export async function createPaymentIntent(
  bookingReference: string,
): Promise<{ clientSecret: string; paymentIntentId: string }> {
  const response = await apiPost<BackendPaymentResponse>('/payments', { bookingReference });
  return { clientSecret: response.clientSecret, paymentIntentId: response.paymentIntentId };
}

export async function confirmCardPayment(
  clientSecret: string,
  cardElement: unknown,
): Promise<PaymentResult> {
  const stripe = await getStripe();

  if (!stripe) {
    return {
      status: 'failed',
      provider: 'stripe',
      failureReason: 'Stripe failed to load',
    };
  }

  const result = await stripe.confirmCardPayment(clientSecret, {
    payment_method: { card: cardElement as any },
  });

  if (result.error) {
    return {
      status: 'failed',
      provider: 'stripe',
      failureReason: result.error.message,
    };
  }

  if (result.paymentIntent?.status === 'succeeded') {
    return {
      status: 'success',
      provider: 'stripe',
      transactionId: result.paymentIntent.id,
    };
  }

  return {
    status: 'pending',
    provider: 'stripe',
    transactionId: result.paymentIntent?.id,
  };
}