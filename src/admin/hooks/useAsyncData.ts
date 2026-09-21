import { useEffect, useState } from 'react';

type Status = 'loading' | 'success' | 'error' | 'unauthorized' | 'forbidden';

export function useAsyncData<T>(fetcher: () => Promise<T>, deps: unknown[] = []) {
  const [data, setData] = useState<T | null>(null);
  const [status, setStatus] = useState<Status>('loading');

  useEffect(() => {
    let cancelled = false;
    setStatus('loading');
    fetcher()
      .then((result) => {
        if (!cancelled) {
          setData(result);
          setStatus('success');
        }
      })
      .catch((err) => {
        if (cancelled) return;
        const status = (err as { status?: number })?.status;
        if (status === 401) setStatus('unauthorized');
        else if (status === 403) setStatus('forbidden');
        else setStatus('error');
      });
    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, deps);

  return { data, status, setData };
}