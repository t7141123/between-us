/**
 * Secure persistent storage wrapper using AsyncStorage.
 * Guards against data corruption and prototype pollution.
 */
import AsyncStorage from '@react-native-async-storage/async-storage';
import { LocaleKey, ThemeMode } from '../types';

const STORAGE_KEYS = {
  LANG: 'betweenus.lang',
  FAV: 'betweenus.fav',
  MUTED: 'betweenus.muted',
  THEME: 'betweenus.theme',
} as const;

export const StorageService = {
  async getLocale(fallback: LocaleKey = 'zh-TW'): Promise<LocaleKey> {
    try {
      const val = await AsyncStorage.getItem(STORAGE_KEYS.LANG);
      if (val === 'zh-TW' || val === 'zh-CN' || val === 'en') {
        return val;
      }
    } catch {
      // Ignore storage read error and fallback
    }
    return fallback;
  },

  async setLocale(locale: LocaleKey): Promise<void> {
    try {
      await AsyncStorage.setItem(STORAGE_KEYS.LANG, locale);
    } catch {
      // Storage write error
    }
  },

  async getFavorites(): Promise<Record<string, boolean>> {
    try {
      const raw = await AsyncStorage.getItem(STORAGE_KEYS.FAV);
      if (raw) {
        const parsed = JSON.parse(raw);
        if (parsed && typeof parsed === 'object' && !Array.isArray(parsed)) {
          return parsed;
        }
      }
    } catch {
      // Ignore parse failure
    }
    return {};
  },

  async setFavorites(favs: Record<string, boolean>): Promise<void> {
    try {
      await AsyncStorage.setItem(STORAGE_KEYS.FAV, JSON.stringify(favs));
    } catch {
      // Storage write error
    }
  },

  async getMuted(fallback = false): Promise<boolean> {
    try {
      const raw = await AsyncStorage.getItem(STORAGE_KEYS.MUTED);
      if (raw !== null) {
        return raw === '1';
      }
    } catch {
      // Storage read error
    }
    return fallback;
  },

  async setMuted(muted: boolean): Promise<void> {
    try {
      await AsyncStorage.setItem(STORAGE_KEYS.MUTED, muted ? '1' : '0');
    } catch {
      // Storage write error
    }
  },

  async getTheme(): Promise<ThemeMode | null> {
    try {
      const val = await AsyncStorage.getItem(STORAGE_KEYS.THEME);
      if (val === 'light' || val === 'dark') {
        return val;
      }
    } catch {
      // Storage read error
    }
    return null;
  },

  async setTheme(theme: ThemeMode): Promise<void> {
    try {
      await AsyncStorage.setItem(STORAGE_KEYS.THEME, theme);
    } catch {
      // Storage write error
    }
  },
};
