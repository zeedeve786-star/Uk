import { useState } from 'react';
import { useAsyncData } from '../hooks/useAsyncData';
import { availabilityApi } from '../api/availabilityService';
import { Table } from '../ui/Table';
import { Alert } from '../ui/Alert';
import { Button } from '../ui/Button';
import { Modal } from '../ui/Modal';
import { ConfirmDialog } from '../ui/ConfirmDialog';
import { Field, Input, Select } from '../ui/Input';
import { Card } from '../ui/Card';
import { Badge } from '../ui/Badge';
import type { AvailabilityBlockRow, AvailabilityCheckResult, VehicleCategoryId } from '../models';
import styles from './AvailabilityPage.module.css';

const VEHICLE_CATEGORIES: { id: VehicleCategoryId; label: string }[] = [
  { id: 'saloon', label: 'Saloon' },
  { id: 'estate', label: 'Estate' },
  { id: 'mpv', label: 'MPV' },
  { id: 'executive', label: 'Executive' },
  { id: 'eight-seater', label: '8-Seater' },
];

interface BlockFormState {
  vehicleCategory: VehicleCategoryId;
  startsAt: string;
  endsAt: string;
  reason: string;
}

const emptyBlockForm: BlockFormState = { vehicleCategory: 'saloon', startsAt: '', endsAt: '', reason: '' };

export function AvailabilityPage() {
  const { data: blocks, status, setData } = useAsyncData(() => availabilityApi.listBlocks(), []);
  const [creating, setCreating] = useState(false);
  const [form, setForm] = useState<BlockFormState>(emptyBlockForm);
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [pendingDelete, setPendingDelete] = useState<AvailabilityBlockRow | null>(null);

  const [checkForm, setCheckForm] = useState<{ vehicleCategory: VehicleCategoryId; date: string; time: string }>({
    vehicleCategory: 'saloon', date: '', time: '',
  });
  const [checkResult, setCheckResult] = useState<AvailabilityCheckResult | null>(null);
  const [checking, setChecking] = useState(false);

  if (status === 'loading') return <p>Loading…</p>;
  if (status === 'forbidden') return <Alert tone="error">You do not have permission to manage availability.</Alert>;
  if (status === 'error') return <Alert tone="error">Unable to load availability blocks.</Alert>;

  async function handleCreate(e: React.FormEvent) {
    e.preventDefault();
    setSubmitting(true);
    setError(null);
    try {
      const created = await availabilityApi.createBlock({
        vehicleCategory: form.vehicleCategory,
        startsAt: new Date(form.startsAt).toISOString(),
        endsAt: new Date(form.endsAt).toISOString(),
        reason: form.reason || undefined,
      });
      setData([...(blocks ?? []), created]);
      setCreating(false);
      setForm(emptyBlockForm);
    } catch {
      setError('Failed to create block — check that the end time is after the start time.');
    } finally {
      setSubmitting(false);
    }
  }

  async function confirmDelete() {
    if (!pendingDelete) return;
    await availabilityApi.deleteBlock(pendingDelete.id);
    setData((blocks ?? []).filter((b) => b.id !== pendingDelete.id));
    setPendingDelete(null);
  }

  async function handleCheck(e: React.FormEvent) {
    e.preventDefault();
    setChecking(true);
    setCheckResult(null);
    try {
      const result = await availabilityApi.check(checkForm);
      setCheckResult(result);
    } finally {
      setChecking(false);
    }
  }

  return (
    <div>
      <div className={styles.header}>
        <h1 className={styles.heading}>Availability</h1>
        <Button onClick={() => setCreating(true)}>New block</Button>
      </div>

      <Table
        rows={blocks ?? []}
        rowKey={(b) => b.id}
        emptyMessage="No availability blocks yet."
        columns={[
          { key: 'category', header: 'Vehicle category', render: (b) => b.vehicleCategory },
          { key: 'starts', header: 'From', render: (b) => new Date(b.startsAt).toLocaleString('en-GB') },
          { key: 'ends', header: 'Until', render: (b) => new Date(b.endsAt).toLocaleString('en-GB') },
          { key: 'reason', header: 'Reason', render: (b) => b.reason ?? '—' },
          { key: 'actions', header: '', render: (b) => <Button variant="danger" onClick={() => setPendingDelete(b)}>Delete</Button> },
        ]}
      />

      <Card className={styles.checkCard}>
        <p className={styles.checkHeading}>Check availability</p>
        <form onSubmit={handleCheck} className={styles.checkForm}>
          <Field label="Vehicle category">
            <Select value={checkForm.vehicleCategory} onChange={(e) => setCheckForm({ ...checkForm, vehicleCategory: e.target.value as VehicleCategoryId })}>
              {VEHICLE_CATEGORIES.map((c) => <option key={c.id} value={c.id}>{c.label}</option>)}
            </Select>
          </Field>
          <Field label="Date">
            <Input type="date" required value={checkForm.date} onChange={(e) => setCheckForm({ ...checkForm, date: e.target.value })} />
          </Field>
          <Field label="Time">
            <Input type="time" required value={checkForm.time} onChange={(e) => setCheckForm({ ...checkForm, time: e.target.value })} />
          </Field>
          <Button type="submit" disabled={checking}>{checking ? 'Checking…' : 'Check'}</Button>
        </form>

        {checkResult && (
          <div className={styles.checkResult}>
            <Badge tone={checkResult.available ? 'success' : 'danger'}>
              {checkResult.available ? 'Available' : 'Not available'}
            </Badge>
            {checkResult.conflictingBlocks.length > 0 && (
              <p className={styles.conflictNote}>
                Blocked: {checkResult.conflictingBlocks.map((b) => b.reason ?? 'Unspecified reason').join(', ')}
              </p>
            )}
            {checkResult.conflictingBookings.length > 0 && (
              <p className={styles.conflictNote}>
                Existing booking(s) at this slot: {checkResult.conflictingBookings.map((b) => b.bookingReference).join(', ')}
              </p>
            )}
          </div>
        )}
      </Card>

      {creating && (
        <Modal title="New availability block" onClose={() => setCreating(false)}>
          <form onSubmit={handleCreate} className={styles.form}>
            {error && <Alert tone="error">{error}</Alert>}
            <Field label="Vehicle category">
              <Select value={form.vehicleCategory} onChange={(e) => setForm({ ...form, vehicleCategory: e.target.value as VehicleCategoryId })}>
                {VEHICLE_CATEGORIES.map((c) => <option key={c.id} value={c.id}>{c.label}</option>)}
              </Select>
            </Field>
            <Field label="From">
              <Input type="datetime-local" required value={form.startsAt} onChange={(e) => setForm({ ...form, startsAt: e.target.value })} />
            </Field>
            <Field label="Until">
              <Input type="datetime-local" required value={form.endsAt} onChange={(e) => setForm({ ...form, endsAt: e.target.value })} />
            </Field>
            <Field label="Reason (optional)">
              <Input value={form.reason} onChange={(e) => setForm({ ...form, reason: e.target.value })} placeholder="Maintenance, holiday, etc." />
            </Field>
            <Button type="submit" disabled={submitting}>{submitting ? 'Saving…' : 'Create block'}</Button>
          </form>
        </Modal>
      )}

      {pendingDelete && (
        <ConfirmDialog
          title="Delete availability block"
          message="Delete this availability block? This cannot be undone."
          confirmLabel="Delete"
          destructive
          onConfirm={confirmDelete}
          onCancel={() => setPendingDelete(null)}
        />
      )}
    </div>
  );
}
