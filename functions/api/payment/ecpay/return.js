/**
 * Cloudflare Pages Function: POST /api/payment/ecpay/return
 * Browser redirect after consumer completes payment flow on ECPay.
 */
import {
  calculateCheckMacValue,
  parseFormBody,
  ensureOrdersTable,
} from '../_lib.js';

export async function onRequestPost(context) {
  const { request, env } = context;

  const isLocal =
    request.url.includes('localhost') || request.url.includes('127.0.0.1');
  const origin = isLocal
    ? new URL(request.url).origin
    : 'https://between-us.ark-studio.app';

  try {
    const formData = await parseFormBody(request);
    const hashKey = env.ECPAY_HASH_KEY || 'pwFHCqoHZGmho4wH';
    const hashIv = env.ECPAY_HASH_IV || 'EkRm7iFT261wapeV';

    const calculatedMac = await calculateCheckMacValue(formData, hashKey, hashIv);
    const isMacValid = calculatedMac === formData.CheckMacValue;
    const isSuccess = isMacValid && formData.RtnCode === '1';
    const orderId = formData.MerchantTradeNo || '';

    let itemKey = '';
    if (env.DB && orderId) {
      await ensureOrdersTable(env.DB);
      const order = await env.DB.prepare('SELECT item_key FROM orders WHERE id = ?')
        .bind(orderId)
        .first();
      if (order && order.item_key) {
        itemKey = order.item_key;
      }
    }

    const redirectUrl = isSuccess
      ? `${origin}/?payment=success&orderId=${encodeURIComponent(orderId)}&item=${encodeURIComponent(itemKey)}`
      : `${origin}/?payment=failed`;

    return Response.redirect(redirectUrl, 302);
  } catch {
    return Response.redirect(`${origin}/?payment=failed`, 302);
  }
}
