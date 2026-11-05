/**
 * Deck construction for the app: wires the pure logic in deckCore.ts to the bundled
 * question banks (locale files + expansion packs).
 */
import {
  MARRIAGE_PACK_DATA,
  PARENTING_PACK_DATA,
  SENSUAL_PACK_DATA,
  PackQuestionItem,
} from '../constants/packs';
import type { CategoryFilter, ExpansionPackId, LocaleKey, QuestionEntry } from '../types';
import { buildDeckCore, migrateFavoriteKeys, PACK_IDS } from './deckCore';
import type { BuildDeckResult, FavoriteMigration, PendingPaid, ShareTarget } from './deckCore';
import { customEntries } from './customCore';
import type { CustomQuestion } from './customCore';
import { sessionById } from '../constants/sessions';
import { I18nService } from './i18n';
import { dayKey } from './progressCore';
import { pickSessionQids, sessionIdOfCategory } from './sessionCore';

export * from './deckCore';

const PACKS: Record<
  ExpansionPackId,
  {
    data: PackQuestionItem[];
    categoryKey: QuestionEntry['categoryKey'];
    titleKey: string;
    titleFallback: string;
  }
> = {
  sensual: { data: SENSUAL_PACK_DATA, categoryKey: 'intimacy', titleKey: 'pack_sensual_title', titleFallback: '🔥 深夜私語' },
  marriage: { data: MARRIAGE_PACK_DATA, categoryKey: 'vision', titleKey: 'pack_marriage_title', titleFallback: '💍 婚姻誓約前夕' },
  parenting: { data: PARENTING_PACK_DATA, categoryKey: 'growth', titleKey: 'pack_parenting_title', titleFallback: '🌱 新生兒與新手父母' },
};

function pick(item: { tw: string; cn: string; en: string }, locale: LocaleKey): string {
  return locale === 'zh-TW' ? item.tw : locale === 'zh-CN' ? item.cn : item.en;
}

function pickHint(item: PackQuestionItem, locale: LocaleKey): string | undefined {
  if (locale === 'zh-TW') return item.hint_tw;
  if (locale === 'zh-CN') return item.hint_cn;
  return item.hint_en;
}

export function buildPackQuestions(packId: ExpansionPackId, locale: LocaleKey): QuestionEntry[] {
  const pack = PACKS[packId];
  const label = I18nService.t(locale, pack.titleKey, pack.titleFallback);
  return pack.data.map((item, idx) => ({
    id: `${packId}-${idx + 1}`,
    qid: `pack:${packId}:${idx + 1}`,
    categoryKey: pack.categoryKey,
    categoryLabel: label,
    text: pick(item, locale),
    hint: pickHint(item, locale),
    index: idx + 1,
  }));
}

/** Every question the app ships (core categories + all packs), for lookups such as favorites. */
export function getAllQuestions(locale: LocaleKey, custom: CustomQuestion[] = []): QuestionEntry[] {
  return [
    ...I18nService.getQuestions(locale, 'all'),
    ...PACK_IDS.flatMap((id) => buildPackQuestions(id, locale)),
    ...customEntries(custom, I18nService.t(locale, 'custom_label')),
  ];
}

/** The ten questions of today's Date Night session (same on both partners' phones). */
export function buildSessionQuestions(sessionId: string, locale: LocaleKey, day: string = dayKey(new Date())): QuestionEntry[] {
  const def = sessionById(sessionId);
  if (!def) return [];
  const all = I18nService.getQuestions(locale, 'all');
  const byQid = new Map(all.map((q) => [q.qid, q]));
  const poolByCategory: Record<string, string[]> = {};
  for (const q of all) (poolByCategory[q.categoryKey] ??= []).push(q.qid);
  const label = I18nService.t(locale, `session_${sessionId}_title`);
  return pickSessionQids(def, poolByCategory, day).flatMap((qid) => {
    const q = byQid.get(qid);
    return q ? [{ ...q, categoryLabel: label }] : [];
  });
}

export function shuffleQuestions(items: QuestionEntry[]): QuestionEntry[] {
  const arr = [...items];
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr;
}

export function buildDeck(input: {
  category: CategoryFilter;
  locale: LocaleKey;
  unlockedPacks: string[];
  initialTarget?: ShareTarget | null;
  pendingPaid?: PendingPaid | null;
  custom?: CustomQuestion[];
}): BuildDeckResult {
  const { locale } = input;
  return buildDeckCore({
    category: input.category,
    unlockedPacks: input.unlockedPacks,
    shuffle: shuffleQuestions,
    baseQuestions: (cat) => {
      const sessionId = sessionIdOfCategory(String(cat));
      if (sessionId) return buildSessionQuestions(sessionId, locale);
      return cat === 'custom'
        ? customEntries(input.custom ?? [], I18nService.t(locale, 'custom_label'))
        : I18nService.getQuestions(locale, cat);
    },
    packQuestions: (packId) => buildPackQuestions(packId, locale),
    makeLockCard: (packId, sharedLocked) => ({
      id: `${packId}-lock`,
      qid: `lock:${packId}`,
      categoryKey: PACKS[packId].categoryKey,
      categoryLabel: I18nService.t(locale, PACKS[packId].titleKey, PACKS[packId].titleFallback),
      text: sharedLocked
        ? I18nService.t(locale, 'pack_shared_locked_hint', '伴侶與你分享了此擴充包的專屬話題，解鎖即可立即查看並探索全部 50 題。')
        : I18nService.t(locale, 'trial_ended_hint'),
      index: 4,
    }),
    initialTarget: input.initialTarget,
    pendingPaid: input.pendingPaid,
  });
}

/** Converts old text-keyed favorites to qids (works across all languages). */
export function migrateFavorites(favorites: Record<string, boolean>): FavoriteMigration {
  const locales: LocaleKey[] = ['zh-TW', 'zh-CN', 'en'];
  const maps = locales.map((locale) => {
    const map = new Map<string, string>();
    for (const q of getAllQuestions(locale)) map.set(q.text, q.qid);
    return map;
  });
  return migrateFavoriteKeys(favorites, maps);
}
