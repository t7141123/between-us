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
  pack_marriage: {
    id: 'pack_marriage',
    name: '在我們之間 - 婚姻誓約前夕擴充包',
    amount: 90,
    type: 'pack',
    target: 'marriage',
  },
  pack_parenting: {
    id: 'pack_parenting',
    name: '在我們之間 - 新生兒與新手父母擴充包',
    amount: 90,
    type: 'pack',
    target: 'parenting',
  },
  skin_noir_gold: {
    id: 'skin_noir_gold',
    name: '在我們之間 - 曜石黑金卡片主題',
    amount: 30,
    type: 'skin',
    target: 'noir_gold',
  },
  skin_rose_wine: {
    id: 'skin_rose_wine',
    name: '在我們之間 - 薄暮玫瑰卡片主題',
    amount: 30,
    type: 'skin',
    target: 'rose_wine',
  },
  skin_forest_sage: {
    id: 'skin_forest_sage',
    name: '在我們之間 - 靜謐深林卡片主題',
    amount: 30,
    type: 'skin',
    target: 'forest_sage',
  },
  skin_midnight: {
    id: 'skin_midnight',
    name: '在我們之間 - 午夜星空卡片主題',
    amount: 30,
    type: 'skin',
    target: 'forest_sage',
  },
  skin_caramel: {
    id: 'skin_caramel',
    name: '在我們之間 - 暖陽焦糖卡片主題',
    amount: 30,
    type: 'skin',
    target: 'rose_wine',
  },
  bundle_skins: {
    id: 'bundle_skins',
    name: '在我們之間 - 卡片主題全套大禮包',
    amount: 60,
    type: 'bundle_skins',
    target: 'all_skins',
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

/**
 * Constant-time byte array comparison against timing side-channel attacks
 */
export function constantTimeEqual(aStr, bStr) {
  if (typeof aStr !== 'string' || typeof bStr !== 'string') return false;
  if (aStr.length !== bStr.length) return false;
  const a = new TextEncoder().encode(aStr);
  const b = new TextEncoder().encode(bStr);
  let diff = 0;
  for (let i = 0; i < a.length; i++) {
    diff |= a[i] ^ b[i];
  }
  return diff === 0;
}

/**
 * Validates Origin and returns strict CORS headers to prevent CSRF / unauthorized cross-origin requests
 */
export function getCorsHeaders(request, allowedMethods = 'GET, POST, OPTIONS') {
  const origin = request ? request.headers.get('Origin') : null;
  const canonicalOrigin = 'https://between-us.ark-studio.app';

  let allowOrigin = canonicalOrigin;
  if (origin) {
    const isLocal =
      origin.startsWith('http://localhost:') ||
      origin.startsWith('http://127.0.0.1:');
    const isCanonical =
      origin === canonicalOrigin || origin.endsWith('.love-between-us.pages.dev');
    if (isLocal || isCanonical) {
      allowOrigin = origin;
    }
  }

  return {
    'Access-Control-Allow-Origin': allowOrigin,
    'Access-Control-Allow-Methods': allowedMethods,
    'Access-Control-Allow-Headers': 'Content-Type, Authorization',
    'Vary': 'Origin',
  };
}

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
        password_hash TEXT,
        provider TEXT DEFAULT 'email',
        google_sub TEXT,
        apple_sub TEXT,
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
    db.prepare(`
      CREATE TABLE IF NOT EXISTS sync_rooms (
        code TEXT PRIMARY KEY,
        category TEXT NOT NULL,
        question_text TEXT NOT NULL,
        is_flipped INTEGER DEFAULT 0,
        version INTEGER DEFAULT 1,
        updated_at INTEGER NOT NULL
      );
    `),
  ]);

  // Try adding columns if existing database table was created with older schema
  try {
    await db.prepare('ALTER TABLE users ADD COLUMN password_hash TEXT').run().catch(() => {});
    await db.prepare('ALTER TABLE users ADD COLUMN google_sub TEXT').run().catch(() => {});
    await db.prepare('ALTER TABLE users ADD COLUMN apple_sub TEXT').run().catch(() => {});
  } catch {
    // Ignore if columns already exist
  }
}

