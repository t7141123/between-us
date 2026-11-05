/**
 * PaymentService: Coordinates Web ECPay checkout and order verification.
 * Web uses ECPay; native uses Apple StoreKit via IapService (server-verified entitlements).
 */
import { Platform } from 'react-native';
import { ErrorCode, errorFromResponse } from './errors';
import { StorageService } from './storage';
import { API_BASE_URL } from '../constants/api';

export type StoreItemKey =
  | 'plus'
  | 'pack_sensual'
  | 'pack_marriage'
  | 'pack_parenting'
  | 'skin_noir_gold'
  | 'skin_rose_wine'
  | 'skin_forest_sage'
  | 'skin_midnight'
  | 'skin_caramel'
  | 'bundle_skins'
  | 'tip_coffee'
  | 'tip_afternoon';

export interface VerifyOrderResponse {
  orderId: string;
  paid: boolean;
  status: string;
  itemKey?: string;
  amount?: number;
  target?: string | null;
  type?: 'pack' | 'supporter' | 'skin' | 'bundle_skins' | 'plus' | null;
  error?: string;
}

export const PaymentService = {
  /** Initiates ECPay checkout by creating and posting a hidden form in Web browser */
  async startEcpayCheckout(
    itemKey: StoreItemKey,
    explicitUserId?: string | null
  ): Promise<{ success: boolean; error?: ErrorCode }> {
    if (Platform.OS !== 'web' || typeof document === 'undefined') {
      return { success: false, error: 'err_checkout' };
    }

    try {
      const user = explicitUserId ? null : await StorageService.getAuthUser();
      const userId = explicitUserId || user?.id || null;
      const res = await fetch(`${API_BASE_URL}/api/payment/ecpay/checkout`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ itemKey, userId }),
      });

      if (!res.ok) return { success: false, error: await errorFromResponse(res, 'err_checkout') };

      const data = (await res.json()) as {
        orderId: string;
        action: string;
        params: Record<string, string>;
      };

      if (!data.action || !data.params) {
        return { success: false, error: 'err_checkout' };
      }

      // Create and submit hidden form to jump to ECPay Cashier
      const form = document.createElement('form');
      form.method = 'POST';
      form.action = data.action;
      form.style.display = 'none';

      for (const [key, value] of Object.entries(data.params)) {
        const input = document.createElement('input');
        input.type = 'hidden';
        input.name = key;
        input.value = value;
        form.appendChild(input);
      }

      document.body.appendChild(form);
      form.submit();
      return { success: true };
    } catch {
      return { success: false, error: 'err_network' };
    }
  },

  /** Verifies if an order has been successfully paid by polling Cloudflare API */
  async verifyOrder(orderId: string): Promise<VerifyOrderResponse | null> {
    try {
      const res = await fetch(`${API_BASE_URL}/api/payment/verify?orderId=${encodeURIComponent(orderId)}`);
      if (!res.ok) {
        return null;
      }
      return (await res.json()) as VerifyOrderResponse;
    } catch {
      return null;
    }
  },

  /**
   * Asks the server to verify a StoreKit transaction with Apple and grant the entitlement.
   * The server derives the purchased product from Apple's response, not from the client.
   */
  async recordNativeIAP(transactionId: string): Promise<{ success: boolean; error?: ErrorCode }> {
    try {
      const user = await StorageService.getAuthUser();
      const res = await fetch(`${API_BASE_URL}/api/payment/iap/verify`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(user?.token ? { Authorization: `Bearer ${user.token}` } : {}),
        },
        body: JSON.stringify({ transactionId }),
      });

      if (!res.ok) return { success: false, error: await errorFromResponse(res, 'err_iap_sync') };
      return { success: true };
    } catch {
      return { success: false, error: 'err_network' };
    }
  },
};
