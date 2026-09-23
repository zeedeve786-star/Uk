import { useState } from 'react';
import { useAsyncData } from '../hooks/useAsyncData';
import { vehicleContentApi } from '../api/contentService';
import { Table } from '../ui/Table';
import { Badge } from '../ui/Badge';
import { Alert } from '../ui/Alert';
import { Button } from '../ui/Button';
import { Modal } from '../ui/Modal';
import { ConfirmDialog } from '../ui/ConfirmDialog';
import { Field, Input, Textarea } from '../ui/Input';
import { MediaPicker } from '../ui/MediaPicker';
import type { VehicleCategoryId, VehicleContentRow } from '../models';
import styles from './VehicleContentPage.module.css';

const VEHICLE_CATEGORIES: { id: VehicleCategoryId; label: string }[] = [
  { id: 'saloon', label: 'Saloon' },
  { id: 'estate', label: 'Estate' },
  { id: 'mpv', label: 'MPV' },
  { id: 'executive', label: 'Executive' },
  { id: 'eight-seater', label: '8-Seater' },
];

interface FormState {
  title: string;
  description: string;
  imageUrls: string[];
  videoUrls: string[];
  active: boolean;
}

const emptyForm: FormState = { title: '', description: '', imageUrls: [], videoUrls: [], active: true };

function toCommaList(value: string): string[] {
  return value.split(',').map((v) => v.trim()).filter(Boolean);
}
function fromCommaList(values: string[]): string {
  return values.join(', ');
}

export function VehicleContentPage() {
  const { data: entries, status, setData } = useAsyncData(() => vehicleContentApi.list(), []);
  const [activeCategory, setActiveCategory] = useState<VehicleCategoryId | null>(null);
  const [editingEntry, setEditingEntry] = useState<VehicleContentRow | null>(null);
  const [form, setForm] = useState<FormState>(emptyForm);
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [pendingDelete, setPendingDelete] = useState<VehicleContentRow | null>(null);

  if (status === 'loading') return <p>Loading…</p>;
  if (status === 'forbidden') return <Alert tone="error">You do not have permission to manage content.</Alert>;
  if (status === 'error') return <Alert tone="error">Unable to load vehicle content.</Alert>;

  const entriesByCategory = new Map((entries ?? []).map((e) => [e.vehicleCategory, e]));

  function openCreate(categoryId: VehicleCategoryId) {
    setActiveCategory(categoryId);
    setEditingEntry(null);
    setForm(emptyForm);
    setError(null);
  }

  function openEdit(entry: VehicleContentRow) {
    setActiveCategory(entry.vehicleCategory);
    setEditingEntry(entry);
    setForm({
      title: entry.title,
      description: entry.description,
      imageUrls: entry.imageUrls,
      videoUrls: entry.videoUrls,
      active: entry.active,
    });
    setError(null);
  }

  function closeModal() {
    setActiveCategory(null);
    setEditingEntry(null);
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!activeCategory) return;
    setSubmitting(true);
    setError(null);
    const payload = {
      title: form.title,
      description: form.description,
      imageUrls: form.imageUrls,
      videoUrls: form.videoUrls,
      active: form.active,
    };
    try {
      if (editingEntry) {
        const updated = await vehicleContentApi.update(editingEntry.id, payload);
        setData((entries ?? []).map((en) => (en.id === updated.id ? updated : en)));
      } else {
        const created = await vehicleContentApi.create({ vehicleCategory: activeCategory, ...payload });
        setData([...(entries ?? []), created]);
      }
      closeModal();
    } catch {
      setError('Failed to save vehicle content.');
    } finally {
      setSubmitting(false);
    }
  }

  async function toggleActive(entry: VehicleContentRow) {
    const updated = await vehicleContentApi.update(entry.id, { active: !entry.active });
    setData((entries ?? []).map((en) => (en.id === updated.id ? updated : en)));
  }

  async function confirmDelete() {
    if (!pendingDelete) return;
    await vehicleContentApi.remove(pendingDelete.id);
    setData((entries ?? []).filter((en) => en.id !== pendingDelete.id));
    setPendingDelete(null);
  }

  return (
    <div>
      <h1 className={styles.heading}>Vehicle Content</h1>
      <p className={styles.note}>
        Presentation content only — fares and vehicle categories themselves remain controlled by the Fare Engine.
      </p>

      <Table
        rows={VEHICLE_CATEGORIES}
        rowKey={(c) => c.id}
        columns={[
          { key: 'category', header: 'Category', render: (c) => c.label },
          {
            key: 'title', header: 'Title', render: (c) => entriesByCategory.get(c.id)?.title ?? <span className={styles.notConfigured}>Not yet configured</span>,
          },
          {
            key: 'status', header: 'Status', render: (c) => {
              const entry = entriesByCategory.get(c.id);
              if (!entry) return '—';
              return <Badge tone={entry.active ? 'success' : 'neutral'}>{entry.active ? 'Active' : 'Inactive'}</Badge>;
            },
          },
          {
            key: 'actions', header: '', render: (c) => {
              const entry = entriesByCategory.get(c.id);
              if (!entry) {
                return <Button variant="secondary" onClick={() => openCreate(c.id)}>Add content</Button>;
              }
              return (
                <div className={styles.rowActions}>
                  <Button variant="secondary" onClick={() => openEdit(entry)}>Edit</Button>
                  <Button variant="secondary" onClick={() => toggleActive(entry)}>{entry.active ? 'Deactivate' : 'Activate'}</Button>
                  <Button variant="danger" onClick={() => setPendingDelete(entry)}>Delete</Button>
                </div>
              );
            },
          },
        ]}
      />

      {activeCategory && (
        <Modal
          title={`${editingEntry ? 'Edit' : 'Add'} content — ${VEHICLE_CATEGORIES.find((c) => c.id === activeCategory)?.label}`}
          onClose={closeModal}
        >
          <form onSubmit={handleSubmit} className={styles.form}>
            {error && <Alert tone="error">{error}</Alert>}
            <Field label="Title">
              <Input required value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} />
            </Field>
            <Field label="Description">
              <Textarea rows={5} required value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} />
            </Field>
            <Field label="Images">
              <MediaPicker mediaType="IMAGE" multiple value={form.imageUrls} onChange={(urls) => setForm({ ...form, imageUrls: urls })} />
            </Field>
            <Field label="Videos">
              <MediaPicker mediaType="VIDEO" multiple value={form.videoUrls} onChange={(urls) => setForm({ ...form, videoUrls: urls })} />
            </Field>
            <label className={styles.checkboxRow}>
              <input type="checkbox" checked={form.active} onChange={(e) => setForm({ ...form, active: e.target.checked })} />
              <span>Active</span>
            </label>
            <Button type="submit" disabled={submitting}>{submitting ? 'Saving…' : editingEntry ? 'Save changes' : 'Create content'}</Button>
          </form>
        </Modal>
      )}

      {pendingDelete && (
        <ConfirmDialog
          title="Delete vehicle content"
          message={`Delete content for "${pendingDelete.title}"? This cannot be undone.`}
          confirmLabel="Delete"
          destructive
          onConfirm={confirmDelete}
          onCancel={() => setPendingDelete(null)}
        />
      )}
    </div>
  );
}