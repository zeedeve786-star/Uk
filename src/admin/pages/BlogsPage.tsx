import { useState } from 'react';
import { useAsyncData } from '../hooks/useAsyncData';
import { blogsApi } from '../api/contentService';
import { Table } from '../ui/Table';
import { Badge } from '../ui/Badge';
import { Alert } from '../ui/Alert';
import { Button } from '../ui/Button';
import { Modal } from '../ui/Modal';
import { ConfirmDialog } from '../ui/ConfirmDialog';
import { Field, Input, Textarea } from '../ui/Input';
import { MediaPicker } from '../ui/MediaPicker';
import type { BlogRow, ContentStatus } from '../models';
import styles from './BlogsPage.module.css';

interface BlogFormState {
  title: string;
  slug: string;
  excerpt: string;
  content: string;
  featuredImageUrls: string[];
  category: string;
  metaTitle: string;
  metaDescription: string;
}

const emptyForm: BlogFormState = {
  title: '',
  slug: '',
  excerpt: '',
  content: '',
  featuredImageUrls: [],
  category: '',
  metaTitle: '',
  metaDescription: '',
};

export function BlogsPage() {
  const { data: blogs, status, setData } = useAsyncData(() => blogsApi.list(), []);
  const [editing, setEditing] = useState<BlogRow | null>(null);
  const [creating, setCreating] = useState(false);
  const [form, setForm] = useState<BlogFormState>(emptyForm);
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [pendingDelete, setPendingDelete] = useState<BlogRow | null>(null);

  if (status === 'loading') return <p>Loading…</p>;
  if (status === 'forbidden') return <Alert tone="error">You do not have permission to manage content.</Alert>;
  if (status === 'error') return <Alert tone="error">Unable to load blog posts.</Alert>;

  function openCreate() {
    setForm(emptyForm);
    setEditing(null);
    setCreating(true);
    setError(null);
  }

  function openEdit(blog: BlogRow) {
    setForm({
      title: blog.title,
      slug: blog.slug,
      excerpt: blog.excerpt ?? '',
      content: blog.content,
      featuredImageUrls: blog.featuredImageUrl ? [blog.featuredImageUrl] : [],
      category: blog.category ?? '',
      metaTitle: blog.metaTitle ?? '',
      metaDescription: blog.metaDescription ?? '',
    });
    setEditing(blog);
    setCreating(true);
    setError(null);
  }

  function toPayload(): Partial<BlogRow> {
    return {
      title: form.title,
      slug: form.slug || undefined,
      excerpt: form.excerpt || undefined,
      content: form.content,
      featuredImageUrl: form.featuredImageUrls[0] || undefined,
      category: form.category || undefined,
      metaTitle: form.metaTitle || undefined,
      metaDescription: form.metaDescription || undefined,
    } as Partial<BlogRow>;
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSubmitting(true);
    setError(null);
    try {
      if (editing) {
        const updated = await blogsApi.update(editing.id, toPayload());
        setData((blogs ?? []).map((b) => (b.id === updated.id ? updated : b)));
      } else {
        const created = await blogsApi.create(toPayload());
        setData([created, ...(blogs ?? [])]);
      }
      setCreating(false);
      setEditing(null);
    } catch {
      setError(
        editing
          ? 'Failed to update blog post — check the slug is unique.'
          : 'Failed to create blog post — check the slug is unique.',
      );
    } finally {
      setSubmitting(false);
    }
  }

  async function toggleStatus(blog: BlogRow) {
    const nextStatus: ContentStatus = blog.status === 'PUBLISHED' ? 'DRAFT' : 'PUBLISHED';
    const updated = await blogsApi.updateStatus(blog.id, nextStatus);
    setData((blogs ?? []).map((b) => (b.id === updated.id ? updated : b)));
  }

  async function confirmDelete() {
    if (!pendingDelete) return;
    await blogsApi.remove(pendingDelete.id);
    setData((blogs ?? []).filter((b) => b.id !== pendingDelete.id));
    setPendingDelete(null);
  }

  return (
    <div>
      <div className={styles.header}>
        <h1 className={styles.heading}>Blogs</h1>
        <Button onClick={openCreate}>New blog post</Button>
      </div>

      <Table
        rows={blogs ?? []}
        rowKey={(b) => b.id}
        emptyMessage="No blog posts yet."
        columns={[
          { key: 'title', header: 'Title', render: (b) => b.title },
          { key: 'slug', header: 'Slug', render: (b) => b.slug },
          { key: 'category', header: 'Category', render: (b) => b.category ?? '—' },
          {
            key: 'status',
            header: 'Status',
            render: (b) => (
              <Badge tone={b.status === 'PUBLISHED' ? 'success' : 'neutral'}>
                {b.status}
              </Badge>
            ),
          },
          {
            key: 'actions',
            header: '',
            render: (b) => (
              <div className={styles.rowActions}>
                <Button variant="secondary" onClick={() => openEdit(b)}>
                  Edit
                </Button>
                <Button variant="secondary" onClick={() => toggleStatus(b)}>
                  {b.status === 'PUBLISHED' ? 'Unpublish' : 'Publish'}
                </Button>
                <Button variant="danger" onClick={() => setPendingDelete(b)}>
                  Delete
                </Button>
              </div>
            ),
          },
        ]}
      />

      {creating && (
        <Modal
          title={editing ? 'Edit blog post' : 'New blog post'}
          onClose={() => setCreating(false)}
        >
          <form onSubmit={handleSubmit} className={styles.form}>
            {error && <Alert tone="error">{error}</Alert>}

            <Field label="Title">
              <Input
                required
                value={form.title}
                onChange={(e) => setForm({ ...form, title: e.target.value })}
              />
            </Field>

            <Field label="Slug (leave blank to generate from title)">
              <Input
                value={form.slug}
                onChange={(e) => setForm({ ...form, slug: e.target.value })}
              />
            </Field>

            <Field label="Excerpt">
              <Textarea
                rows={2}
                value={form.excerpt}
                onChange={(e) => setForm({ ...form, excerpt: e.target.value })}
              />
            </Field>

            <Field label="Content">
              <Textarea
                rows={8}
                required
                value={form.content}
                onChange={(e) => setForm({ ...form, content: e.target.value })}
              />
            </Field>

            <Field label="Featured image">
              <MediaPicker
                mediaType="IMAGE"
                multiple={false}
                value={form.featuredImageUrls}
                onChange={(urls) =>
                  setForm({ ...form, featuredImageUrls: urls })
                }
              />
            </Field>

            <Field label="Category">
              <Input
                value={form.category}
                onChange={(e) => setForm({ ...form, category: e.target.value })}
              />
            </Field>

            <Field label="Meta title">
              <Input
                value={form.metaTitle}
                onChange={(e) => setForm({ ...form, metaTitle: e.target.value })}
              />
            </Field>

            <Field label="Meta description">
              <Textarea
                rows={2}
                value={form.metaDescription}
                onChange={(e) =>
                  setForm({ ...form, metaDescription: e.target.value })
                }
              />
            </Field>

            <Button type="submit" disabled={submitting}>
              {submitting ? 'Saving…' : editing ? 'Save changes' : 'Create post'}
            </Button>
          </form>
        </Modal>
      )}

      {pendingDelete && (
        <ConfirmDialog
          title="Delete blog post"
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
