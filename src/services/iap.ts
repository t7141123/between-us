/**
 * IapService: StoreKit (iOS) purchases via expo-iap, verified by our server.
 *
 * Flow: requestPurchase -> purchaseUpdatedListener -> server verifies the transaction with Apple
 * (POST /api/payment/iap/verify) -> only then finishTransaction. If verification fails (offline,
 * signed out, server error) the transaction is NOT finished, so StoreKit replays it later and a paying
 * customer never loses a purchase. `recover()` re-runs verification for such leftovers.
 *
 * Product IDs in App Store Connect must equal the STORE_ITEMS keys (see functions/api/payment/_lib.js).
 * Android (Play Billing) needs its own server-side verification and is intentionally unavailable.
 */
import { Platform } from 'react-native';
import type { ErrorCode } from './errors';
import type { StoreItemKey } from './payment';
import { PaymentService } from './payment';

export const IAP_PRODUCT_IDS: StoreItemKey[] = [
  'plus',
  'pack_sensual',
  'pack_marriage',
  'pack_parenting',
  'skin_noir_gold',
  'skin_rose_wine',
  'skin_forest_sage',
  'bundle_skins',
  'tip_coffee',
  'tip_afternoon',
];

export type PurchaseResult =
  | { status: 'success'; itemKey: string }
  | { status: 'cancelled' }
  | { status: 'unavailable' }
  | { status: 'error'; error: ErrorCode };

export type RestoreResult =
  | { status: 'success'; restored: number }
  | { status: 'unavailable' }
  | { status: 'error'; error: ErrorCode };

type IapModule = typeof import('expo-iap');
type StorePurchase = Parameters<IapModule['finishTransaction']>[0]['purchase'];

let modulePromise: Promise<IapModule | null> | null = null;
const pending = new Map<string, (result: PurchaseResult) => void>();
const prices = new Map<string, string>();

const isConsumable = (productId: string) => productId.startsWith('tip_');

/** Verify one store transaction on the server and finish it only on success. */
async function verifyAndFinish(iap: IapModule, purchase: StorePurchase): Promise<PurchaseResult> {
  if (purchase.purchaseState !== 'purchased') return { status: 'error', error: 'err_checkout' };
  const recorded = await PaymentService.recordNativeIAP(String(purchase.id));
  if (!recorded.success) {
    return { status: 'error', error: recorded.error ?? 'err_iap_sync' };
  }
  await iap.finishTransaction({ purchase, isConsumable: isConsumable(purchase.productId) });
  return { status: 'success', itemKey: purchase.productId };
}

function load(): Promise<IapModule | null> {
  if (Platform.OS !== 'ios') return Promise.resolve(null);
  if (!modulePromise) {
    modulePromise = (async () => {
      try {
        const iap = await import('expo-iap');
        await iap.initConnection();
        iap.purchaseUpdatedListener(async (purchase) => {
          const result = await verifyAndFinish(iap, purchase).catch(
            (): PurchaseResult => ({ status: 'error', error: 'err_iap_sync' })
          );
          pending.get(purchase.productId)?.(result);
          pending.delete(purchase.productId);
        });
        iap.purchaseErrorListener((error) => {
          const productId = error.productId ?? '';
          const resolve = pending.get(productId);
          if (!resolve) return;
          pending.delete(productId);
          resolve(
            error.code === iap.ErrorCode.UserCancelled
              ? { status: 'cancelled' }
              : { status: 'error', error: 'err_checkout' }
          );
        });
        return iap;
      } catch {
        modulePromise = null; // allow a retry on next call
        return null;
      }
    })();
  }
  return modulePromise;
}

export const IapService = {
  /** True where native purchases are supported (iOS). */
  isAvailable(): boolean {
    return Platform.OS === 'ios';
  },

  /** Connects to StoreKit early so unfinished transactions get delivered. Safe to call repeatedly. */
  async init(): Promise<void> {
    await load();
  },

  /** Fetches localized prices from the store (e.g. "NT$90"). Empty map when unavailable. */
  async loadPrices(): Promise<Record<string, string>> {
    const iap = await load();
    if (!iap) return {};
    try {
      const products = await iap.fetchProducts({ skus: IAP_PRODUCT_IDS, type: 'in-app' });
      for (const p of products ?? []) prices.set(p.id, p.displayPrice);
    } catch {
      // keep whatever is cached
    }
    return Object.fromEntries(prices);
  },

  async purchase(itemKey: StoreItemKey): Promise<PurchaseResult> {
    const iap = await load();
    if (!iap) return { status: 'unavailable' };
    return new Promise<PurchaseResult>((resolve) => {
      pending.set(itemKey, resolve);
      iap
        .requestPurchase({ request: { apple: { sku: itemKey } }, type: 'in-app' })
        .catch(() => {
          pending.delete(itemKey);
          resolve({ status: 'error', error: 'err_checkout' });
        });
    });
  },

  /**
   * Silent recovery (no Apple ID prompt): verifies purchases the store still lists as unfinished,
   * e.g. a purchase made while signed out or offline. Call after sign-in / app start.
   */
  async recover(): Promise<number> {
    const iap = await load();
    if (!iap) return 0;
    try {
      let recovered = 0;
      for (const purchase of (await iap.getAvailablePurchases()) ?? []) {
        if ((await verifyAndFinish(iap, purchase)).status === 'success') recovered += 1;
      }
      return recovered;
    } catch {
      return 0;
    }
  },

  /**
   * User-initiated "Restore Purchases": asks the store to sync (may prompt for the Apple ID),
   * then verifies everything it lists. Requires a signed-in app account.
   */
  async restore(): Promise<RestoreResult> {
    const iap = await load();
    if (!iap) return { status: 'unavailable' };
    try {
      await iap.restorePurchases();
      return { status: 'success', restored: await this.recover() };
    } catch {
      return { status: 'error', error: 'err_iap_sync' };
    }
  },
};
