import { useState } from 'react';
import { useAsyncData } from '../hooks/useAsyncData';
import { serviceContentApi } from '../api/contentService';
import { Table } from '../ui/Table';
import { Badge } from '../ui/Badge';
import { Alert } from '../ui/Alert';
import { Button } from '../ui/Button';
import { Modal } from '../ui/Modal';
import { ConfirmDialog } from '../ui/ConfirmDialog';
import { Field, Input, Select, Textarea } from '../ui/Input';
import { MediaPicker } from '../ui/MediaPicker';
import type { ServiceContentRow, ServiceContentType, ContentStatus } from '../models';
import styles from './ServiceContentPage.module.css';

interface FormState {
  type: ServiceContentType;
  title: string;
  slug: string;
  description: string;
  eventType: string;
  imageUrls: string[];
  videoUrls: string[];
  relatedBlogSlugs: string;
  metaTitle: string;
  metaDescription: string;
}

const emptyForm: FormState = {
  type: 'AIRPORT', title: '', slug: '', description: '', eventType: '',
  imageUrls: [], videoUrls: [], relatedBlogSlugs: '', metaTitle: '', metaDescription: '',
};

const TYPE_TABS: { value: ServiceContentType | 'ALL'; label: string }[] = [
  { value: 'ALL', label: 'All' },
  { value: 'AIRPORT', label: 'Airport' },
  { value: 'RAILWAY', label: 'Railway' },
  { value: 'CRUISE', label: 'Cruise' },
  { value: 'EVENT', label: 'Event' },
];

function toCommaList(value: string): string[] {
  return value.split(',').map((v) => v.trim()).filter(Boolean);
}
function fromCommaList(values: string[]): string {
  return values.join(', ');
}

