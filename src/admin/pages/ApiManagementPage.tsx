import { useEffect, useState } from 'react';
import { apiManagementApi } from '../api/adminService';
import type { ApiIntegrationRow, ApiStatus } from '../models';
import { Button } from '../ui/Button';
import { Input, Field, Select } from '../ui/Input';
import { Modal } from '../ui/Modal';
import { ConfirmDialog } from '../ui/ConfirmDialog';
import { Alert } from '../ui/Alert';
import styles from './ApiManagementPage.module.css';

type ApiForm = {
  name: string;
  provider: string;
  baseUrl: string;
  apiKey: string;
  description: string;
  status: ApiStatus;
};

const emptyForm: ApiForm = {
  name: '',
  provider: '',
  baseUrl: '',
  apiKey: '',
  description: '',
  status: 'ACTIVE',
};

export function ApiManagementPage() {
  const [items, setItems] = useState<ApiIntegrationRow[]>([]);
  const [form, setForm] = useState<ApiForm>(emptyForm);
  const [editing, setEditing] = useState<ApiIntegrationRow | null>(null);
  const [removing, setRemoving] = useState<ApiIntegrationRow | null>(null);
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  const load = async () => {
    setLoading(true);
    setError('');

    try {
      const data = await apiManagementApi.list();
      setItems(data);
    } catch {
      setError('Unable to load API integrations.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void load();
  }, []);

  const openCreate = () => {
    setEditing(null);
    setForm(emptyForm);
    setError('');
    setOpen(true);
  };

  const openEdit = (item: ApiIntegrationRow) => {
    setEditing(item);
    setForm({
      name: item.name,
      provider: item.provider,
      baseUrl: item.baseUrl,
      apiKey: '',
      description: item.description ?? '',
      status: item.status,
    });
    setError('');
    setOpen(true);
  };

  const save = async () => {
    if (!form.name.trim() || !form.provider.trim() || !form.baseUrl.trim()) {
      setError('Name, provider and Base URL are required.');
      return;
    }

    setSaving(true);
    setError('');

    try {
      const payload = {
        name: form.name.trim(),
        provider: form.provider.trim(),
        baseUrl: form.baseUrl.trim(),
        description: form.description.trim() || undefined,
        status: form.status,
        ...(form.apiKey.trim() ? { apiKey: form.apiKey.trim() } : {}),
      };

      if (editing) {
        await apiManagementApi.update(editing.id, payload);
      } else {
        await apiManagementApi.create(payload);
      }

      setOpen(false);
      await load();
    } catch {
      setError('Unable to save API integration.');
    } finally {
      setSaving(false);
    }
  };

  const remove = async () => {
    if (!removing) return;

    try {
      await apiManagementApi.remove(removing.id);
      setRemoving(null);
      await load();
    } catch {
      setError('Unable to remove API integration.');
    }
  };

  const toggleStatus = async (item: ApiIntegrationRow) => {
    try {
      await apiManagementApi.update(item.id, {
        status: item.status === 'ACTIVE' ? 'INACTIVE' : 'ACTIVE',
      });
      await load();
    } catch {
      setError('Unable to update API status.');
    }
  };

  return (
    <section>
      <div className={styles.header}>
        <div>
          <h1 className={styles.heading}>API Management</h1>
          <p className={styles.note}>
            Master Admin controls external API integrations used by the platform.
          </p>
        </div>

        <Button onClick={openCreate}>Add API</Button>
      </div>

      {error && <Alert>{error}</Alert>}

      {loading ? (
        <p>Loading API integrations...</p>
      ) : items.length === 0 ? (
        <div className={styles.empty}>
          <p>No API integrations configured.</p>
          <Button onClick={openCreate}>Add API</Button>
        </div>
      ) : (
        <div className={styles.tableWrap}>
          <table className={styles.table}>
            <thead>
              <tr>
                <th>Name</th>
                <th>Provider</th>
                <th>Base URL</th>
                <th>API Key</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {items.map((item) => (
                <tr key={item.id}>
                  <td>{item.name}</td>
                  <td>{item.provider}</td>
                  <td className={styles.url}>{item.baseUrl}</td>
                  <td>{item.apiKey ? 'Configured' : 'Not configured'}</td>
                  <td>
                    <button
                      type="button"
                      className={styles.status}
                      onClick={() => void toggleStatus(item)}
                    >
                      {item.status}
                    </button>
                  </td>
                  <td>
                    <div className={styles.actions}>
                      <Button variant="secondary" onClick={() => openEdit(item)}>
                        Edit
                      </Button>
                      <Button variant="danger" onClick={() => setRemoving(item)}>
                        Remove
                      </Button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {open && (
        <Modal
          onClose={() => setOpen(false)}
          title={editing ? 'Edit API Integration' : 'Add API Integration'}
        >
        <div className={styles.form}>
          <Field label="Name">
            <Input
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
              placeholder="Stripe"
            />
          </Field>

          <Field label="Provider">
            <Input
              value={form.provider}
              onChange={(e) => setForm({ ...form, provider: e.target.value })}
              placeholder="Stripe"
            />
          </Field>

          <Field label="Base URL">
            <Input
              value={form.baseUrl}
              onChange={(e) => setForm({ ...form, baseUrl: e.target.value })}
              placeholder="https://api.example.com"
            />
          </Field>

          <Field label={editing ? 'API Key (leave blank to keep existing)' : 'API Key'}>
            <Input
              type="password"
              value={form.apiKey}
              onChange={(e) => setForm({ ...form, apiKey: e.target.value })}
              autoComplete="new-password"
            />
          </Field>

          <Field label="Description">
            <Input
              value={form.description}
              onChange={(e) => setForm({ ...form, description: e.target.value })}
            />
          </Field>

          <Field label="Status">
            <Select
              value={form.status}
              onChange={(e) =>
                setForm({ ...form, status: e.target.value as ApiStatus })
              }
            >
              <option value="ACTIVE">Active</option>
              <option value="INACTIVE">Inactive</option>
            </Select>
          </Field>

          <div className={styles.modalActions}>
            <Button variant="secondary" onClick={() => setOpen(false)}>
              Cancel
            </Button>
            <Button onClick={() => void save()} disabled={saving}>
              {saving ? 'Saving...' : editing ? 'Save Changes' : 'Add API'}
            </Button>
          </div>
        </div>
        </Modal>
      )}

      {removing && (
        <ConfirmDialog
          title="Remove API Integration"
          message={`Remove ${removing.name}?`}
          confirmLabel="Remove"
          destructive
          onConfirm={() => void remove()}
          onCancel={() => setRemoving(null)}
        />
      )}
    </section>
  );
}
