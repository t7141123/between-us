/** Custom questions (Plus): the couple's own questions as a private deck. Pure logic. */
import type { QuestionEntry } from '../types';

export const CUSTOM_MAX_LENGTH = 200;
export const CUSTOM_MAX_COUNT = 200;

export interface CustomQuestion {
  id: string;
  text: string;
  createdAt: number;
}

/** id is lower-case base36 so it fits the qid pattern ("custom:<id>"). */
export function makeCustomQuestion(text: string, now: number, random: () => number = Math.random): CustomQuestion | null {
  const trimmed = text.replace(/\s+/g, ' ').trim().slice(0, CUSTOM_MAX_LENGTH);
  if (trimmed === '') return null;
  const suffix = Math.floor(random() * 36 ** 3).toString(36).padStart(3, '0');
  return { id: `${now.toString(36)}${suffix}`.slice(-12), text: trimmed, createdAt: now };
}

export function addCustom(list: CustomQuestion[], q: CustomQuestion): CustomQuestion[] {
  if (list.length >= CUSTOM_MAX_COUNT || list.some((x) => x.id === q.id)) return list;
  return [...list, q];
}

export function removeCustom(list: CustomQuestion[], id: string): CustomQuestion[] {
  return list.filter((q) => q.id !== id);
}

export function sanitizeCustom(value: unknown): CustomQuestion[] {
  if (!Array.isArray(value)) return [];
  const out: CustomQuestion[] = [];
  for (const raw of value) {
    const q = raw as Partial<CustomQuestion> | null;
    if (q && typeof q.id === 'string' && /^[a-z0-9]{1,12}$/.test(q.id) && typeof q.text === 'string' && q.text.trim() !== '' && Number.isFinite(q.createdAt)) {
      out.push({ id: q.id, text: q.text.slice(0, CUSTOM_MAX_LENGTH), createdAt: Number(q.createdAt) });
    }
  }
  return out.slice(0, CUSTOM_MAX_COUNT);
}

/** Deck entries for the custom category. */
export function customEntries(list: CustomQuestion[], label: string): QuestionEntry[] {
  return list.map((q, idx) => ({
    id: `custom-${q.id}`,
    qid: `custom:${q.id}`,
    categoryKey: 'soul' as const,
    categoryLabel: label,
    text: q.text,
    index: idx + 1,
  }));
}
