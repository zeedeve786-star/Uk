import { useState } from 'react';
import { useAsyncData } from '../hooks/useAsyncData';
import { mediaApi } from '../api/mediaService';
import { Table } from '../ui/Table';
import { Badge } from '../ui/Badge';
import { Alert } from '../ui/Alert';
import { Button } from '../ui/Button';
import { ConfirmDialog } from '../ui/ConfirmDialog';
import type { MediaAssetRow } from '../models';
import styles from './MediaLibraryPage.module.css';

export function MediaLibraryPage() {
  const { data: assets, status, setData } = useAsyncData(() => mediaApi.list(), []);
  const [pendingDelete, setPendingDelete] = useState<MediaAssetRow | null>(null);

  if (status === 'loading') return <p>Loading…</p>;
  if (status === 'forbidden') return <Alert tone="error">You do not have permission to manage media.</Alert>;
  if (status === 'error') return <Alert tone="error">Unable to load the media library.</Alert>;

  async function confirmDelete() {
    if (!pendingDelete) return;
    await mediaApi.remove(pendingDelete.id);
    setData((assets ?? []).filter((a) => a.id !== pendingDelete.id));
    setPendingDelete(null);
  }

  return (
    <div>
      <h1 className={styles.heading}>Media Library</h1>
      <p className={styles.note}>
        External URLs only — no files are uploaded or stored here. Assets are added from within Blog, Service
        Content and Vehicle Content forms, or below.
      </p>

      <Table
        rows={assets ?? []}
        rowKey={(a) => a.id}
        emptyMessage="No media assets yet."
        columns={[
          {
            key: 'preview', header: '', render: (a) =>
              a.mediaType === 'IMAGE' ? <img src={a.url} alt={a.altText ?? ''} className={styles.thumb} /> : <span className={styles.videoIcon}>▶</span>,
          },
          { key: 'type', header: 'Type', render: (a) => <Badge tone="neutral">{a.mediaType}</Badge> },
          { key: 'url', header: 'URL', render: (a) => <span className={styles.url}>{a.url}</span> },
          { key: 'alt', header: 'Alt text', render: (a) => a.altText ?? '—' },
          { key: 'actions', header: '', render: (a) => <Button variant="danger" onClick={() => setPendingDelete(a)}>Delete</Button> },
        ]}
      />

      {pendingDelete && (
        <ConfirmDialog
          title="Delete media asset"
          message="Delete this asset from the library? Content already referencing this URL will keep the URL string but it will no longer appear in pickers."
          confirmLabel="Delete"
          destructive
          onConfirm={confirmDelete}
          onCancel={() => setPendingDelete(null)}
        />
      )}
    </div>
  );
}