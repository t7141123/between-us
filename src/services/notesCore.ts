/**
 * Conversation notes: one short note per question, kept on the device. Pure logic (no React Native
 * imports) so it can be unit-tested in Node.
 */
export const NOTE_MAX_LENGTH = 500;

export interface Note {
  text: string;
  updatedAt: number;
}

export type NoteMap = Record<string, Note>;

export interface NoteListItem extends Note {
  qid: string;
}

/** Sets, updates or (for empty text) removes the note of a question. Returns a new map. */
export function saveNote(notes: NoteMap, qid: string, text: string, now: number): NoteMap {
  const next = { ...notes };
  const trimmed = text.trim().slice(0, NOTE_MAX_LENGTH);
  if (trimmed === '') delete next[qid];
  else next[qid] = { text: trimmed, updatedAt: now };
  return next;
}

/** Newest first. */
export function listNotes(notes: NoteMap): NoteListItem[] {
  return Object.entries(notes)
    .map(([qid, n]) => ({ qid, ...n }))
    .sort((a, b) => b.updatedAt - a.updatedAt);
}

/**
 * Applies the free-tier window: free users browse their most recent `limit` notes; older ones are
 * kept (never deleted) and listed as hidden until the full history is unlocked.
 */
export function visibleNotes(
  list: NoteListItem[],
  hasFullHistory: boolean,
  limit: number
): { visible: NoteListItem[]; hiddenCount: number } {
  if (hasFullHistory || list.length <= limit) return { visible: list, hiddenCount: 0 };
  return { visible: list.slice(0, limit), hiddenCount: list.length - limit };
}

/** Repairs whatever was stored: drops malformed entries, clamps length. */
export function sanitizeNotes(value: unknown): NoteMap {
  const out: NoteMap = {};
  if (!value || typeof value !== 'object' || Array.isArray(value)) return out;
  for (const [qid, raw] of Object.entries(value as Record<string, unknown>)) {
    const n = raw as Partial<Note> | null;
    if (n && typeof n.text === 'string' && n.text.trim() !== '' && Number.isFinite(n.updatedAt)) {
      out[qid] = { text: n.text.slice(0, NOTE_MAX_LENGTH), updatedAt: Number(n.updatedAt) };
    }
  }
  return out;
}

/** Case-insensitive search over the note text and the question text. */
export function filterNotes(
  list: NoteListItem[],
  query: string,
  textOf: (qid: string) => string | undefined
): NoteListItem[] {
  const q = query.trim().toLowerCase();
  if (!q) return list;
  return list.filter((n) => n.text.toLowerCase().includes(q) || (textOf(n.qid) ?? '').toLowerCase().includes(q));
}

/** Plain-text export (newest first): date, the question, then the note. */
export function formatNotesExport(
  list: NoteListItem[],
  textOf: (qid: string) => string | undefined,
  title: string
): string {
  const lines: string[] = [title, ''];
  for (const n of list) {
    const d = new Date(n.updatedAt);
    const date = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
    lines.push(`${date}`, `Q: ${textOf(n.qid) ?? n.qid}`, n.text, '');
  }
  return lines.join('\n').trimEnd() + '\n';
}
