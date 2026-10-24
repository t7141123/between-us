/**
 * ECPay Payment Helper for Cloudflare Pages Functions.
 * Follows ECPay AioCheckOut V5 specifications and SHA-256 CheckMacValue calculation.
 */

export const STORE_ITEMS = {
  pack_sensual: {
    id: 'pack_sensual',
    name: '在我們之間 - 深夜私語擴充包',
    amount: 90,
    type: 'pack',
    target: 'sensual',
  },
  tip_coffee: {
    id: 'tip_coffee',
    name: '在我們之間 - 贊助小杯咖啡',
    amount: 60,
    type: 'supporter',
    target: 'coffee',
  },
  tip_afternoon: {
    id: 'tip_afternoon',
    name: '在我們之間 - 贊助甜蜜午茶',
    amount: 120,
    type: 'supporter',
    target: 'afternoon',
  },
};

/** Calculate ECPay CheckMacValue using SHA-256 */
export async function calculateCheckMacValue(params, hashKey, hashIv) {
  // 1. Sort parameters alphabetically by key (excluding CheckMacValue)
  const sortedKeys = Object.keys(params)
    .filter((k) => k !== 'CheckMacValue')
    .sort((a, b) => a.toLowerCase().localeCompare(b.toLowerCase()));

  // 2. Build query string: HashKey=xxx&key1=val1&key2=val2...&HashIV=yyy
  const queryParts = [`HashKey=${hashKey}`];
  for (const k of sortedKeys) {
    queryParts.push(`${k}=${params[k]}`);
  }
  queryParts.push(`HashIV=${hashIv}`);
  const rawString = queryParts.join('&');

  // 3. ECPay .NET URL encoding
  let encoded = encodeURIComponent(rawString);
  encoded = encoded
    .replace(/%20/g, '+')
    .replace(/%2d/gi, '-')
    .replace(/%5f/gi, '_')
    .replace(/%2e/gi, '.')
    .replace(/%21/gi, '!')
    .replace(/%2a/gi, '*')
    .replace(/%28/gi, '(')
    .replace(/%29/gi, ')');

  // 4. Lowercase
  const lower = encoded.toLowerCase();

  // 5. SHA-256 hash
  const msgBuffer = new TextEncoder().encode(lower);
  const hashBuffer = await crypto.subtle.digest('SHA-256', msgBuffer);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  const hashHex = hashArray.map((b) => b.toString(16).padStart(2, '0')).join('');

  // 6. Uppercase
  return hashHex.toUpperCase();
}

/** Format date as yyyy/MM/dd HH:mm:ss for ECPay */
export function formatEcpayDate(d = new Date()) {
  const pad = (n) => n.toString().padStart(2, '0');
  const year = d.getFullYear();
  const month = pad(d.getMonth() + 1);
  const date = pad(d.getDate());
  const hours = pad(d.getHours());
  const minutes = pad(d.getMinutes());
  const seconds = pad(d.getSeconds());
  return `${year}/${month}/${date} ${hours}:${minutes}:${seconds}`;
}

/** Ensure orders and user entitlements tables exist in Cloudflare D1 */
export async function ensureOrdersTable(db) {
  if (!db) return;
  await db.batch([
    db.prepare(`
      CREATE TABLE IF NOT EXISTS users (
        id TEXT PRIMARY KEY,
        email TEXT UNIQUE,
        provider TEXT DEFAULT 'email',
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
      );
    `),
    db.prepare(`
      CREATE TABLE IF NOT EXISTS orders (
        id TEXT PRIMARY KEY,
        user_id TEXT,
        item_key TEXT NOT NULL,
        amount INTEGER NOT NULL,
        currency TEXT DEFAULT 'TWD',
        status TEXT DEFAULT 'pending',
        trade_no TEXT,
        payment_type TEXT,
        payment_date TEXT,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
      );
    `),
    db.prepare(`
      CREATE TABLE IF NOT EXISTS user_entitlements (
        user_id TEXT NOT NULL,
        item_key TEXT NOT NULL,
        source TEXT DEFAULT 'ecpay',
        order_id TEXT,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        PRIMARY KEY (user_id, item_key)
      );
    `),
  ]);
}

/** Grant an entitlement to a user safely */
export async function grantEntitlement(db, userId, itemKey, source = 'ecpay', orderId = null) {
  if (!db || !userId || !itemKey) return;
  await ensureOrdersTable(db);
  await db.prepare(`
    INSERT INTO user_entitlements (user_id, item_key, source, order_id)
    VALUES (?, ?, ?, ?)
    ON CONFLICT(user_id, item_key) DO NOTHING
  `)
    .bind(userId, itemKey, source, orderId)
    .run();
}

/** Parse urlencoded or form-data body into key-value map */
export async function parseFormBody(request) {
  const text = await request.text();
  const params = {};
  const searchParams = new URLSearchParams(text);
  for (const [k, v] of searchParams.entries()) {
    params[k] = v;
  }
  return params;
}
