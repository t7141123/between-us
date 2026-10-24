/**
 * Cloudflare Pages Function: POST /api/payment/ecpay/callback
 * Server-to-server webhook invoked by ECPay when payment state updates.
 */
import {
  calculateCheckMacValue,
  parseFormBody,
  ensureOrdersTable,
  grantEntitlement,
} from '../_lib.js';

export async function onRequestPost(context) {
  const { request, env } = context;

  try {
    const formData = await parseFormBody(request);
    const hashKey = env.ECPAY_HASH_KEY || 'pwFHCqoHZGmho4wH';
    const hashIv = env.ECPAY_HASH_IV || 'EkRm7iFT261wapeV';

    const calculatedMac = await calculateCheckMacValue(formData, hashKey, hashIv);
    if (calculatedMac !== formData.CheckMacValue) {
      return new Response('0|CheckMacValue Error', { status: 400 });
    }

    const { MerchantTradeNo, RtnCode, TradeNo, PaymentDate, PaymentType, TradeAmt } = formData;

    if (RtnCode === '1' && env.DB) {
      await ensureOrdersTable(env.DB);
      const order = await env.DB.prepare('SELECT * FROM orders WHERE id = ?')
        .bind(MerchantTradeNo)
        .first();

      if (order && order.status === 'pending') {
        // Prevent amount tampering
        if (TradeAmt && Number(TradeAmt) !== order.amount) {
          return new Response('0|Amount Mismatch', { status: 400 });
        }

        await env.DB.prepare(
          `UPDATE orders
           SET status = 'paid', trade_no = ?, payment_type = ?, payment_date = ?, updated_at = CURRENT_TIMESTAMP
           WHERE id = ?`
        )
          .bind(
            TradeNo || null,
            PaymentType || null,
            PaymentDate || null,
            MerchantTradeNo
          )
          .run();

        // Grant entitlement to user for cross-platform restore
        const finalUserId = order.user_id || formData.CustomField1 || null;
        if (finalUserId) {
          await grantEntitlement(
            env.DB,
            finalUserId,
            order.item_key,
            'ecpay',
            MerchantTradeNo
          );
        }
      }
    }

    return new Response('1|OK', {
      status: 200,
      headers: { 'Content-Type': 'text/plain' },
    });
  } catch (err) {
    return new Response(
      `0|${err instanceof Error ? err.message : 'Callback processing error'}`,
      { status: 500, headers: { 'Content-Type': 'text/plain' } }
    );
  }
}
