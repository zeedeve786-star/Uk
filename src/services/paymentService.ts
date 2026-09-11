import type { PaymentRequest, PaymentResult } from '../models/payment';

export async function submitMockPayment(request: PaymentRequest): Promise<PaymentResult> {
  await new Promise((resolve) => setTimeout(resolve, 600));

  if (request.amount <= 0) {
    return { status: 'failed', provider: 'stripe', failureReason: 'Invalid amount' };
  }

  return {
    status: 'success',
    provider: 'stripe',
    transactionId: `mock_${Math.random().toString(36).slice(2, 10)}`,
  };
}
