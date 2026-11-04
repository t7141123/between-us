/**
 * IapService: native StoreKit (iOS) / Play Billing (Android) boundary.
 *
 * STATUS: not wired to StoreKit yet. It needs the Apple Developer account (products must exist
 * in App Store Connect and be tested in sandbox on a real build). Until then `isAvailable()` is
 * false and the store UI reports that purchases are not open yet, instead of faking a purchase.
 *
 * Planned implementation with `expo-iap`:
 *   - product ids == STORE_ITEMS keys (e.g. "pack_sensual"), see functions/api/payment/_lib.js
 *   - purchase(): requestPurchase -> receive transaction -> PaymentService.recordNativeIAP(transactionId)
 *     -> only after the server confirms, finishTransaction (consumable for tips, non-consumable otherwise)
 *   - restore(): getAvailablePurchases -> verify each transactionId on the server (same endpoint)
 *   - getLocalizedPrice(): StoreKit product.displayPrice (never hardcode currency strings)
 *
 * The server never trusts the client for what was bought: it looks the transaction up at Apple.
 */
import type { StoreItemKey } from './payment';

export type PurchaseResult =
  | { status: 'success'; transactionId: string }
  | { status: 'cancelled' }
  | { status: 'unavailable' }
  | { status: 'error'; error: string };

export type RestoreResult =
  | { status: 'success'; transactionIds: string[] }
  | { status: 'unavailable' }
  | { status: 'error'; error: string };

export const IapService = {
  isAvailable(): boolean {
    return false;
  },

  /** Localized price from the store (e.g. "NT$90"), or null when unknown. */
  async getLocalizedPrice(_itemKey: StoreItemKey): Promise<string | null> {
    return null;
  },

  async purchase(_itemKey: StoreItemKey): Promise<PurchaseResult> {
    return { status: 'unavailable' };
  },

  async restore(): Promise<RestoreResult> {
    return { status: 'unavailable' };
  },
};
