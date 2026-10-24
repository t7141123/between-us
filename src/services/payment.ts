/**
 * PaymentService: Coordinates Web ECPay checkout and order verification.
 * Follows zero-tracking privacy architecture; unlocked states stored securely on client.
 */
import { Platform } from 'react-native';
import { StorageService } from './storage';

export type StoreItemKey =
  | 'pack_sensual'
  | 'pack_marriage'
  | 'pack_parenting'
  | 'tip_coffee'
  | 'tip_afternoon';

export interface VerifyOrderResponse {
  orderId: string;
  paid: boolean;
  status: string;
  itemKey?: string;
  amount?: number;
  target?: string | null;
  type?: 'pack' | 'supporter' | null;
  error?: string;
}

export const PaymentService = {
  /** Initiates ECPay checkout by creating and posting a hidden form in Web browser */
  async startEcpayCheckout(
    itemKey: StoreItemKey,
    explicitUserId?: string | null
  ): Promise<{ success: boolean; error?: string }> {
    if (Platform.OS !== 'web' || typeof document === 'undefined') {
      return { success: false, error: 'ECPay Web checkout is currently supported on Web' };
    }

    try {
      const user = explicitUserId ? null : await StorageService.getAuthUser();
      const userId = explicitUserId || user?.id || null;
      const res = await fetch('/api/payment/ecpay/checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ itemKey, userId }),
      });

      if (!res.ok) {
        const errJson = await res.json().catch(() => ({}));
        return { success: false, error: (errJson as { error?: string }).error || 'Checkout initiation failed' };
      }

      const data = (await res.json()) as {
        orderId: string;
        action: string;
        params: Record<string, string>;
      };

      if (!data.action || !data.params) {
        return { success: false, error: 'Malformed checkout response' };
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
    } catch (err) {
      return {
        success: false,
        error: err instanceof Error ? err.message : 'Unknown payment error',
      };
    }
  },

  /** Verifies if an order has been successfully paid by polling Cloudflare API */
  async verifyOrder(orderId: string): Promise<VerifyOrderResponse | null> {
    try {
      const res = await fetch(`/api/payment/verify?orderId=${encodeURIComponent(orderId)}`);
      if (!res.ok) {
        return null;
      }
      return (await res.json()) as VerifyOrderResponse;
    } catch {
      return null;
    }
  },
};
