import { useState } from 'react';
import { useAsyncData } from '../hooks/useAsyncData';
import { discountsApi } from '../api/adminService';
import { Badge } from '../ui/Badge';
import { Alert } from '../ui/Alert';
import { Button } from '../ui/Button';
import { Modal } from '../ui/Modal';
import { Field, Input, Select } from '../ui/Input';
import type { AdminDiscountRow } from '../models';
import styles from './DiscountsPage.module.css';

export function DiscountsPage() {
  const { data: discounts, status, setData } = useAsyncData(() => discountsApi.list(), []);
  const [creating, setCreating] = useState(false);
  const [form, setForm] = useState({
    code: '',
    type: 'PERCENTAGE' as 'PERCENTAGE' | 'FIXED',
    value: 10,
  });
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  if (status === 'loading') {
    return (
      <div className={styles.state}>
        <div className={styles.statePulse} />
        <span>Loading discounts…</span>
      </div>
    );
  }

  if (status === 'forbidden') {
    return <Alert tone="error">You do not have permission to manage discounts.</Alert>;
  }

  if (status === 'error') {
    return <Alert tone="error">Unable to load discounts.</Alert>;
  }

  const rows = discounts ?? [];
  const activeCount = rows.filter((discount) => discount.active).length;
  const inactiveCount = rows.length - activeCount;

  async function handleCreate(e: React.FormEvent) {
    e.preventDefault();
    setSubmitting(true);
    setError(null);

    try {
      const created = await discountsApi.create(form);
      setData([created, ...(discounts ?? [])]);
      setCreating(false);
      setForm({ code: '', type: 'PERCENTAGE', value: 10 });
    } catch {
      setError('Failed to create discount. Check the values and try again.');
    } finally {
      setSubmitting(false);
    }
  }

  async function toggleActive(discount: AdminDiscountRow) {
    const updated = await discountsApi.update(discount.id, {
      active: !discount.active,
    });

    setData(
      (discounts ?? []).map((d) =>
        d.id === updated.id ? updated : d,
      ),
    );
  }

  return (
    <section className={styles.page}>
      <div className={styles.hero}>
        <div className={styles.heroCopy}>
          <div className={styles.eyebrow}>
            <span className={styles.liveDot} />
            COMMERCIAL / DISCOUNTS
          </div>

          <h1 className={styles.heading}>Discount Control</h1>

          <p className={styles.description}>
            Create and manage customer discount codes without leaving the
            transport operations workspace.
          </p>
        </div>

        <div className={styles.heroAction}>
          <span className={styles.heroActionLabel}>PROMOTION ENGINE</span>
          <strong>{activeCount}</strong>
          <small>active codes</small>
        </div>
      </div>

      <div className={styles.summaryGrid}>
        <div className={`${styles.summaryCard} ${styles.summaryTotal}`}>
          <span>TOTAL CODES</span>
          <strong>{rows.length}</strong>
          <small>All discount records</small>
        </div>

        <div className={`${styles.summaryCard} ${styles.summaryActive}`}>
          <span>ACTIVE</span>
          <strong>{activeCount}</strong>
          <small>Available for customers</small>
        </div>

        <div className={`${styles.summaryCard} ${styles.summaryInactive}`}>
          <span>INACTIVE</span>
          <strong>{inactiveCount}</strong>
          <small>Currently switched off</small>
        </div>

        <button
          type="button"
          className={styles.createCard}
          onClick={() => setCreating(true)}
        >
          <span className={styles.createIcon}>+</span>
          <div>
            <strong>New discount</strong>
            <small>Create a customer offer</small>
          </div>
          <span className={styles.createArrow}>→</span>
        </button>
      </div>

      <div className={styles.workspace}>
        <div className={styles.workspaceHeader}>
          <div>
            <span className={styles.workspaceKicker}>PROMOTION REGISTER</span>
            <h2>Discount codes</h2>
          </div>

          <div className={styles.workspaceMeta}>
            <span />
            <strong>{rows.length} RECORDS</strong>
          </div>
        </div>

        {rows.length === 0 ? (
          <div className={styles.emptyState}>
            <div className={styles.emptyMark}>%</div>
            <span>NO DISCOUNTS</span>
            <strong>No promotion codes have been created yet.</strong>
            <button
              type="button"
              onClick={() => setCreating(true)}
            >
              Create first discount <span>→</span>
            </button>
          </div>
        ) : (
          <div className={styles.discountList}>
            {rows.map((discount) => (
              <div className={styles.discountRow} key={discount.id}>
                <div className={styles.discountCode}>
                  <span className={styles.codeLabel}>CODE</span>
                  <strong>{discount.code}</strong>
                </div>

                <div className={styles.discountOffer}>
                  <span className={styles.offerLabel}>OFFER</span>
                  <strong>
                    {discount.type === 'PERCENTAGE'
                      ? `${discount.value}%`
                      : `£${(discount.value / 100).toFixed(2)}`}
                  </strong>
                  <small>
                    {discount.type === 'PERCENTAGE'
                      ? 'percentage discount'
                      : 'fixed discount'}
                  </small>
                </div>

                <div className={styles.discountType}>
                  <span>TYPE</span>
                  <strong>
                    {discount.type === 'PERCENTAGE' ? 'Percentage' : 'Fixed'}
                  </strong>
                </div>

                <div
                  className={`${styles.statusPopup} ${
                    discount.active
                      ? styles.statusActive
                      : styles.statusInactive
                  }`}
                >
                  <span className={styles.statusDot} />
                  <div>
                    <small>STATUS</small>
                    <strong>{discount.active ? 'ACTIVE' : 'INACTIVE'}</strong>
                  </div>
                </div>

                <Button
                  variant="secondary"
                  onClick={() => toggleActive(discount)}
                >
                  {discount.active ? 'Deactivate' : 'Activate'}
                </Button>
              </div>
            ))}
          </div>
        )}

        <div className={styles.workspaceFooter}>
          <span>
            Discount changes are applied through the existing admin discount
            service.
          </span>
          <strong>{activeCount} ACTIVE</strong>
        </div>
      </div>

      {creating && (
        <Modal
          title="New discount"
          onClose={() => setCreating(false)}
        >
          <form onSubmit={handleCreate} className={styles.form}>
            {error && <Alert tone="error">{error}</Alert>}

            <Field label="Code">
              <Input
                required
                value={form.code}
                onChange={(e) =>
                  setForm({ ...form, code: e.target.value })
                }
              />
            </Field>

            <Field label="Type">
              <Select
                value={form.type}
                onChange={(e) =>
                  setForm({
                    ...form,
                    type: e.target.value as 'PERCENTAGE' | 'FIXED',
                  })
                }
              >
                <option value="PERCENTAGE">Percentage</option>
                <option value="FIXED">Fixed (pence)</option>
              </Select>
            </Field>

            <Field label="Value">
              <Input
                type="number"
                min={1}
                required
                value={form.value}
                onChange={(e) =>
                  setForm({
                    ...form,
                    value: Number(e.target.value),
                  })
                }
              />
            </Field>

            <Button type="submit" disabled={submitting}>
              {submitting ? 'Creating…' : 'Create discount'}
            </Button>
          </form>
        </Modal>
      )}
    </section>
  );
}
