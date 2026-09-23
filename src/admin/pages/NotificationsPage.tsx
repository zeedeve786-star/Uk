import { useState } from 'react';
import { useAsyncData } from '../hooks/useAsyncData';
import { notificationsApi } from '../api/notificationService';
import { Table } from '../ui/Table';
import { Badge } from '../ui/Badge';
import { Alert } from '../ui/Alert';
import { Button } from '../ui/Button';
import type { NotificationRow, NotificationType } from '../models';
import styles from './NotificationsPage.module.css';

function typeTone(type: NotificationType): 'success' | 'danger' | 'warning' | 'neutral' {
  if (type === 'PAYMENT_SUCCEEDED' || type === 'BOOKING_CREATED') return 'success';
  if (type === 'PAYMENT_FAILED') return 'danger';
  if (type === 'RIDE_STATUS_CHANGED') return 'warning';
  return 'neutral';
}

export function NotificationsPage() {
  const [onlyUnread, setOnlyUnread] = useState(false);
  const { data: notifications, status, setData } = useAsyncData(() => notificationsApi.list(onlyUnread), [onlyUnread]);

  if (status === 'loading') return <p>Loading…</p>;
  if (status === 'forbidden') return <Alert tone="error">You do not have permission to view notifications.</Alert>;
  if (status === 'error') return <Alert tone="error">Unable to load notifications.</Alert>;

  async function markRead(notification: NotificationRow) {
    const updated = await notificationsApi.markRead(notification.id);
    setData((notifications ?? []).map((n) => (n.id === updated.id ? updated : n)));
  }

  return (
    <div>
      <div className={styles.header}>
        <h1 className={styles.heading}>Notifications</h1>
        <Button variant="secondary" onClick={() => setOnlyUnread((v) => !v)}>
          {onlyUnread ? 'Show all' : 'Show unread only'}
        </Button>
      </div>
      <p className={styles.note}>
        Internal event log — no external email/SMS/WhatsApp delivery is connected yet. Entries reflect real
        booking, payment, ride and driver-assignment events.
      </p>

      <Table
        rows={notifications ?? []}
        rowKey={(n) => n.id}
        emptyMessage="No notifications."
        columns={[
          { key: 'type', header: 'Event', render: (n) => <Badge tone={typeTone(n.type)}>{n.type}</Badge> },
          { key: 'recipient', header: 'Recipient', render: (n) => n.recipientContact ?? n.recipientUserId ?? '—' },
          { key: 'message', header: 'Message', render: (n) => n.message },
          { key: 'time', header: 'Time', render: (n) => new Date(n.createdAt).toLocaleString('en-GB') },
          {
            key: 'actions', header: '', render: (n) =>
              n.read ? <Badge tone="neutral">Read</Badge> : <Button variant="secondary" onClick={() => markRead(n)}>Mark read</Button>,
          },
        ]}
      />
    </div>
  );
}
