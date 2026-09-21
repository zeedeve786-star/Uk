import { useState } from 'react';
import { useAsyncData } from '../hooks/useAsyncData';
import { usersApi } from '../api/adminService';
import { Table } from '../ui/Table';
import { Badge } from '../ui/Badge';
import { Alert } from '../ui/Alert';
import { Button } from '../ui/Button';
import { Modal } from '../ui/Modal';
import { ConfirmDialog } from '../ui/ConfirmDialog';
import { Field, Input, Select } from '../ui/Input';
import type { AdminPermission, AdminRole, AdminUserRow } from '../models';
import styles from './UsersPage.module.css';

const PERMISSIONS: AdminPermission[] = [
  'MANAGE_ADMINS',
  'MANAGE_BOOKINGS',
  'MANAGE_DISCOUNTS',
  'VIEW_FARE_CONFIG',
  'VIEW_AUDIT_LOG',
  'MANAGE_CONTENT',
  'MANAGE_SETTINGS',
  'MANAGE_DRIVER_PAYMENTS',
];

export function UsersPage() {
  const { data: users, status, setData } = useAsyncData(() => usersApi.list(), []);
  const [creating, setCreating] = useState(false);
  const [editing, setEditing] = useState<AdminUserRow | null>(null);
  const [removing, setRemoving] = useState<AdminUserRow | null>(null);
  const [form, setForm] = useState({
    email: '',
    password: '',
    role: 'DRIVER' as AdminRole,
    isMasterAdmin: false,
    adminPermissions: [] as AdminPermission[],
  });
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  if (status === 'loading') return <p>Loading…</p>;
  if (status === 'forbidden') return <Alert tone="error">You do not have permission to manage users.</Alert>;
  if (status === 'error') return <Alert tone="error">Unable to load users.</Alert>;

  function resetForm() {
    setForm({
      email: '',
      password: '',
      role: 'DRIVER',
      isMasterAdmin: false,
      adminPermissions: [],
    });
    setError(null);
  }

  function togglePermission(permission: AdminPermission) {
    setForm((current) => ({
      ...current,
      adminPermissions: current.adminPermissions.includes(permission)
        ? current.adminPermissions.filter((item) => item !== permission)
        : [...current.adminPermissions, permission],
    }));
  }

  async function handleCreate(e: React.FormEvent) {
    e.preventDefault();
    setSubmitting(true);
    setError(null);

    try {
      const created = await usersApi.create(form);
      setData([...(users ?? []), created]);
      setCreating(false);
      resetForm();
    } catch {
      setError('Failed to create account.');
    } finally {
      setSubmitting(false);
    }
  }

  function openEdit(user: AdminUserRow) {
    setEditing(user);
    setForm({
      email: user.email,
      password: '',
      role: user.role,
      isMasterAdmin: user.isMasterAdmin,
      adminPermissions: user.adminPermissions,
    });
    setError(null);
  }

  async function handleUpdate() {
    if (!editing) return;

    setSubmitting(true);
    setError(null);

    try {
      const updated = await usersApi.updatePermissions(editing.id, {
        isMasterAdmin: form.isMasterAdmin,
        adminPermissions: form.adminPermissions,
      });

      setData((users ?? []).map((user) => user.id === updated.id ? { ...user, ...updated } : user));
      setEditing(null);
      resetForm();
    } catch {
      setError('Failed to update permissions.');
    } finally {
      setSubmitting(false);
    }
  }

  async function handleRemove() {
    if (!removing) return;

    setSubmitting(true);
    setError(null);

    try {
      await usersApi.remove(removing.id);
      setData((users ?? []).filter((user) => user.id !== removing.id));
      setRemoving(null);
    } catch {
      setError('Failed to remove account.');
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div>
      <div className={styles.header}>
        <h1 className={styles.heading}>Users &amp; Admins</h1>
        <Button onClick={() => { resetForm(); setCreating(true); }}>New Admin/Driver</Button>
      </div>

      {error && !creating && !editing && <Alert tone="error">{error}</Alert>}

      <Table
        rows={users ?? []}
        rowKey={(u) => u.id}
        emptyMessage="No users found."
        columns={[
          { key: 'email', header: 'Email', render: (u) => u.email },
          { key: 'role', header: 'Role', render: (u) => u.role },
          { key: 'master', header: 'Master Admin', render: (u) => (u.isMasterAdmin ? <Badge tone="success">Master</Badge> : '—') },
          { key: 'perms', header: 'Permissions', render: (u) => u.adminPermissions.join(', ') || '—' },
          { key: 'created', header: 'Created', render: (u) => new Date(u.createdAt).toLocaleDateString('en-GB') },
          {
            key: 'actions',
            header: 'Actions',
            render: (u) => (
              <div className={styles.actions}>
                <Button variant="secondary" onClick={() => openEdit(u)}>Edit</Button>
                {!u.isMasterAdmin && (
                  <Button variant="danger" onClick={() => { setRemoving(u); setError(null); }}>
                    Remove
                  </Button>
                )}
              </div>
            ),
          },
        ]}
      />

      {creating && (
        <Modal title="Create Admin or Driver account" onClose={() => { setCreating(false); resetForm(); }}>
          <form onSubmit={handleCreate} className={styles.form}>
            {error && <Alert tone="error">{error}</Alert>}

            <Field label="Email">
              <Input
                type="email"
                required
                value={form.email}
                onChange={(e) => setForm({ ...form, email: e.target.value })}
              />
            </Field>

            <Field label="Password">
              <Input
                type="password"
                required
                minLength={8}
                value={form.password}
                onChange={(e) => setForm({ ...form, password: e.target.value })}
              />
            </Field>

            <Field label="Role">
              <Select
                value={form.role}
                onChange={(e) => setForm({ ...form, role: e.target.value as AdminRole })}
              >
                <option value="DRIVER">Driver</option>
                <option value="ADMIN">Admin</option>
              </Select>
            </Field>

            {form.role === 'ADMIN' && (
              <>
                <Field label="Master Admin">
                  <Input
                    type="checkbox"
                    checked={form.isMasterAdmin}
                    onChange={(e) => setForm({ ...form, isMasterAdmin: e.target.checked })}
                  />
                </Field>

                <Field label="Permissions">
                  <div className={styles.permissions}>
                    {PERMISSIONS.map((permission) => (
                      <label key={permission} className={styles.permission}>
                        <input
                          type="checkbox"
                          checked={form.adminPermissions.includes(permission)}
                          onChange={() => togglePermission(permission)}
                        />
                        {permission}
                      </label>
                    ))}
                  </div>
                </Field>
              </>
            )}

            <Button type="submit" disabled={submitting}>
              {submitting ? 'Creating…' : 'Create account'}
            </Button>
          </form>
        </Modal>
      )}

      {editing && (
        <Modal title={`Edit permissions — ${editing.email}`} onClose={() => { setEditing(null); resetForm(); }}>
          <div className={styles.form}>
            {error && <Alert tone="error">{error}</Alert>}

            <Field label="Role">
              <Input type="text" value={editing.role} disabled />
            </Field>

            {editing.role === 'ADMIN' && (
              <>
                <Field label="Master Admin">
                  <Input
                    type="checkbox"
                    checked={form.isMasterAdmin}
                    onChange={(e) => setForm({ ...form, isMasterAdmin: e.target.checked })}
                  />
                </Field>

                <Field label="Permissions">
                  <div className={styles.permissions}>
                    {PERMISSIONS.map((permission) => (
                      <label key={permission} className={styles.permission}>
                        <input
                          type="checkbox"
                          checked={form.adminPermissions.includes(permission)}
                          onChange={() => togglePermission(permission)}
                        />
                        {permission}
                      </label>
                    ))}
                  </div>
                </Field>
              </>
            )}

            <Button onClick={handleUpdate} disabled={submitting}>
              {submitting ? 'Saving…' : 'Save permissions'}
            </Button>
          </div>
        </Modal>
      )}

      {removing && (
        <ConfirmDialog
          title="Remove account"
          message={`Are you sure you want to remove ${removing.email}? This action cannot be undone.`}
          confirmLabel={submitting ? 'Removing…' : 'Remove'}
          onConfirm={handleRemove}
          onCancel={() => setRemoving(null)}
          destructive
        />
      )}
    </div>
  );
}
