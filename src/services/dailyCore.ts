/**
 * Question of the day: deterministic per calendar day, so two phones show the same question
 * without any server. Pure (no React Native imports) for unit tests.
 */

/** FNV-1a 32-bit hash of a string. */
export function hashString(input: string): number {
  let h = 0x811c9dc5;
  for (let i = 0; i < input.length; i++) {
    h ^= input.charCodeAt(i);
    h = Math.imul(h, 0x01000193) >>> 0;
  }
  return h >>> 0;
}

/**
 * Picks the question for a day from a fixed, ordered pool of qids.
 * The pool must be the free base questions only, in canonical order, so the pick is stable.
 */
export function dailyQid(day: string, pool: readonly string[]): string | null {
  if (pool.length === 0) return null;
  return pool[hashString(`between-us:${day}`) % pool.length];
}

export interface ReminderSettings {
  enabled: boolean;
  hour: number;
  minute: number;
}

export const DEFAULT_REMINDER: ReminderSettings = { enabled: false, hour: 21, minute: 0 };
export const REMINDER_HOURS = [20, 21, 22] as const;
/** How many upcoming days are scheduled ahead (each with that day's own question). */
export const REMINDER_DAYS_AHEAD = 7;

export function sanitizeReminder(value: unknown): ReminderSettings {
  const v = (value ?? {}) as Partial<ReminderSettings>;
  const hour = Number.isInteger(v.hour) && (v.hour as number) >= 0 && (v.hour as number) <= 23 ? (v.hour as number) : DEFAULT_REMINDER.hour;
  const minute = Number.isInteger(v.minute) && (v.minute as number) >= 0 && (v.minute as number) <= 59 ? (v.minute as number) : 0;
  return { enabled: v.enabled === true, hour, minute };
}

/**
 * The moments to schedule: today's slot if it is still in the future, then following days,
 * `count` entries in total. Uses local time.
 */
export function upcomingTriggerDates(now: Date, hour: number, minute: number, count: number): Date[] {
  const out: Date[] = [];
  for (let i = 0; out.length < count && i < count + 1; i++) {
    const d = new Date(now.getFullYear(), now.getMonth(), now.getDate() + i, hour, minute, 0, 0);
    if (d.getTime() > now.getTime()) out.push(d);
  }
  return out;
}
