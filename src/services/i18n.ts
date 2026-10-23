/**
 * Internationalization service for multi-language question banks and UI strings.
 * Loads standalone locale packages: zh-TW.json, zh-CN.json, en.json.
 */
import { LocaleKey, LocalePackage, CategoryFilter, QuestionEntry } from '../types';

import zhTWData from '../locales/zh-TW.json';
import zhCNData from '../locales/zh-CN.json';
import enData from '../locales/en.json';

const PACKAGES: Record<LocaleKey, LocalePackage> = {
  'zh-TW': zhTWData as unknown as LocalePackage,
  'zh-CN': zhCNData as unknown as LocalePackage,
  en: enData as unknown as LocalePackage,
};

export const I18nService = {
  getPackage(locale: LocaleKey): LocalePackage {
    return PACKAGES[locale] || PACKAGES['zh-TW'];
  },

  t(locale: LocaleKey, key: string, fallback?: string): string {
    const pkg = this.getPackage(locale);
    return pkg.ui[key] ?? fallback ?? key;
  },

  getCategoryLabel(locale: LocaleKey, catKey: string): string {
    const pkg = this.getPackage(locale);
    if (catKey === 'all') {
      return pkg.ui.all || 'All';
    }
    const cat = pkg.categories[catKey as keyof typeof pkg.categories];
    return cat ? cat.label : catKey;
  },

  getQuestions(locale: LocaleKey, filter: CategoryFilter): QuestionEntry[] {
    const pkg = this.getPackage(locale);
    const results: QuestionEntry[] = [];

    const categories = Object.entries(pkg.categories) as [
      keyof typeof pkg.categories,
      (typeof pkg.categories)[keyof typeof pkg.categories],
    ][];

    categories.forEach(([catKey, catData]) => {
      if (filter !== 'all' && filter !== catKey) {
        return;
      }
      catData.questions.forEach((text, idx) => {
        results.push({
          id: `${locale}-${catKey}-${idx}`,
          categoryKey: catKey,
          categoryLabel: catData.label,
          text,
          index: idx,
        });
      });
    });

    return results;
  },

  findCategoryKey(locale: LocaleKey, questionText: string): string | null {
    const pkg = this.getPackage(locale);
    for (const [key, catData] of Object.entries(pkg.categories)) {
      if (catData.questions.includes(questionText)) {
        return key;
      }
    }
    return null;
  },
};
