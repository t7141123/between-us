/**
 * AuthService: Coordinates progressive optional authentication and cross-platform entitlements sync.
 * Zero-forced login; users can freely use the app locally and bind accounts only when they choose.
 */
import { AuthProvider, AuthUser } from '../types';
import { StorageService } from './storage';

export type { AuthUser };

export interface SyncResult {
  unlockedPacks: string[];
  isSupporter: boolean;
}

export const AuthService = {
  /** Log in or bind user with progressive auth */
  async login(
    email: string,
    provider: AuthProvider = 'email'
  ): Promise<{ success: boolean; user?: AuthUser; error?: string }> {
    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, provider }),
      });

      if (!res.ok) {
        const errJson = await res.json().catch(() => ({}));
        return { success: false, error: (errJson as { error?: string }).error || 'Login failed' };
      }

      const data = (await res.json()) as { user: AuthUser };
      if (data.user) {
        await StorageService.setAuthUser(data.user);
        return { success: true, user: data.user };
      }
      return { success: false, error: 'User data missing' };
    } catch (err) {
      return {
        success: false,
        error: err instanceof Error ? err.message : 'Unknown login error',
      };
    }
  },

  /** Log out and clear local user session */
  async logout(): Promise<void> {
    await StorageService.clearAuthUser();
  },

  /** Sync cloud entitlements down to the client device */
  async syncCloudEntitlements(userId: string): Promise<SyncResult | null> {
    try {
      const res = await fetch(`/api/sync/entitlements?userId=${encodeURIComponent(userId)}`);
      if (!res.ok) return null;

      const data = (await res.json()) as {
        unlockedPacks: string[];
        isSupporter: boolean;
      };

      // Merge into local storage
      const localPacks = await StorageService.getUnlockedPacks();
      const mergedPacks = Array.from(new Set([...localPacks, ...(data.unlockedPacks || [])]));
      for (const p of mergedPacks) {
        await StorageService.unlockPack(p);
      }

      if (data.isSupporter) {
        await StorageService.setIsSupporter(true);
      }

      return {
        unlockedPacks: mergedPacks,
        isSupporter: data.isSupporter,
      };
    } catch {
      return null;
    }
  },

  /** Link a past anonymous order to the newly authenticated account */
  async claimOrder(userId: string, orderId: string): Promise<boolean> {
    try {
      const res = await fetch('/api/sync/entitlements', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId, orderId }),
      });
      return res.ok;
    } catch {
      return false;
    }
  },
};
