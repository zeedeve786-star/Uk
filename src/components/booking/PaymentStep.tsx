import type { PaymentResult } from '../../models/payment';
import styles from './PaymentStep.module.css';

interface PaymentStepProps {
  amount: number;
  payment: PaymentResult | null;
  isProcessing: boolean;
  onRetry: () => void;
}

export function PaymentStep({ amount, payment, isProcessing, onRetry }: PaymentStepProps) {
  if (isProcessing || !payment) {
    return (
      <div className={styles.wrapper} role="status">
        <p className={styles.status}>Processing your payment of £{amount.toFixed(2)} securely via Stripe…</p>
      </div>
    );
  }

  if (payment.status === 'failed' || payment.status === 'cancelled') {
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

  return (
    <div className={styles.wrapper}>
      <p className={styles.status}>Payment confirmed.</p>
    </div>
  );
}
