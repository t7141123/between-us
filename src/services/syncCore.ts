/**
 * Pure cloud-sync logic: change detection by content hash, the sync plan, and the merge rules.
 * No React Native imports so it is unit-testable in Node.
 */

export type SyncAction = 'noop' | 'upload' | 'adopt' | 'merge';

/** JSON with sorted object keys, so equal data always serialises identically. */
export function stableStringify(value: unknown): string {
  if (Array.isArray(value)) return `[${value.map(stableStringify).join(',')}]`;
  if (value && typeof value === 'object') {
    const obj = value as Record<string, unknown>;
    return `{${Object.keys(obj).sort().map((k) => `${JSON.stringify(k)}:${stableStringify(obj[k])}`).join(',')}}`;
  }
  return JSON.stringify(value) ?? 'null';
}

/** FNV-1a 32-bit over the stable serialisation. */
export function contentHash(value: unknown): string {
  const s = stableStringify(value);
  let h = 0x811c9dc5;
  for (let i = 0; i < s.length; i++) {
    h ^= s.charCodeAt(i);
    h = Math.imul(h, 0x01000193) >>> 0;
  }
  return (h >>> 0).toString(16);
}

export interface PlanInput {
  localHash: string;
  /** Hash of the data as of the last successful sync (undefined = never synced on this device). */
  syncedHash: string | undefined;
  /** Server version we last saw (undefined = never). */
  syncedAt: number | undefined;
  /** Server version now, or null when the server holds nothing for this kind. */
  remoteUpdatedAt: number | null;
  localEmpty: boolean;
}

/**
 * Decides what to do for one kind of data:
 *  - only we changed  -> upload      - only the server changed -> adopt
 *  - both changed     -> merge (union) and upload     - neither -> nothing
 */
export function planSync(input: PlanInput): SyncAction {
  const localChanged = input.syncedHash === undefined ? !input.localEmpty : input.localHash !== input.syncedHash;
  if (input.remoteUpdatedAt === null) return localChanged ? 'upload' : 'noop';
  const remoteChanged = input.remoteUpdatedAt !== input.syncedAt;
  if (!remoteChanged && !localChanged) return 'noop';
  if (!remoteChanged) return 'upload';
  if (!localChanged) return 'adopt';
  return 'merge';
}

export function mergeFavorites(a: Record<string, boolean>, b: Record<string, boolean>): Record<string, boolean> {
  return { ...a, ...b };
}

/** Sorted so the result is stable (and hashes the same on every device). */
export function mergeSeen(a: string[], b: string[]): string[] {
  return [...new Set([...a, ...b])].sort();
}

/** The most recently edited version of each note wins. */
export function mergeNotes(
  a: Record<string, { text: string; updatedAt: number }>,
  b: Record<string, { text: string; updatedAt: number }>
): Record<string, { text: string; updatedAt: number }> {
  const out = { ...a };
  for (const [qid, note] of Object.entries(b)) {
    if (!out[qid] || note.updatedAt > out[qid].updatedAt) out[qid] = note;
  }
  return out;
}

export interface CustomQuestion {
  id: string;
  text: string;
  createdAt: number;
}

/** Union by id; the newer copy wins. Sorted by creation time. */
export function mergeCustom(a: CustomQuestion[], b: CustomQuestion[]): CustomQuestion[] {
  const byId = new Map<string, CustomQuestion>();
  for (const q of [...a, ...b]) {
    const existing = byId.get(q.id);
    if (!existing || q.createdAt > existing.createdAt) byId.set(q.id, q);
  }
  return [...byId.values()].sort((x, y) => x.createdAt - y.createdAt || x.id.localeCompare(y.id));
}
