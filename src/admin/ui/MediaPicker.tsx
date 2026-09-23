import { useState } from 'react';
import { useAsyncData } from '../hooks/useAsyncData';
import { mediaApi } from '../api/mediaService';
import type { MediaAssetRow, MediaType } from '../models';
import { Alert } from './Alert';
import { Button } from './Button';
import { Field, Input, Select } from './Input';
import styles from './MediaPicker.module.css';

interface MediaPickerProps {
  mediaType: MediaType;
  multiple: boolean;
  value: string[]; // always an array internally; single mode enforces length <= 1
  onChange: (urls: string[]) => void;
}

export function MediaPicker({ mediaType, multiple, value, onChange }: MediaPickerProps) {
  const { data: library, status, setData } = useAsyncData(() => mediaApi.list(), []);
  const [adding, setAdding] = useState(false);
  const [form, setForm] = useState({ url: '', altText: '', mediaType });
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const filteredLibrary = (library ?? []).filter((a) => a.mediaType === mediaType);

  function isSelected(url: string) {
    return value.includes(url);
  }

  function toggle(url: string) {
    if (isSelected(url)) {
      onChange(value.filter((u) => u !== url));
      return;
    }
    onChange(multiple ? [...value, url] : [url]);
  }

  function removeSelected(url: string) {
    onChange(value.filter((u) => u !== url));
  }

  async function handleAdd(e: React.FormEvent) {
    e.preventDefault();
    setSubmitting(true);
    setError(null);
    try {
      const asset = await mediaApi.create({ url: form.url, altText: form.altText || undefined, mediaType });
      setData([asset, ...(library ?? [])]);
      onChange(multiple ? [...value, asset.url] : [asset.url]);
      setForm({ url: '', altText: '', mediaType });
      setAdding(false);
    } catch {
      setError(`Failed to add — check the URL is https and ends in a valid ${mediaType.toLowerCase()} extension.`);
    } finally {
      setSubmitting(false);
    }
  }

  async function handleDeleteAsset(assetId: string, url: string) {
    setError(null);

    try {
      await mediaApi.remove(assetId);
      setData((library ?? []).filter((asset) => asset.id !== assetId));
      onChange(value.filter((selectedUrl) => selectedUrl !== url));
    } catch {
      setError('Failed to delete this media asset.');
    }
  }

  return (
    <div className={styles.wrapper}>
      {value.length > 0 && (
        <ul className={styles.selectedList}>
          {value.map((url) => (
            <li key={url} className={styles.selectedItem}>
              <span className={styles.selectedUrl}>{url}</span>
              <button type="button" onClick={() => removeSelected(url)} aria-label={`Remove ${url}`}>×</button>
            </li>
          ))}
        </ul>
      )}

      {status === 'loading' && <p className={styles.note}>Loading media library…</p>}
      {status === 'success' && (
        <div className={styles.library}>
          {filteredLibrary.length === 0 && <p className={styles.note}>No {mediaType.toLowerCase()} assets in the library yet.</p>}
          <div className={styles.grid}>
            {filteredLibrary.map((asset) => (
              <div key={asset.id}>
                <button
                  type="button"
                  className={styles.tile}
                  data-selected={isSelected(asset.url)}
                  onClick={() => toggle(asset.url)}
                  title={asset.altText ?? asset.url}
                >
                  {mediaType === 'IMAGE' ? (
                    <img
                      src={asset.url}
                      alt={asset.altText ?? ''}
                      className={styles.thumb}
                    />
                  ) : (
                    <span className={styles.videoLabel}>
                      {asset.altText ?? 'Video'}
                    </span>
                  )}
                </button>

                <button
                  type="button"
                  onClick={(event) => {
                    event.stopPropagation();
                    void handleDeleteAsset(asset.id, asset.url);
                  }}
                  aria-label={`Delete ${asset.altText ?? asset.url}`}
                  style={{
                    marginTop: 4,
                    width: '100%',
                    border: 0,
                    borderRadius: 8,
                    padding: '5px 8px',
                    cursor: 'pointer',
                    background: 'rgba(220, 38, 38, 0.08)',
                    color: '#b91c1c',
                    fontSize: 12,
                    fontWeight: 700,
                  }}
                >
                  Delete
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {!adding && <Button type="button" variant="secondary" onClick={() => setAdding(true)}>Add new {mediaType.toLowerCase()}</Button>}

      {adding && (
        <form onSubmit={handleAdd} className={styles.addForm}>
          {error && <Alert tone="error">{error}</Alert>}
          <Field label="URL (https only)">
            <Input type="url" required value={form.url} onChange={(e) => setForm({ ...form, url: e.target.value })} />
          </Field>
          <Field label="Alt text / description (optional)">
            <Input value={form.altText} onChange={(e) => setForm({ ...form, altText: e.target.value })} />
          </Field>
          <div className={styles.addFormActions}>
            <Button type="button" variant="secondary" onClick={() => setAdding(false)}>Cancel</Button>
            <Button type="submit" disabled={submitting}>{submitting ? 'Adding…' : 'Add to library'}</Button>
          </div>
        </form>
      )}
    </div>
  );
}