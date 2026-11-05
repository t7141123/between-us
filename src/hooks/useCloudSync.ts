/**
 * useCloudSync: runs the Plus cloud backup shortly after local data changes, on sign-in, and on demand.
 */
import { useCallback, useEffect, useRef, useState } from 'react';
import { KindAdapter, runCloudSync, SyncOutcome } from '../services/cloudSync';

export type CloudSyncStatus = 'idle' | 'syncing' | 'ok' | 'error' | 'plus_required';

interface Options {
  /** Plus member who is signed in. */
  enabled: boolean;
  userId: string | null;
  adapters: KindAdapter<any>[];
  /** Changes whenever any synced data changes (a content hash). */
  dataKey: string;
}

export function useCloudSync({ enabled, userId, adapters, dataKey }: Options) {
  const [status, setStatus] = useState<CloudSyncStatus>('idle');
  const adaptersRef = useRef(adapters);
  const running = useRef(false);
  const rerun = useRef(false);

  useEffect(() => {
    adaptersRef.current = adapters;
  }, [adapters]);

  const syncNow = useCallback(async () => {
    if (!enabled || !userId) return;
    if (running.current) {
      rerun.current = true; // data changed while syncing: go again afterwards
      return;
    }
    running.current = true;
    setStatus('syncing');
    let outcome: SyncOutcome = 'error';
    try {
      do {
        rerun.current = false;
        outcome = await runCloudSync(adaptersRef.current, userId);
      } while (rerun.current && outcome === 'ok');
    } catch {
      outcome = 'error';
    }
    running.current = false;
    setStatus(outcome === 'ok' ? 'ok' : outcome === 'plus_required' ? 'plus_required' : 'error');
  }, [enabled, userId]);

  useEffect(() => {
    if (!enabled || !userId) return;
    const timer = setTimeout(() => void syncNow(), 2500);
    return () => clearTimeout(timer);
  }, [enabled, userId, dataKey, syncNow]);

  return { status, syncNow };
}
