/**
 * Pure deck logic (no React Native / i18n imports) so it can be unit-tested in Node.
 * Data and translations are injected by src/services/deck.ts.
 */
import type { CategoryFilter, ExpansionPackId, QuestionEntry } from '../types';

export const FREE_TRIAL_COUNT = 3;
export const PACK_IDS: ExpansionPackId[] = ['sensual', 'marriage', 'parenting'];

/** "vision:12" or "pack:sensual:5" */
export const QID_PATTERN = /^(?:pack:(?:sensual|marriage|parenting)|vision|soul|finance|intimacy|fun|growth|faith):\d{1,3}$/;

export interface ShareTarget {
  category?: CategoryFilter;
  pack?: string;
  q: number;
}

export interface PendingPaid {
  pack: string;
  q: number;
}

export function isPackId(value: string): value is ExpansionPackId {
  return (PACK_IDS as string[]).includes(value);
}

/** 'pack_sensual' -> 'sensual'; anything else -> null */
export function packIdOfCategory(category: CategoryFilter): ExpansionPackId | null {
  if (typeof category === 'string' && category.startsWith('pack_')) {
    const id = category.slice(5);
    return isPackId(id) ? id : null;
  }
  return null;
}

/** The deck filter that contains a given question: "pack:sensual:5" -> 'pack_sensual', "vision:1" -> 'vision'. */
export function categoryOfQid(qid: string): CategoryFilter | null {
  if (!QID_PATTERN.test(qid)) return null;
  const parts = qid.split(':');
  return (parts[0] === 'pack' ? `pack_${parts[1]}` : parts[0]) as CategoryFilter;
}

export function findQidIndex(deck: QuestionEntry[], qid: string): number {
  return qid ? deck.findIndex((q) => q.qid === qid) : -1;
}

export function isLockCard(question: QuestionEntry | null | undefined): boolean {
  return Boolean(question && question.id.endsWith('-lock'));
}

export interface BuildDeckInput {
  category: CategoryFilter;
  unlockedPacks: string[];
  shuffle: (items: QuestionEntry[]) => QuestionEntry[];
  /** All questions of a (non-pack) category filter, in canonical order. */
  baseQuestions: (category: CategoryFilter) => QuestionEntry[];
  /** All questions of a pack, in canonical order. */
  packQuestions: (packId: ExpansionPackId) => QuestionEntry[];
  /** Card shown after the free trial; `sharedLocked` = a partner shared a paid question. */
  makeLockCard: (packId: ExpansionPackId, sharedLocked: boolean) => QuestionEntry;
  initialTarget?: ShareTarget | null;
  pendingPaid?: PendingPaid | null;
}

export interface BuildDeckResult {
  deck: QuestionEntry[];
  startIndex: number;
  /** The pending paid share target to remember after this build (null = none). */
  pendingPaid: PendingPaid | null;
}

/** Puts `target` first and shuffles the rest. */
function withTargetFirst(
  list: QuestionEntry[],
  targetIdx: number,
  shuffle: BuildDeckInput['shuffle']
): QuestionEntry[] {
  const rest = list.filter((_, idx) => idx !== targetIdx);
  return [list[targetIdx], ...shuffle(rest)];
}

export function buildDeckCore(input: BuildDeckInput): BuildDeckResult {
  const { category, unlockedPacks, shuffle, initialTarget = null } = input;
  const pendingPaid = input.pendingPaid ?? null;
  const packId = packIdOfCategory(category);

  if (!packId) {
    const all = input.baseQuestions(category);
    const target = initialTarget?.category === category ? initialTarget : null;
    if (target && target.q >= 1 && target.q <= all.length) {
      return { deck: withTargetFirst(all, target.q - 1, shuffle), startIndex: 0, pendingPaid };
    }
    return { deck: shuffle(all), startIndex: 0, pendingPaid };
  }

  const all = input.packQuestions(packId);
  const target: ShareTarget | PendingPaid | null =
    initialTarget?.pack === packId ? initialTarget : pendingPaid?.pack === packId ? pendingPaid : null;

  if (unlockedPacks.includes(packId)) {
    if (target && target.q >= 1 && target.q <= all.length) {
      return { deck: withTargetFirst(all, target.q - 1, shuffle), startIndex: 0, pendingPaid: null };
    }
    return { deck: shuffle(all), startIndex: 0, pendingPaid };
  }

  // Locked: free trial questions followed by a lock card.
  const trials = all.slice(0, FREE_TRIAL_COUNT);
  const sharedLocked = Boolean(target && target.q > FREE_TRIAL_COUNT);
  const lockCard = input.makeLockCard(packId, sharedLocked);

  if (target && target.q >= 1 && target.q <= FREE_TRIAL_COUNT) {
    const targetIdx = target.q - 1;
    const rest = trials.filter((_, idx) => idx !== targetIdx);
    return { deck: [trials[targetIdx], ...rest, lockCard], startIndex: 0, pendingPaid };
  }
  if (sharedLocked && target) {
    // Remember the paid question so it opens right after the user unlocks the pack.
    return {
      deck: [...trials, lockCard],
      startIndex: trials.length,
      pendingPaid: { pack: packId, q: target.q },
    };
  }
  return { deck: [...trials, lockCard], startIndex: 0, pendingPaid };
}

export interface FavoriteMigration {
  favorites: Record<string, boolean>;
  changed: boolean;
}

/**
 * Favorites used to be keyed by the question TEXT (so they broke when the language changed).
 * Converts text keys to qids using per-locale text -> qid lookups; unknown keys are kept as-is.
 */
export function migrateFavoriteKeys(
  favorites: Record<string, boolean>,
  textToQidMaps: Map<string, string>[]
): FavoriteMigration {
  const next: Record<string, boolean> = {};
  let changed = false;
  for (const [key, value] of Object.entries(favorites)) {
    if (!value) {
      changed = true; // drop falsy entries
      continue;
    }
    if (QID_PATTERN.test(key)) {
      next[key] = true;
      continue;
    }
    const qid = textToQidMaps.map((m) => m.get(key)).find(Boolean);
    next[qid ?? key] = true;
    if (qid) changed = true;
  }
  return { favorites: next, changed };
}
