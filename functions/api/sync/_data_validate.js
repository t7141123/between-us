/**
 * Validation for cloud-backed user data. The server never interprets the content; it only makes sure
 * what is stored has the expected shape and bounded size.
 */
export const DATA_KINDS = ['favorites', 'notes', 'seen', 'custom'];
export const MAX_PAYLOAD_BYTES = 256 * 1024;

const isObject = (v) => v !== null && typeof v === 'object' && !Array.isArray(v);
const KEY_OK = (k) => typeof k === 'string' && k.length > 0 && k.length <= 64;

/** Returns the cleaned payload, or null when it is not acceptable. */
export function validateDataPayload(kind, payload) {
  switch (kind) {
    case 'favorites': {
      if (!isObject(payload)) return null;
      const keys = Object.keys(payload);
      if (keys.length > 5000 || !keys.every(KEY_OK)) return null;
      return Object.fromEntries(keys.map((k) => [k, true]));
    }
    case 'seen': {
      if (!Array.isArray(payload) || payload.length > 5000) return null;
      if (!payload.every(KEY_OK)) return null;
      return [...new Set(payload)];
    }
    case 'notes': {
      if (!isObject(payload)) return null;
      const entries = Object.entries(payload);
      if (entries.length > 5000) return null;
      const out = {};
      for (const [k, n] of entries) {
        if (!KEY_OK(k) || !isObject(n) || typeof n.text !== 'string' || !Number.isFinite(n.updatedAt)) return null;
        out[k] = { text: n.text.slice(0, 500), updatedAt: Number(n.updatedAt) };
      }
      return out;
    }
    case 'custom': {
      if (!Array.isArray(payload) || payload.length > 500) return null;
      const out = [];
      for (const q of payload) {
        if (!isObject(q) || !KEY_OK(q.id) || typeof q.text !== 'string' || !Number.isFinite(q.createdAt)) return null;
        out.push({ id: q.id, text: q.text.slice(0, 200), createdAt: Number(q.createdAt) });
      }
      return out;
    }
    default:
      return null;
  }
}
