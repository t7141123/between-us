/**
 * Pure progress logic: "seen" tracking and the conversation streak. No React Native imports so it
 * is unit-testable in Node.
 */
import type { QuestionEntry } from '../types';

export interface StreakState {
  /** Local calendar day (YYYY-MM-DD) of the last day with activity; '' when never. */
  lastDay: string;
  /** Consecutive days ending at lastDay. */
  count: number;
  best: number;
}

export const EMPTY_STREAK: StreakState = { lastDay: '', count: 0, best: 0 };

/** Local calendar day key, e.g. "2026-11-04". */
export function dayKey(date: Date): string {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, '0');
  const d = String(date.getDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
}

export function previousDay(key: string): string {
  const [y, m, d] = key.split('-').map(Number);
  return dayKey(new Date(y, m - 1, d - 1));
}

/** Records that the user talked today. Idempotent within a day. */
export function recordActivity(state: StreakState, today: string): StreakState {
  if (state.lastDay === today) return state;
  const count = state.lastDay === previousDay(today) ? state.count + 1 : 1;
  return { lastDay: today, count, best: Math.max(state.best, count) };
}

/** The streak to display: 0 once a full day has been missed. */
export function currentStreak(state: StreakState, today: string): number {
  if (state.lastDay === today || state.lastDay === previousDay(today)) return state.count;
  return 0;
}

const isLock = (q: QuestionEntry) => q.id.endsWith('-lock');

/**
 * Orders a (already shuffled) deck so questions not seen yet come first, keeping the relative
 * order inside each group. Lock cards always stay last; with `pinFirst` the first card
 * (e.g. a question a partner shared) is never moved.
 */
export function prioritizeUnseen(deck: QuestionEntry[], seen: ReadonlySet<string>, pinFirst = false): QuestionEntry[] {
  const locks = deck.filter(isLock);
  const cards = deck.filter((q) => !isLock(q));
  const pinned = pinFirst && cards.length > 0 ? [cards[0]] : [];
  const rest = pinFirst ? cards.slice(1) : cards;
  const unseen = rest.filter((q) => !seen.has(q.qid));
  const alreadySeen = rest.filter((q) => seen.has(q.qid));
  return [...pinned, ...unseen, ...alreadySeen, ...locks];
}

/** Seen / total over the real questions of a deck (lock cards excluded). */
export function countSeen(deck: QuestionEntry[], seen: ReadonlySet<string>): { seen: number; total: number } {
  const cards = deck.filter((q) => !isLock(q));
  return { seen: cards.filter((q) => seen.has(q.qid)).length, total: cards.length };
}
