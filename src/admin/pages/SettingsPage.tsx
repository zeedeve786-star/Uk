import { useEffect, useState } from 'react';
import { useAsyncData } from '../hooks/useAsyncData';
import { settingsApi } from '../api/settingsService';
import { Card } from '../ui/Card';
import { Field, Input } from '../ui/Input';
import { Button } from '../ui/Button';
import { Alert } from '../ui/Alert';
import styles from './SettingsPage.module.css';

interface FormState {
  companyName: string;
  phoneDisplay: string;
  phoneTel: string;
  whatsappNumber: string;
  contactEmail: string;
  logoUrl: string;
  tickerMessage: string;
}

const emptyForm: FormState = {
  companyName: '', phoneDisplay: '', phoneTel: '', whatsappNumber: '', contactEmail: '', logoUrl: '', tickerMessage: '',
};

export function SettingsPage() {
  const { data: settings, status } = useAsyncData(() => settingsApi.get(), []);
  const [form, setForm] = useState<FormState>(emptyForm);
  const [submitting, setSubmitting] = useState(false);
  const [feedback, setFeedback] = useState<{ tone: 'success' | 'error'; message: string } | null>(null);

  useEffect(() => {
    if (settings) {
      setForm({
        companyName: settings.companyName ?? '',
        phoneDisplay: settings.phoneDisplay ?? '',
        phoneTel: settings.phoneTel ?? '',
        whatsappNumber: settings.whatsappNumber ?? '',
        contactEmail: settings.contactEmail ?? '',
        logoUrl: settings.logoUrl ?? '',
        tickerMessage: settings.tickerMessage ?? '',
      });
    }
  }, [settings]);

  if (status === 'loading') return <p>Loading…</p>;
  if (status === 'forbidden') return <Alert tone="error">You do not have permission to manage settings.</Alert>;
  if (status === 'error') return <Alert tone="error">Unable to load settings.</Alert>;

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSubmitting(true);
    setFeedback(null);
    try {
      await settingsApi.update({
        companyName: form.companyName || undefined,
        phoneDisplay: form.phoneDisplay || undefined,
        phoneTel: form.phoneTel || undefined,
        whatsappNumber: form.whatsappNumber || undefined,
        contactEmail: form.contactEmail || undefined,
        logoUrl: form.logoUrl || undefined,
        tickerMessage: form.tickerMessage || undefined,
      });
      setFeedback({ tone: 'success', message: 'Settings saved.' });
    } catch {
      setFeedback({ tone: 'error', message: 'Failed to save settings — check the email and logo URL are valid.' });
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div>
      <h1 className={styles.heading}>Settings</h1>
      {feedback && <Alert tone={feedback.tone}>{feedback.message}</Alert>}

      <Card className={styles.card}>
        <form onSubmit={handleSubmit} className={styles.form}>
          <Field label="Company name">
            <Input value={form.companyName} onChange={(e) => setForm({ ...form, companyName: e.target.value })} />
          </Field>
          <Field label="Phone (display)">
            <Input value={form.phoneDisplay} onChange={(e) => setForm({ ...form, phoneDisplay: e.target.value })} placeholder="+44 0000 000000" />
          </Field>
          <Field label="Phone (tel: link, digits only)">
            <Input value={form.phoneTel} onChange={(e) => setForm({ ...form, phoneTel: e.target.value })} placeholder="+440000000000" />
          </Field>
          <Field label="WhatsApp number">
            <Input value={form.whatsappNumber} onChange={(e) => setForm({ ...form, whatsappNumber: e.target.value })} />
          </Field>
          <Field label="Contact email">
            <Input type="email" value={form.contactEmail} onChange={(e) => setForm({ ...form, contactEmail: e.target.value })} />
          </Field>
          <Field label="Logo URL">
            <Input type="url" value={form.logoUrl} onChange={(e) => setForm({ ...form, logoUrl: e.target.value })} />
          </Field>
          <Field label="Ticker message">
            <Input value={form.tickerMessage} onChange={(e) => setForm({ ...form, tickerMessage: e.target.value })} />
          </Field>
          <Button type="submit" disabled={submitting}>{submitting ? 'Saving…' : 'Save settings'}</Button>
        </form>
      </Card>
    </div>
  );
}