import { useState } from 'react';
import { CardElement, useElements, useStripe } from '@stripe/react-stripe-js';
import type { StripeCardElement } from '@stripe/stripe-js';
import type { PaymentResult } from '../../models/payment';
import styles from './PaymentStep.module.css';

interface PaymentStepProps {
  amount: number;
  payment: PaymentResult | null;
  isProcessing: boolean;
  onSubmitPayment: (getCardElement: () => StripeCardElement | null) => void;
  onRetry: () => void;
}

export function PaymentStep({ amount, payment, isProcessing, onSubmitPayment, onRetry }: PaymentStepProps) {
  const stripe = useStripe();
  const elements = useElements();
  const [cardError, setCardError] = useState<string | null>(null);

  if (payment?.status === 'success') {
    return (
      <div className={styles.wrapper}>
        <p className={styles.status}>Payment confirmed.</p>
      </div>
    );
  }

  if (payment?.status === 'failed' || payment?.status === 'cancelled') {
    return (
      <div className={styles.wrapper}>
        <p className={styles.statusError} role="alert">
          {payment.status === 'failed'
            ? `Payment could not be completed${payment.failureReason ? `: ${payment.failureReason}` : '.'}`
            : 'Payment was cancelled.'}
        </p>
        <button type="button" className={styles.retryButton} onClick={onRetry}>Return to review</button>
      </div>
    );
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setCardError(null);
    if (!stripe || !elements) return;
    onSubmitPayment(() => elements.getElement(CardElement));
  }

  return (
    <form className={styles.wrapper} onSubmit={handleSubmit}>
      <p className={styles.status}>Pay £{amount.toFixed(2)} securely via Stripe.</p>
      <div className={styles.cardElementWrapper}>
        <CardElement onChange={(e) => setCardError(e.error?.message ?? null)} />
      </div>
      {cardError && <p className={styles.statusError} role="alert">{cardError}</p>}
      <button type="submit" className={styles.payButton} disabled={!stripe || isProcessing}>
        {isProcessing ? 'Processing…' : 'Pay now'}
      </button>
    </form>
  );
}