/**
 * PBKDF2 Password Hashing using native Web Crypto API
 * Format: pbkdf2$100000$<salt_hex>$<hash_hex>
 */
export async function hashPassword(password) {
  const salt = crypto.getRandomValues(new Uint8Array(16));
  const saltHex = Array.from(salt).map((b) => b.toString(16).padStart(2, '0')).join('');

  const keyMaterial = await crypto.subtle.importKey(
    'raw',
    new TextEncoder().encode(password),
    { name: 'PBKDF2' },
    false,
    ['deriveBits']
  );

  const derivedBits = await crypto.subtle.deriveBits(
    {
      name: 'PBKDF2',
      salt,
      iterations: 100000,
      hash: 'SHA-256',
    },
    keyMaterial,
    256
  );

  const hashHex = Array.from(new Uint8Array(derivedBits))
    .map((b) => b.toString(16).padStart(2, '0'))
    .join('');

  return `pbkdf2$100000$${saltHex}$${hashHex}`;
}

/**
 * Verify a plaintext password against a stored PBKDF2 hash string
 */
export async function verifyPassword(password, storedHashStr) {
  if (!storedHashStr || typeof storedHashStr !== 'string') return false;
  const parts = storedHashStr.split('$');
  if (parts.length !== 4 || parts[0] !== 'pbkdf2') return false;

  const iterations = parseInt(parts[1], 10);
  const saltHex = parts[2];
  const expectedHashHex = parts[3];

  const salt = new Uint8Array(saltHex.match(/.{1,2}/g).map((byte) => parseInt(byte, 16)));

  const keyMaterial = await crypto.subtle.importKey(
    'raw',
    new TextEncoder().encode(password),
    { name: 'PBKDF2' },
    false,
    ['deriveBits']
  );

  const derivedBits = await crypto.subtle.deriveBits(
    {
      name: 'PBKDF2',
      salt,
      iterations,
      hash: 'SHA-256',
    },
    keyMaterial,
    256
  );

  const computedHashHex = Array.from(new Uint8Array(derivedBits))
    .map((b) => b.toString(16).padStart(2, '0'))
    .join('');

  return constantTimeEqual(computedHashHex, expectedHashHex);
}

/**
 * Signs an HMAC-SHA256 Session Token
 * Token format: <base64url_payload>.<signature_hex>
 */
export function getAuthSecret(env) {
  const secret = env?.AUTH_SECRET;
  if (!secret || typeof secret !== 'string' || secret.length < 16) {
    // Fail closed: never fall back to a guessable default secret.
    throw new Error('Server misconfigured: AUTH_SECRET is not set');
  }
  return secret;
}

