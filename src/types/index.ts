/**
 * TypeScript Type Definitions for Between Us application.
 */

export type LocaleKey = 'zh-TW' | 'zh-CN' | 'en';

export type CategoryKey =
  | 'vision'
  | 'soul'
  | 'finance'
  | 'intimacy'
  | 'fun'
  | 'growth'
  | 'faith';

export type CategoryFilter = CategoryKey | 'all';

export interface CategoryData {
  label: string;
  questions: string[];
}

export interface LocalePackage {
  locale: LocaleKey;
  label: string;
  ui: Record<string, string>;
  categories: Record<CategoryKey, CategoryData>;
}

export interface QuestionEntry {
  id: string;
  categoryKey: CategoryKey;
  categoryLabel: string;
  text: string;
  index: number;
}

export type ThemeMode = 'light' | 'dark';

export interface ThemeColors {
  clay: string;
  clayHover: string;
  paper: string;
  card: string;
  cardBack: string;
  ink: string;
  muted: string;
  gold: string;
  line: string;
  shadow: string;
  badgeBg: string;
}