export function ServiceContentPage() {
  const { data: entries, status, setData } = useAsyncData(() => serviceContentApi.list(), []);
  const [activeTab, setActiveTab] = useState<ServiceContentType | 'ALL'>('ALL');
  const [editing, setEditing] = useState<ServiceContentRow | null>(null);
  const [creating, setCreating] = useState(false);
  const [form, setForm] = useState<FormState>(emptyForm);
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [pendingDelete, setPendingDelete] = useState<ServiceContentRow | null>(null);

  if (status === 'loading') return <p>Loading…</p>;
  if (status === 'forbidden') return <Alert tone="error">You do not have permission to manage content.</Alert>;
  if (status === 'error') return <Alert tone="error">Unable to load service content.</Alert>;

  const visibleEntries = (entries ?? []).filter((e) => activeTab === 'ALL' || e.type === activeTab);

  function openCreate() {
    setForm({ ...emptyForm, type: activeTab === 'ALL' ? 'AIRPORT' : activeTab });
    setEditing(null);
    setCreating(true);
    setError(null);
  }

  function openEdit(entry: ServiceContentRow) {
    setForm({
      type: entry.type,
      title: entry.title,
      slug: entry.slug,
      description: entry.description,
      eventType: entry.eventType ?? '',
      imageUrls: entry.imageUrls,
      videoUrls: entry.videoUrls,
      relatedBlogSlugs: fromCommaList(entry.relatedBlogSlugs),
      metaTitle: entry.metaTitle ?? '',
      metaDescription: entry.metaDescription ?? '',
    });
    setEditing(entry);
    setCreating(true);
    setError(null);
  }

  function toPayload(): Partial<ServiceContentRow> {
    return {
      type: form.type,
      title: form.title,
      slug: form.slug || undefined,
      description: form.description,
      eventType: form.type === 'EVENT' ? form.eventType || undefined : undefined,
      imageUrls: form.imageUrls,
      videoUrls: form.videoUrls,
      relatedBlogSlugs: toCommaList(form.relatedBlogSlugs),
      metaTitle: form.metaTitle || undefined,
      metaDescription: form.metaDescription || undefined,
    } as Partial<ServiceContentRow>;
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSubmitting(true);
    setError(null);
    try {
      if (editing) {
        const updated = await serviceContentApi.update(editing.id, toPayload());
        setData((entries ?? []).map((en) => (en.id === updated.id ? updated : en)));
      } else {
        const created = await serviceContentApi.create(toPayload());
        setData([created, ...(entries ?? [])]);
      }
      setCreating(false);
      setEditing(null);
    } catch {
      setError(editing ? 'Failed to update content — check the slug is unique.' : 'Failed to create content — check the slug is unique.');
    } finally {
      setSubmitting(false);
    }
  }

  async function toggleStatus(entry: ServiceContentRow) {
    const nextStatus: ContentStatus = entry.status === 'PUBLISHED' ? 'DRAFT' : 'PUBLISHED';
    const updated = await serviceContentApi.updateStatus(entry.id, nextStatus);
    setData((entries ?? []).map((en) => (en.id === updated.id ? updated : en)));
  }

  async function confirmDelete() {
    if (!pendingDelete) return;
    await serviceContentApi.remove(pendingDelete.id);
    setData((entries ?? []).filter((en) => en.id !== pendingDelete.id));
    setPendingDelete(null);
  }

  return (
    <div>
      <div className={styles.header}>
        <h1 className={styles.heading}>Service Content</h1>
        <Button onClick={openCreate}>New content</Button>
      </div>

      <div className={styles.tabs} role="tablist">
        {TYPE_TABS.map((tab) => (
          <button
            key={tab.value}
            type="button"
            role="tab"
            aria-selected={activeTab === tab.value}
            className={styles.tab}
            data-active={activeTab === tab.value}
            onClick={() => setActiveTab(tab.value)}
          >
            {tab.label}
          </button>
        ))}
      </div>

      <Table
        rows={visibleEntries}
        rowKey={(e) => e.id}
        emptyMessage="No content for this category yet."
        columns={[
          { key: 'type', header: 'Type', render: (e) => e.type },
          { key: 'title', header: 'Title', render: (e) => e.title },
          { key: 'slug', header: 'Slug', render: (e) => e.slug },
          { key: 'status', header: 'Status', render: (e) => <Badge tone={e.status === 'PUBLISHED' ? 'success' : 'neutral'}>{e.status}</Badge> },
          {
            key: 'actions', header: '', render: (e) => (
              <div className={styles.rowActions}>
                <Button variant="secondary" onClick={() => openEdit(e)}>Edit</Button>
                <Button variant="secondary" onClick={() => toggleStatus(e)}>
                  {e.status === 'PUBLISHED' ? 'Unpublish' : 'Publish'}
                </Button>
                <Button variant="danger" onClick={() => setPendingDelete(e)}>Delete</Button>
              </div>
            ),
          },
        ]}
      />

      {creating && (
        <Modal title={editing ? 'Edit content' : 'New content'} onClose={() => setCreating(false)}>
          <form onSubmit={handleSubmit} className={styles.form}>
            {error && <Alert tone="error">{error}</Alert>}
            <Field label="Type">
              <Select
                value={form.type}
                disabled={Boolean(editing)}
                onChange={(e) => setForm({ ...form, type: e.target.value as ServiceContentType })}
              >
                <option value="AIRPORT">Airport</option>
                <option value="RAILWAY">Railway</option>
                <option value="CRUISE">Cruise</option>
                <option value="EVENT">Event</option>
              </Select>
            </Field>
            <Field label="Title">
              <Input required value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} />
            </Field>
            <Field label="Slug (leave blank to generate from title)">
              <Input value={form.slug} onChange={(e) => setForm({ ...form, slug: e.target.value })} />
            </Field>
            <Field label="Description">
              <Textarea rows={5} required value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} />
            </Field>
            {form.type === 'EVENT' && (
              <Field label="Event type">
                <Input value={form.eventType} onChange={(e) => setForm({ ...form, eventType: e.target.value })} placeholder="Wedding, corporate, etc." />
              </Field>
            )}
            <Field label="Images">
              <MediaPicker
                mediaType="IMAGE"
                multiple
                value={form.imageUrls}
                onChange={(urls) => setForm({ ...form, imageUrls: urls })}
              />
            </Field>
            <Field label="Videos">
              <MediaPicker
                mediaType="VIDEO"
                multiple
                value={form.videoUrls}
                onChange={(urls) => setForm({ ...form, videoUrls: urls })}
              />
            </Field>
            <Field label="Related blog slugs (comma-separated)">
              <Input value={form.relatedBlogSlugs} onChange={(e) => setForm({ ...form, relatedBlogSlugs: e.target.value })} />
            </Field>
            <Field label="Meta title">
              <Input value={form.metaTitle} onChange={(e) => setForm({ ...form, metaTitle: e.target.value })} />
            </Field>
            <Field label="Meta description">
              <Textarea rows={2} value={form.metaDescription} onChange={(e) => setForm({ ...form, metaDescription: e.target.value })} />
            </Field>
            <Button type="submit" disabled={submitting}>{submitting ? 'Saving…' : editing ? 'Save changes' : 'Create content'}</Button>
          </form>
        </Modal>
      )}

      {pendingDelete && (
        <ConfirmDialog
          title="Delete content"
          message={`Delete "${pendingDelete.title}"? This cannot be undone.`}
          confirmLabel="Delete"
          destructive
          onConfirm={confirmDelete}
          onCancel={() => setPendingDelete(null)}
        />
      )}
    </div>
  );
}