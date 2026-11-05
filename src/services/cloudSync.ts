/**
 * Cloud backup runner (Plus). Syncs each kind of user data with /api/sync/data using the plan from
 * syncCore: upload when only this device changed, adopt when only the server changed, merge when both
 * changed. Writes use optimistic locking, so two devices can never silently overwrite each other.
 */
import { API_BASE_URL } from '../constants/api';
import { StorageService } from './storage';
import { contentHash, planSync } from './syncCore';

export type SyncKind = 'favorites' | 'notes' | 'seen' | 'custom';
export type SyncOutcome = 'ok' | 'plus_required' | 'unauthorized' | 'error';

export interface KindAdapter<T = unknown> {
  kind: SyncKind;
  read: () => T;
  /** Cleans whatever came from the server into the local shape. */
  normalize: (raw: unknown) => T;
  apply: (value: T) => void;
  merge: (local: T, remote: T) => T;
  isEmpty: (value: T) => boolean;
}

export interface SyncState {
  userId: string;
  kinds: Partial<Record<SyncKind, { hash: string; at: number }>>;
}

interface Remote {
  payload: unknown;
  updatedAt: number;
}

type Fetched = { ok: true; kinds: Partial<Record<SyncKind, Remote>> } | { ok: false; outcome: SyncOutcome };
type Put = { ok: true; updatedAt: number } | { ok: false; conflict: true } | { ok: false; conflict?: false; outcome: SyncOutcome };

function outcomeFor(status: number, code?: string): SyncOutcome {
  if (status === 401) return 'unauthorized';
  if (status === 403 && code === 'plus_required') return 'plus_required';
  return 'error';
}

async function fetchRemote(token: string): Promise<Fetched> {
  const res = await fetch(`${API_BASE_URL}/api/sync/data`, { headers: { Authorization: `Bearer ${token}` } });
  if (!res.ok) {
    const body = (await res.json().catch(() => ({}))) as { code?: string };
    return { ok: false, outcome: outcomeFor(res.status, body.code) };
  }
  const data = (await res.json()) as { kinds?: Partial<Record<SyncKind, Remote>> };
  return { ok: true, kinds: data.kinds ?? {} };
}

async function putKind(token: string, kind: SyncKind, payload: unknown, baseUpdatedAt: number): Promise<Put> {
  const res = await fetch(`${API_BASE_URL}/api/sync/data`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
    body: JSON.stringify({ kind, payload, baseUpdatedAt }),
  });
  if (res.status === 409) return { ok: false, conflict: true };
  if (!res.ok) {
    const body = (await res.json().catch(() => ({}))) as { code?: string };
    return { ok: false, outcome: outcomeFor(res.status, body.code) };
  }
  const data = (await res.json()) as { updatedAt: number };
  return { ok: true, updatedAt: data.updatedAt };
}

export async function runCloudSync(adapters: KindAdapter<any>[], userId: string): Promise<SyncOutcome> {
  const user = await StorageService.getAuthUser();
  if (!user?.token) return 'unauthorized';

  let state = await StorageService.getSyncState();
  if (state.userId !== userId) state = { userId, kinds: {} }; // never mix data between accounts

  for (let attempt = 0; attempt < 3; attempt++) {
    const fetched = await fetchRemote(user.token);
    if (!fetched.ok) return fetched.outcome;

    let conflict = false;
    for (const adapter of adapters) {
      const remote = fetched.kinds[adapter.kind] ?? null;
      const local = adapter.read();
      const synced = state.kinds[adapter.kind];
      const action = planSync({
        localHash: contentHash(local),
        syncedHash: synced?.hash,
        syncedAt: synced?.at,
        remoteUpdatedAt: remote?.updatedAt ?? null,
        localEmpty: adapter.isEmpty(local),
      });

      if (action === 'noop') continue;

      if (action === 'adopt' && remote) {
        const value = adapter.normalize(remote.payload);
        adapter.apply(value);
        state.kinds[adapter.kind] = { hash: contentHash(value), at: remote.updatedAt };
        continue;
      }

      const toStore = action === 'merge' && remote ? adapter.merge(local, adapter.normalize(remote.payload)) : local;
      const put = await putKind(user.token, adapter.kind, toStore, remote?.updatedAt ?? 0);
      if (put.ok) {
        if (action === 'merge') adapter.apply(toStore);
        state.kinds[adapter.kind] = { hash: contentHash(toStore), at: put.updatedAt };
      } else if (put.conflict) {
        conflict = true; // someone wrote in between: refetch and plan again
        break;
      } else {
        await StorageService.setSyncState(state);
        return put.outcome;
      }
    }

    await StorageService.setSyncState(state);
    if (!conflict) return 'ok';
  }
  return 'error';
}
