import { useAsyncData } from '../hooks/useAsyncData';
import { auditLogApi } from '../api/adminService';
import { Table } from '../ui/Table';
import { Alert } from '../ui/Alert';
import styles from './AuditLogPage.module.css';

export function AuditLogPage() {
  const { data: entries, status } = useAsyncData(() => auditLogApi.list(), []);

  if (status === 'loading') return <p>Loading…</p>;
  if (status === 'forbidden') return <Alert tone="error">You do not have permission to view the audit log.</Alert>;
  if (status === 'error') return <Alert tone="error">Unable to load audit log.</Alert>;

  return (
    <div>
      <h1 className={styles.heading}>Audit Log</h1>
      <Table
        rows={entries ?? []}
        rowKey={(e) => e.id}
        emptyMessage="No audit entries yet."
        columns={[
          { key: 'time', header: 'Time', render: (e) => new Date(e.createdAt).toLocaleString('en-GB') },
          { key: 'actor', header: 'Actor', render: (e) => e.actorUserId },
          { key: 'action', header: 'Action', render: (e) => e.action },
          { key: 'target', header: 'Target', render: (e) => `${e.targetType}${e.targetId ? ` · ${e.targetId}` : ''}` },
        ]}
      />
    </div>
  );
}