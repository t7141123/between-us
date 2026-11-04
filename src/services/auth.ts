/**
 * AuthService: Coordinates progressive optional authentication and cross-platform entitlements sync.
 * Zero-forced login; users can freely use the app locally and bind accounts only when they choose.
 */
import { AuthUser, CardSkinId } from '../types';
import { StorageService } from './storage';
import { ErrorCode, errorFromResponse } from './errors';
import { API_BASE_URL } from '../constants/api';

export type { AuthUser };

export interface SyncResult {
  unlockedPacks: string[];
  unlockedSkins?: CardSkinId[];
  isSupporter: boolean;
}

/** Authorization header for the currently signed-in user (empty when signed out). */
async function authHeaders(): Promise<Record<string, string>> {
  const user = await StorageService.getAuthUser();
  return user?.token ? { Authorization: `Bearer ${user.token}` } : {};
}

export const AuthService = {
  /** Log in or register with email and password */
  async authenticateWithEmail(
    email: string,
    password: string,
    mode: 'login' | 'register' = 'login'
  ): Promise<{ success: boolean; user?: AuthUser; error?: ErrorCode }> {
    try {
      const res = await fetch(`${API_BASE_URL}/api/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password, mode }),
      });

      if (!res.ok) return { success: false, error: await errorFromResponse(res) };

      const data = (await res.json()) as { user: AuthUser };
      if (data.user) {
        await StorageService.setAuthUser(data.user);
        return { success: true, user: data.user };
      }
      return { success: false, error: 'err_generic' };
    } catch {
      return { success: false, error: 'err_network' };
    }
  },

  /** Log in via Apple / Google OAuth endpoint */
  async authenticateWithOAuth(
    provider: 'apple' | 'google',
    payload: { idToken: string; authorizationCode?: string }
  ): Promise<{ success: boolean; user?: AuthUser; error?: ErrorCode }> {
    try {
      const res = await fetch(`${API_BASE_URL}/api/auth/oauth`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ provider, ...payload }),
      });

      if (!res.ok) return { success: false, error: await errorFromResponse(res) };

      const data = (await res.json()) as { user: AuthUser };
      if (data.user) {
        await StorageService.setAuthUser(data.user);
        return { success: true, user: data.user };
      }
      return { success: false, error: 'err_generic' };
    } catch {
      return { success: false, error: 'err_network' };
    }
  },

  /** Log out and clear local user session */
  async logout(): Promise<void> {
    await StorageService.clearAuthUser();
  },

  /** Delete user account and all personal data (Apple Guideline 5.1.1(v)) */
  async deleteAccount(): Promise<{ success: boolean; error?: ErrorCode }> {
    try {
      const res = await fetch(`${API_BASE_URL}/api/auth/delete`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', ...(await authHeaders()) },
      });

      if (!res.ok) return { success: false, error: await errorFromResponse(res, 'err_delete_failed') };

      await StorageService.clearAuthUser();
      return { success: true };
    } catch {
      // Do NOT report success: the server-side data has not been deleted.
      return { success: false, error: 'err_delete_network' };
    }
  },

  /** Sync cloud entitlements down to the client device */
  async syncCloudEntitlements(_userId?: string): Promise<SyncResult | null> {
    try {
      const res = await fetch(`${API_BASE_URL}/api/sync/entitlements`, {
        headers: await authHeaders(),
      });
      if (!res.ok) return null;

      const data = (await res.json()) as {
        unlockedPacks: string[];
        unlockedSkins?: CardSkinId[];
        isSupporter: boolean;
      };

      // Merge into local storage
      const localPacks = await StorageService.getUnlockedPacks();
      const mergedPacks = Array.from(new Set([...localPacks, ...(data.unlockedPacks || [])]));
      for (const p of mergedPacks) {
        await StorageService.unlockPack(p);
      }

      if (data.unlockedSkins && Array.isArray(data.unlockedSkins)) {
        for (const s of data.unlockedSkins) {
          await StorageService.unlockSkin(s);
        }
      }

      if (data.isSupporter) {
        await StorageService.setIsSupporter(true);
      }

      return {
        unlockedPacks: mergedPacks,
        unlockedSkins: data.unlockedSkins || [],
        isSupporter: data.isSupporter,
      };
    } catch {
      return null;
    }
  },

  /** Link a past anonymous order to the newly authenticated account */
  async claimOrder(_userId: string, orderId: string): Promise<boolean> {
    try {
      const res = await fetch(`${API_BASE_URL}/api/sync/entitlements`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', ...(await authHeaders()) },
        body: JSON.stringify({ orderId }),
      });
      return res.ok;
    } catch {
      return false;
    }
  },
};
