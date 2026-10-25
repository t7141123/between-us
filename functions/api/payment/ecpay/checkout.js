/**
 * Cloudflare Pages Function: POST /api/payment/ecpay/checkout
 * Initiates ECPay checkout session and generates AIO form parameters.
 */
import {
  STORE_ITEMS,
  calculateCheckMacValue,
  formatEcpayDate,
  ensureOrdersTable,
} from '../_lib.js';

const CORS_HEADERS = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization',
};

export async function onRequestOptions() {
  return new Response(null, {
    status: 204,
    headers: CORS_HEADERS,
  });
}

export async function onRequestPost(context) {
  const { request, env } = context;

  try {
    const body = await request.json().catch(() => null);
    if (!body || !body.itemKey || !STORE_ITEMS[body.itemKey]) {
      return new Response(
        JSON.stringify({ error: 'Invalid or missing itemKey' }),
        { status: 400, headers: { 'Content-Type': 'application/json', ...CORS_HEADERS } }
      );
    }

    const item = STORE_ITEMS[body.itemKey];
    const merchantId = env.ECPAY_MERCHANT_ID || '3002607';
    const hashKey = env.ECPAY_HASH_KEY || 'pwFHCqoHZGmho4wH';
    const hashIv = env.ECPAY_HASH_IV || 'EkRm7iFT261wapeV';
    const endpoint =
      env.ECPAY_ENDPOINT || 'https://payment-stage.ecpay.com.tw/Cashier/AioCheckOut/V5';

    // MerchantTradeNo must be <= 20 chars and alphanumeric
    const tradeNo = `BU${Date.now().toString().slice(-8)}${Math.random()
      .toString(36)
      .slice(2, 6)
      .toUpperCase()}`;

    const userId = typeof body.userId === 'string' ? body.userId.trim().slice(0, 48) : null;

    // Ensure database table exists and insert pending order
    if (env.DB) {
      await ensureOrdersTable(env.DB);
      await env.DB.prepare(
        'INSERT INTO orders (id, user_id, item_key, amount, currency, status) VALUES (?, ?, ?, ?, ?, ?)'
      )
        .bind(tradeNo, userId, item.id, item.amount, 'TWD', 'pending')
        .run();
    }

    const isLocal =
      request.url.includes('localhost') || request.url.includes('127.0.0.1');
    const origin = isLocal
      ? new URL(request.url).origin
      : 'https://between-us.ark-studio.app';
    const tradeDate = formatEcpayDate();

    const ecpayParams = {
      MerchantID: merchantId,
      MerchantTradeNo: tradeNo,
      MerchantTradeDate: tradeDate,
      PaymentType: 'aio',
      TotalAmount: item.amount.toString(),
      TradeDesc: 'Between Us Order',
      ItemName: item.name,
      ReturnURL: `${origin}/api/payment/ecpay/callback`,
      OrderResultURL: `${origin}/api/payment/ecpay/return`,
      ClientBackURL: `${origin}/?payment=cancelled`,
      ChoosePayment: 'ALL',
      EncryptType: '1',
      CustomField1: userId || '',
    };

    ecpayParams.CheckMacValue = await calculateCheckMacValue(
      ecpayParams,
      hashKey,
      hashIv
    );

    return new Response(
      JSON.stringify({
        orderId: tradeNo,
        action: endpoint,
        params: ecpayParams,
      }),
      { status: 200, headers: { 'Content-Type': 'application/json', ...CORS_HEADERS } }
    );
  } catch (err) {
    return new Response(
      JSON.stringify({ error: err instanceof Error ? err.message : 'Checkout failed' }),
      { status: 500, headers: { 'Content-Type': 'application/json', ...CORS_HEADERS } }
    );
  }
}