export async function signAuthToken(userId, email, env) {
  const secretStr = getAuthSecret(env);
  const payload = {
    uid: userId,
    eml: email,
    iat: Math.floor(Date.now() / 1000),
    exp: Math.floor(Date.now() / 1000) + 90 * 24 * 3600, // 90 days validity
  };

  const payloadB64 = btoa(JSON.stringify(payload))
    .replace(/\+/g, '-')
    .replace(/\//g, '_')
    .replace(/=+$/, '');

  const enc = new TextEncoder();
  const key = await crypto.subtle.importKey(
    'raw',
    enc.encode(secretStr),
    { name: 'HMAC', hash: 'SHA-256' },
    false,
    ['sign']
  );

  const sigBuffer = await crypto.subtle.sign('HMAC', key, enc.encode(payloadB64));
  const sigHex = Array.from(new Uint8Array(sigBuffer))
    .map((b) => b.toString(16).padStart(2, '0'))
    .join('');

  return `${payloadB64}.${sigHex}`;
}

/**
 * Verifies an HMAC-SHA256 Session Token
 */
export async function verifyAuthToken(token, env) {
  if (!token || typeof token !== 'string') return null;
  const parts = token.split('.');
  if (parts.length !== 2) return null;

  const [payloadB64, sigHex] = parts;
  const secretStr = getAuthSecret(env);

  const enc = new TextEncoder();
  const key = await crypto.subtle.importKey(
    'raw',
    enc.encode(secretStr),
    { name: 'HMAC', hash: 'SHA-256' },
    false,
    ['verify']
  );

  const sigBytes = new Uint8Array(sigHex.match(/.{1,2}/g)?.map((b) => parseInt(b, 16)) || []);
  const isValid = await crypto.subtle.verify('HMAC', key, sigBytes, enc.encode(payloadB64));
  if (!isValid) return null;

  try {
    const rawJson = atob(payloadB64.replace(/-/g, '+').replace(/_/g, '/'));
    const payload = JSON.parse(rawJson);
    if (payload.exp && payload.exp < Math.floor(Date.now() / 1000)) {
      return null; // Expired
    }
    return payload;
  } catch {
    return null;
  }
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

/** In-memory fallback room storage if D1 is not configured in local preview */
const memoryRooms = new Map();

/** Generate 4-digit room code */
export function generateRoomCode() {
  const buf = new Uint32Array(1);
  crypto.getRandomValues(buf);
  return String(1000 + (buf[0] % 9000));
}

/** Rooms are temporary: anything not updated for this long is treated as expired and removed. */
export const ROOM_TTL_MS = 6 * 60 * 60 * 1000;

/** Get room state */
export async function getRoomState(db, code) {
  if (db) {
    await ensureOrdersTable(db);
    const row = await db.prepare('SELECT * FROM sync_rooms WHERE code = ?')
      .bind(code)
      .first();
    if (row && Date.now() - row.updated_at > ROOM_TTL_MS) {
      await db.prepare('DELETE FROM sync_rooms WHERE code = ?').bind(code).run();
      memoryRooms.delete(code);
      return null;
    }
    if (row) {
      return {
        code: row.code,
        category: row.category,
        questionText: row.question_text,
        isFlipped: Boolean(row.is_flipped),
        version: row.version,
        updatedAt: row.updated_at,
      };
    }
  }
  const mem = memoryRooms.get(code);
  if (mem && Date.now() - mem.updatedAt > ROOM_TTL_MS) {
    memoryRooms.delete(code);
    return null;
  }
  return mem || null;
}

/** Create or overwrite room state */
export async function createRoom(db, code, category, questionText) {
  const now = Date.now();
  const room = {
    code,
    category,
    questionText,
    isFlipped: false,
    version: 1,
    updatedAt: now,
  };
  if (db) {
    await ensureOrdersTable(db);
    // Opportunistic cleanup of expired rooms.
    await db.prepare('DELETE FROM sync_rooms WHERE updated_at < ?').bind(now - ROOM_TTL_MS).run();
    await db.prepare(`
      INSERT INTO sync_rooms (code, category, question_text, is_flipped, version, updated_at)
      VALUES (?, ?, ?, 0, 1, ?)
      ON CONFLICT(code) DO UPDATE SET
        category = excluded.category,
        question_text = excluded.question_text,
        is_flipped = 0,
        version = version + 1,
        updated_at = excluded.updated_at
    `)
      .bind(code, category, questionText, now)
      .run();
  }
  memoryRooms.set(code, room);
  return room;
}

/** Update room state on flip or next question */
export async function updateRoomState(db, code, updates) {
  const now = Date.now();
  if (db) {
    await ensureOrdersTable(db);
    const current = await getRoomState(db, code);
    if (!current) return null;
    const nextVersion = current.version + 1;
    const category = updates.category !== undefined ? updates.category : current.category;
    const questionText = updates.questionText !== undefined ? updates.questionText : current.questionText;
    const isFlipped = updates.isFlipped !== undefined ? (updates.isFlipped ? 1 : 0) : (current.isFlipped ? 1 : 0);

    await db.prepare(`
      UPDATE sync_rooms
      SET category = ?, question_text = ?, is_flipped = ?, version = ?, updated_at = ?
      WHERE code = ?
    `)
      .bind(category, questionText, isFlipped, nextVersion, now, code)
      .run();

    return {
      code,
      category,
      questionText,
      isFlipped: Boolean(isFlipped),
      version: nextVersion,
      updatedAt: now,
    };
  }

  const current = memoryRooms.get(code);
  if (!current) return null;
  const updated = {
    ...current,
    ...updates,
    version: current.version + 1,
    updatedAt: now,
  };
  memoryRooms.set(code, updated);
  return updated;
}
