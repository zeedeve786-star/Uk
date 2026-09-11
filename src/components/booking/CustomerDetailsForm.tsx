import { useState } from 'react';
import type { CustomerDetails, CustomerDetailsValidationErrors } from '../../models/booking';
import styles from './CustomerDetailsForm.module.css';

interface CustomerDetailsFormProps {
  initialValue?: CustomerDetails | null;
  onSubmit: (details: CustomerDetails) => void;
  onBack: () => void;
}

const emptyDetails: CustomerDetails = {
  fullName: '',
  email: '',
  phone: '',
  leadPassengerName: '',
  passengerCount: 1,
  luggageNotes: '',
  notes: '',
};

function validate(details: CustomerDetails): CustomerDetailsValidationErrors {
  const errors: CustomerDetailsValidationErrors = {};
  if (!details.fullName.trim()) errors.fullName = 'Enter your full name.';
  if (!/^\S+@\S+\.\S+$/.test(details.email)) errors.email = 'Enter a valid email address.';
  if (!/^[0-9+()\s-]{7,}$/.test(details.phone)) errors.phone = 'Enter a valid phone number.';
  if (!details.leadPassengerName.trim()) errors.leadPassengerName = 'Enter the lead passenger name.';
  if (details.passengerCount < 1) errors.passengerCount = 'Enter at least one passenger.';
  return errors;
}

export function CustomerDetailsForm({ initialValue, onSubmit, onBack }: CustomerDetailsFormProps) {
  const [details, setDetails] = useState<CustomerDetails>(initialValue ?? emptyDetails);
  const [errors, setErrors] = useState<CustomerDetailsValidationErrors>({});

  function updateField<K extends keyof CustomerDetails>(key: K, value: CustomerDetails[K]) {
    setDetails((prev) => ({ ...prev, [key]: value }));
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const validationErrors = validate(details);
    setErrors(validationErrors);
    if (Object.keys(validationErrors).length === 0) onSubmit(details);
  }

  return (
    <form className={styles.form} onSubmit={handleSubmit} noValidate>
      <div className={styles.grid}>
        <label className={styles.field}>
          <span className={styles.labelText}>Full name</span>
          <input type="text" value={details.fullName} onChange={(e) => updateField('fullName', e.target.value)} aria-invalid={Boolean(errors.fullName)} />
          {errors.fullName && <span className={styles.error} role="alert">{errors.fullName}</span>}
        </label>

        <label className={styles.field}>
          <span className={styles.labelText}>Email</span>
          <input type="email" value={details.email} onChange={(e) => updateField('email', e.target.value)} aria-invalid={Boolean(errors.email)} />
          {errors.email && <span className={styles.error} role="alert">{errors.email}</span>}
        </label>

        <label className={styles.field}>
          <span className={styles.labelText}>Phone</span>
          <input type="tel" value={details.phone} onChange={(e) => updateField('phone', e.target.value)} aria-invalid={Boolean(errors.phone)} />
          {errors.phone && <span className={styles.error} role="alert">{errors.phone}</span>}
        </label>

        <label className={styles.field}>
          <span className={styles.labelText}>Lead passenger name</span>
          <input type="text" value={details.leadPassengerName} onChange={(e) => updateField('leadPassengerName', e.target.value)} aria-invalid={Boolean(errors.leadPassengerName)} />
          {errors.leadPassengerName && <span className={styles.error} role="alert">{errors.leadPassengerName}</span>}
        </label>

        <label className={styles.field}>
          <span className={styles.labelText}>Passenger count</span>
          <input type="number" min={1} max={16} value={details.passengerCount} onChange={(e) => updateField('passengerCount', Number(e.target.value))} aria-invalid={Boolean(errors.passengerCount)} />
          {errors.passengerCount && <span className={styles.error} role="alert">{errors.passengerCount}</span>}
        </label>

        <label className={styles.field}>
          <span className={styles.labelText}>Luggage information (optional)</span>
          <input type="text" value={details.luggageNotes} onChange={(e) => updateField('luggageNotes', e.target.value)} />
        </label>

        <label className={styles.fieldWide}>
          <span className={styles.labelText}>Notes for the driver (optional)</span>
          <textarea rows={3} value={details.notes} onChange={(e) => updateField('notes', e.target.value)} />
        </label>
      </div>

      <div className={styles.actions}>
        <button type="button" className={styles.backButton} onClick={onBack}>Back</button>
        <button type="submit" className={styles.submit}>Continue to review</button>
      </div>
    </form>
  );
}
