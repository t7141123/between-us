/**
 * Secure persistent storage wrapper using AsyncStorage.
 * Guards against data corruption and prototype pollution.
 */
import AsyncStorage from '@react-native-async-storage/async-storage';
import { AuthUser, CardSkinId, LocaleKey, ThemeMode } from '../types';

const STORAGE_KEYS = {
  LANG: 'betweenus.lang',
  FAV: 'betweenus.fav',
  MUTED: 'betweenus.muted',
  THEME: 'betweenus.theme',
  UNLOCKED_PACKS: 'betweenus.unlocked_packs',
  CARD_SKIN: 'betweenus.card_skin',
  SUPPORTER: 'betweenus.supporter',
  AUTH_USER: 'betweenus.auth_user',
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

  async getUnlockedPacks(): Promise<string[]> {
    try {
      const raw = await AsyncStorage.getItem(STORAGE_KEYS.UNLOCKED_PACKS);
      if (raw) {
        const parsed = JSON.parse(raw);
        if (Array.isArray(parsed)) {
          return parsed;
        }
      }
    } catch {
      // Ignore read error
    }
    return [];
  },

  async unlockPack(packId: string): Promise<string[]> {
    try {
      const current = await this.getUnlockedPacks();
      if (!current.includes(packId)) {
        const updated = [...current, packId];
        await AsyncStorage.setItem(STORAGE_KEYS.UNLOCKED_PACKS, JSON.stringify(updated));
        return updated;
      }
      return current;
    } catch {
      return [];
    }
  },

  async getCardSkin(fallback: CardSkinId = 'classic'): Promise<CardSkinId> {
    try {
      const val = await AsyncStorage.getItem(STORAGE_KEYS.CARD_SKIN);
      if (val === 'classic' || val === 'noir_gold' || val === 'midnight' || val === 'caramel') {
        return val;
      }
    } catch {
      // Ignore read error
    }
    return fallback;
  },

  async setCardSkin(skin: CardSkinId): Promise<void> {
    try {
      await AsyncStorage.setItem(STORAGE_KEYS.CARD_SKIN, skin);
    } catch {
      // Storage write error
    }
  },

  async getIsSupporter(): Promise<boolean> {
    try {
      const raw = await AsyncStorage.getItem(STORAGE_KEYS.SUPPORTER);
      return raw === '1';
    } catch {
      return false;
    }
  },

  async setIsSupporter(isSupporter: boolean): Promise<void> {
    try {
      await AsyncStorage.setItem(STORAGE_KEYS.SUPPORTER, isSupporter ? '1' : '0');
    } catch {
      // Storage write error
    }
  },

  async getAuthUser(): Promise<AuthUser | null> {
    try {
      const raw = await AsyncStorage.getItem(STORAGE_KEYS.AUTH_USER);
      if (raw) {
        return JSON.parse(raw) as AuthUser;
      }
    } catch {
      // Ignore read error
    }
    return null;
  },

  async setAuthUser(user: AuthUser): Promise<void> {
    try {
      await AsyncStorage.setItem(STORAGE_KEYS.AUTH_USER, JSON.stringify(user));
    } catch {
      // Storage write error
    }
  },

  async clearAuthUser(): Promise<void> {
    try {
      await AsyncStorage.removeItem(STORAGE_KEYS.AUTH_USER);
    } catch {
      // Storage write error
    }
  },
};
