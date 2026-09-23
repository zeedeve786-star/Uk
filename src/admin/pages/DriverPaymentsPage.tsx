import { FormEvent, useEffect, useState } from 'react';
import type { ChangeEvent } from 'react';
import { useAsyncData } from '../hooks/useAsyncData';
import { driverPaymentsApi } from '../api/driverPaymentService';
import { Button } from '../ui/Button';
import { Alert } from '../ui/Alert';
import { Table } from '../ui/Table';
import { Badge } from '../ui/Badge';
import { Field, Input, Select } from '../ui/Input';
import type { DriverPaymentFrequency, DriverPaymentStatus } from '../models';
import { adminApi } from '../api/adminHttpClient';
import type { AdminDriverRow } from '../models';

const pounds = (pence: number) => `£${(pence / 100).toFixed(2)}`;

export function DriverPaymentsPage() {
  const [driverId, setDriverId] = useState('');
  const [frequency, setFrequency] = useState<DriverPaymentFrequency>('MONTHLY');
  const [amount, setAmount] = useState('');
  const [paymentDate, setPaymentDate] = useState(new Date().toISOString().slice(0, 10));
  const [reference, setReference] = useState('');
  const [notes, setNotes] = useState('');
  const [payrollPeriodStart, setPayrollPeriodStart] = useState('');
  const [payrollPeriodEnd, setPayrollPeriodEnd] = useState('');
  const [saving, setSaving] = useState(false);
  const [actionId, setActionId] = useState('');
  const [message, setMessage] = useState('');

  const drivers = useAsyncData(() => adminApi.get<AdminDriverRow[]>('/admin/drivers'), []);

  const payments = useAsyncData(
    () => driverPaymentsApi.list(driverId || undefined),
    [driverId],
  );

  const totals = useAsyncData(
    () => driverPaymentsApi.totals(driverId || undefined),
    [driverId],
  );

  const rideSummary = useAsyncData(
    () => driverId ? driverPaymentsApi.rideSummary(driverId) : Promise.resolve(null),
    [driverId],
  );

  useEffect(() => {
    setMessage('');
  }, [driverId]);

  if (drivers.status === 'forbidden' || payments.status === 'forbidden') {
    return <Alert tone="error">You do not have permission to manage driver payments.</Alert>;
  }

  async function createPayment(event: FormEvent) {
    event.preventDefault();
    setMessage('');

    const numericAmount = Number(amount);

    if (!driverId || !Number.isFinite(numericAmount) || numericAmount <= 0 || !paymentDate) {
      setMessage('Driver, amount and payment date are required.');
      return;
    }

    if (payrollPeriodStart && payrollPeriodEnd && payrollPeriodStart > payrollPeriodEnd) {
      setMessage('Payroll period start cannot be after the end date.');
      return;
    }

    setSaving(true);

    try {
      await driverPaymentsApi.create({
        driverId,
        frequency,
        amountPence: Math.round(numericAmount * 100),
        paymentDate,
        status: 'PENDING',
        paymentReference: reference || undefined,
        notes: notes || undefined,
        payrollPeriodStart: payrollPeriodStart || undefined,
        payrollPeriodEnd: payrollPeriodEnd || undefined,
        rideCount: rideSummary.data?.rideCount ?? 0,
      });

      setAmount('');
      setReference('');
      setNotes('');
      setPayrollPeriodStart('');
      setPayrollPeriodEnd('');
      setMessage('Driver payment created as pending.');
      window.location.reload();
    } catch {
      setMessage('Unable to create driver payment.');
    } finally {
      setSaving(false);
    }
  }

  async function runAction(
    id: string,
    action: 'approve' | 'transfer' | 'paid' | 'failed',
  ) {
    setActionId(id);
    setMessage('');

    try {
      if (action === 'approve') {
        await driverPaymentsApi.approve(id);
      } else if (action === 'transfer') {
        await driverPaymentsApi.transfer(id);
      } else if (action === 'paid') {
        await driverPaymentsApi.markPaid(id);
      } else {
        await driverPaymentsApi.markFailed(id);
      }

      window.location.reload();
    } catch {
      setMessage(`Unable to ${action} driver payment.`);
    } finally {
      setActionId('');
    }
  }

  function actionButton(
    paymentId: string,
    status: DriverPaymentStatus,
  ) {
    const busy = actionId === paymentId;

    if (status === 'PENDING') {
      return (
        <Button
          variant="secondary"
          disabled={busy}
          onClick={() => runAction(paymentId, 'approve')}
        >
          {busy ? 'Working…' : 'Approve'}
        </Button>
      );
    }

    if (status === 'APPROVED') {
      return (
        <Button
          variant="secondary"
          disabled={busy}
          onClick={() => runAction(paymentId, 'transfer')}
        >
          {busy ? 'Working…' : 'Initiate transfer'}
        </Button>
      );
    }

    if (status === 'TRANSFER_INITIATED') {
      return (
        <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
          <Button
            variant="secondary"
            disabled={busy}
            onClick={() => runAction(paymentId, 'paid')}
          >
            {busy ? 'Working…' : 'Mark paid'}
          </Button>
          <Button
            variant="secondary"
            disabled={busy}
            onClick={() => runAction(paymentId, 'failed')}
          >
            Mark failed
          </Button>
        </div>
      );
    }

    if (status === 'FAILED') {
      return (
        <Button
          variant="secondary"
          disabled={busy}
          onClick={() => runAction(paymentId, 'approve')}
        >
          {busy ? 'Working…' : 'Retry approval'}
        </Button>
      );
    }

    return null;
  }

  return (
    <div>
      <h1>Driver Payments</h1>
      <p>
        Manage driver earnings, payroll periods and payment lifecycle.
      </p>

      <form
        onSubmit={createPayment}
        style={{
          display: 'grid',
          gap: 12,
          maxWidth: 720,
          marginBottom: 28,
        }}
      >
        <Field label="Driver">
          <Select
            value={driverId}
            onChange={(e: ChangeEvent<HTMLSelectElement>) =>
              setDriverId(e.target.value)
            }
          >
            <option value="">Select driver</option>
            {(drivers.data ?? []).map((driver) => (
              <option key={driver.id} value={driver.id}>
                {driver.email}{driver.phone ? ` — ${driver.phone}` : ''}
              </option>
            ))}
          </Select>
        </Field>

        <Field label="Payment frequency">
          <Select
            value={frequency}
            onChange={(e: ChangeEvent<HTMLSelectElement>) =>
              setFrequency(e.target.value as DriverPaymentFrequency)
            }
          >
            <option value="DAILY">Daily</option>
            <option value="WEEKLY">Weekly</option>
            <option value="MONTHLY">Monthly</option>
          </Select>
        </Field>

        <Field label="Amount (£)">
          <Input
            type="number"
            min="0.01"
            step="0.01"
            value={amount}
            onChange={(e: ChangeEvent<HTMLInputElement>) =>
              setAmount(e.target.value)
            }
          />
        </Field>

        <Field label="Payment date">
          <Input
            type="date"
            value={paymentDate}
            onChange={(e: ChangeEvent<HTMLInputElement>) =>
              setPaymentDate(e.target.value)
            }
          />
        </Field>

        <Field label="Payroll period start">
          <Input
            type="date"
            value={payrollPeriodStart}
            onChange={(e: ChangeEvent<HTMLInputElement>) =>
              setPayrollPeriodStart(e.target.value)
            }
          />
        </Field>

        <Field label="Payroll period end">
          <Input
            type="date"
            value={payrollPeriodEnd}
            onChange={(e: ChangeEvent<HTMLInputElement>) =>
              setPayrollPeriodEnd(e.target.value)
            }
          />
        </Field>

        <Field label="Payment reference">
          <Input
            value={reference}
            onChange={(e: ChangeEvent<HTMLInputElement>) =>
              setReference(e.target.value)
            }
            placeholder="Bank transfer / cash / provider reference"
          />
        </Field>

        <Field label="Notes">
          <Input
            value={notes}
            onChange={(e: ChangeEvent<HTMLInputElement>) =>
              setNotes(e.target.value)
            }
            placeholder="Optional notes"
          />
        </Field>

        {message && (
          <Alert tone={message.toLowerCase().includes('unable') ? 'error' : 'success'}>
            {message}
          </Alert>
        )}

        <Button type="submit" disabled={saving}>
          {saving ? 'Creating…' : 'Create pending payment'}
        </Button>
      </form>

      {driverId && rideSummary.data && (
        <div
          style={{
            display: 'flex',
            gap: 24,
            flexWrap: 'wrap',
            marginBottom: 24,
          }}
        >
          <strong>
            Total rides: {rideSummary.data.rideCount}
          </strong>
          <strong>
            Driver earnings: {pounds(rideSummary.data.earningPence)}
          </strong>
        </div>
      )}

      {totals.data && (
        <div
          style={{
            display: 'flex',
            gap: 24,
            flexWrap: 'wrap',
            marginBottom: 24,
          }}
        >
          <strong>
            Recorded total: {pounds(totals.data.totalPence)}
          </strong>
          <strong>
            Paid: {pounds(totals.data.paidPence)}
          </strong>
          <strong>
            Pending: {pounds(totals.data.pendingPence)}
          </strong>
        </div>
      )}

      {driverId && rideSummary.status === 'loading' && (
        <p>Loading driver ride summary…</p>
      )}

      {driverId && rideSummary.status === 'error' && (
        <Alert tone="error">
          Unable to load driver ride summary.
        </Alert>
      )}

      {driverId && rideSummary.data && (
        <div style={{ marginBottom: 28 }}>
          <h2>Driver Ride Earnings</h2>

          <Table
            rows={rideSummary.data.rides}
            rowKey={(ride) => ride.id}
            emptyMessage="No rides found for this driver."
            columns={[
              {
                key: 'ride',
                header: 'Ride',
                render: (ride) => ride.rideReference,
              },
              {
                key: 'booking',
                header: 'Booking',
                render: (ride) => ride.bookingReference,
              },
              {
                key: 'date',
                header: 'Date',
                render: (ride) => ride.journeyDate,
              },
              {
                key: 'route',
                header: 'Route',
                render: (ride) =>
                  `${ride.pickup} → ${ride.destination}`,
              },
              {
                key: 'customerFare',
                header: 'Customer fare',
                render: (ride) => pounds(ride.customerFarePence),
              },
              {
                key: 'driverEarning',
                header: 'Driver earning',
                render: (ride) => pounds(ride.driverEarningPence),
              },
            ]}
          />
        </div>
      )}

      {payments.status === 'loading' && <p>Loading payments…</p>}

      {payments.status === 'error' && (
        <Alert tone="error">
          Unable to load driver payments.
        </Alert>
      )}

      <h2>Payment History</h2>

      <Table
        rows={payments.data ?? []}
        rowKey={(p) => p.id}
        emptyMessage="No driver payments recorded."
        columns={[
          {
            key: 'driver',
            header: 'Driver',
            render: (p) => p.driverEmail,
          },
          {
            key: 'frequency',
            header: 'Frequency',
            render: (p) => (
              <Badge tone="neutral">{p.frequency}</Badge>
            ),
          },
          {
            key: 'amount',
            header: 'Amount',
            render: (p) => pounds(p.amountPence),
          },
          {
            key: 'rides',
            header: 'Rides',
            render: (p) => p.rideCount,
          },
          {
            key: 'date',
            header: 'Date',
            render: (p) => p.paymentDate,
          },
          {
            key: 'status',
            header: 'Status',
            render: (p) => (
              <Badge
                tone={
                  p.status === 'PAID'
                    ? 'success'
                    : p.status === 'FAILED'
                      ? 'danger'
                      : 'warning'
                }
              >
                {p.status}
              </Badge>
            ),
          },
          {
            key: 'reference',
            header: 'Reference',
            render: (p) => p.paymentReference ?? '—',
          },
          {
            key: 'notes',
            header: 'Notes',
            render: (p) => p.notes ?? '—',
          },
          {
            key: 'action',
            header: 'Action',
            render: (p) => actionButton(p.id, p.status),
          },
        ]}
      />
    </div>
  );
}
