import { useState } from 'react';
import { useAsyncData } from '../hooks/useAsyncData';
import { driversApi } from '../api/driverService';
import { usersApi } from '../api/adminService';
import { Table } from '../ui/Table';
import { Badge } from '../ui/Badge';
import { Alert } from '../ui/Alert';
import { Button } from '../ui/Button';
import { Modal } from '../ui/Modal';
import { Field, Input, Select } from '../ui/Input';
import type { DriverProfileRow, VehicleCategoryId, AdminUserRow } from '../models';
import styles from './DriversPage.module.css';

const VEHICLE_CATEGORIES: { id: VehicleCategoryId; label: string }[] = [
  { id: 'saloon', label: 'Saloon' },
  { id: 'estate', label: 'Estate' },
  { id: 'mpv', label: 'MPV' },
  { id: 'executive', label: 'Executive' },
  { id: 'eight-seater', label: '8-Seater' },
];

function statusTone(status: string): 'success' | 'warning' | 'neutral' {
  if (status === 'AVAILABLE') return 'success';
  if (status === 'ON_RIDE') return 'warning';
  return 'neutral';
}

export function DriversPage() {
  const { data: profiles, status, setData } = useAsyncData(() => driversApi.list(), []);
  const { data: users } = useAsyncData(() => usersApi.list(), []);

  const [creatingFor, setCreatingFor] = useState<AdminUserRow | null>(null);
  const [createForm, setCreateForm] = useState<{ name: string; vehicleCategory: VehicleCategoryId | ''; phone: string }>({ name: '', vehicleCategory: '', phone: '' });
  const [createError, setCreateError] = useState<string | null>(null);
  const [creating, setCreating] = useState(false);

  const [editingProfile, setEditingProfile] = useState<DriverProfileRow | null>(null);
  const [editForm, setEditForm] = useState<{ name: string; vehicleCategory: VehicleCategoryId | ''; phone: string }>({ name: '', vehicleCategory: '', phone: '' });
  const [editSubmitting, setEditSubmitting] = useState(false);

  if (status === 'loading') return <p>Loading…</p>;
  if (status === 'forbidden') return <Alert tone="error">You do not have permission to manage drivers.</Alert>;
  if (status === 'error') return <Alert tone="error">Unable to load driver profiles.</Alert>;

  const driverUsers = (users ?? []).filter((u) => u.role === 'DRIVER');
  const profiledUserIds = new Set((profiles ?? []).map((p) => p.userId));
  const unprofiledDriverUsers = driverUsers.filter((u) => !profiledUserIds.has(u.id));

  function openCreate(user: AdminUserRow) {
    setCreatingFor(user);
    setCreateForm({ name: '', vehicleCategory: '', phone: '' });
    setCreateError(null);
  }

  async function handleCreate(e: React.FormEvent) {
    e.preventDefault();
    if (!creatingFor) return;
    setCreating(true);
    setCreateError(null);
    try {
      const created = await driversApi.create({
        userId: creatingFor.id,
        name: createForm.name || undefined,
        vehicleCategory: createForm.vehicleCategory || undefined,
        phone: createForm.phone || undefined,
      });
      setData([...(profiles ?? []), created]);
      setCreatingFor(null);
    } catch {
      setCreateError('Failed to create driver profile.');
    } finally {
      setCreating(false);
    }
  }

  async function toggleAvailability(profile: DriverProfileRow) {
    if (profile.status === 'ON_RIDE') return; // system-managed, not directly togglable
    const nextStatus = profile.status === 'AVAILABLE' ? 'OFFLINE' : 'AVAILABLE';
    const updated = await driversApi.updateStatus(profile.id, nextStatus);
    setData((profiles ?? []).map((p) => (p.id === updated.id ? updated : p)));
  }

  function openEdit(profile: DriverProfileRow) {
    setEditingProfile(profile);
    setEditForm({ name: profile.name ?? '', vehicleCategory: profile.vehicleCategory ?? '', phone: profile.phone ?? '' });
  }

  async function handleEditSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!editingProfile) return;
    setEditSubmitting(true);
    try {
      const updated = await driversApi.update(editingProfile.id, {
        vehicleCategory: editForm.vehicleCategory || undefined,
        phone: editForm.phone || undefined,
      });
      setData((profiles ?? []).map((p) => (p.id === updated.id ? updated : p)));
      setEditingProfile(null);
    } finally {
      setEditSubmitting(false);
    }
  }

  return (
    <div>
      <h1 className={styles.heading}>Driver Operations</h1>

      <Table
        rows={profiles ?? []}
        rowKey={(p) => p.id}
        emptyMessage="No driver profiles yet."
        columns={[
          { key: 'name', header: 'Driver', render: (p) => p.name || p.email },
          { key: 'vehicle', header: 'Vehicle category', render: (p) => p.vehicleCategory ?? '—' },
          { key: 'phone', header: 'Phone', render: (p) => p.phone ?? '—' },
          { key: 'status', header: 'Status', render: (p) => <Badge tone={statusTone(p.status)}>{p.status}</Badge> },
          {
            key: 'actions', header: '', render: (p) => (
              <div className={styles.rowActions}>
                <Button variant="secondary" onClick={() => openEdit(p)}>Edit</Button>
                <Button variant="secondary" disabled={p.status === 'ON_RIDE'} onClick={() => toggleAvailability(p)}>
                  {p.status === 'AVAILABLE' ? 'Set Offline' : p.status === 'ON_RIDE' ? 'On a ride' : 'Set Available'}
                </Button>
              </div>
            ),
          },
        ]}
      />

      {unprofiledDriverUsers.length > 0 && (
        <div className={styles.pendingSection}>
          <p className={styles.pendingHeading}>Driver accounts without an operational profile</p>
          <Table
            rows={unprofiledDriverUsers}
            rowKey={(u) => u.id}
            columns={[
              { key: 'email', header: 'Email', render: (u) => u.email },
              { key: 'actions', header: '', render: (u) => <Button onClick={() => openCreate(u)}>Create profile</Button> },
            ]}
          />
        </div>
      )}

      {creatingFor && (
        <Modal title={`Create driver profile — ${creatingFor.email}`} onClose={() => setCreatingFor(null)}>
          <form onSubmit={handleCreate} className={styles.form}>
            {createError && <Alert tone="error">{createError}</Alert>}
            <Field label="Driver name">
              <Input value={createForm.name} onChange={(e) => setCreateForm({ ...createForm, name: e.target.value })} />
            </Field>
            <Field label="Vehicle category (optional)">
              <Select value={createForm.vehicleCategory} onChange={(e) => setCreateForm({ ...createForm, vehicleCategory: e.target.value as VehicleCategoryId })}>
                <option value="">Not set</option>
                {VEHICLE_CATEGORIES.map((c) => <option key={c.id} value={c.id}>{c.label}</option>)}
              </Select>
            </Field>
            <Field label="Phone (optional)">
              <Input value={createForm.phone} onChange={(e) => setCreateForm({ ...createForm, phone: e.target.value })} />
            </Field>
            <Button type="submit" disabled={creating}>{creating ? 'Creating…' : 'Create profile'}</Button>
          </form>
        </Modal>
      )}

      {editingProfile && (
        <Modal title={`Edit — ${editingProfile.email}`} onClose={() => setEditingProfile(null)}>
          <form onSubmit={handleEditSubmit} className={styles.form}>
            <Field label="Driver name">
              <Input value={editForm.name} onChange={(e) => setEditForm({ ...editForm, name: e.target.value })} />
            </Field>
            <Field label="Vehicle category">
              <Select value={editForm.vehicleCategory} onChange={(e) => setEditForm({ ...editForm, vehicleCategory: e.target.value as VehicleCategoryId })}>
                <option value="">Not set</option>
                {VEHICLE_CATEGORIES.map((c) => <option key={c.id} value={c.id}>{c.label}</option>)}
              </Select>
            </Field>
            <Field label="Phone">
              <Input value={editForm.phone} onChange={(e) => setEditForm({ ...editForm, phone: e.target.value })} />
            </Field>
            <Button type="submit" disabled={editSubmitting}>{editSubmitting ? 'Saving…' : 'Save changes'}</Button>
          </form>
        </Modal>
      )}
    </div>
  );
}
