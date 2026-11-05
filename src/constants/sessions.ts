import type { SessionDef } from '../services/sessionCore';

/** Ten steps each, light to deep. Titles/descriptions live in the locale files (session_<id>_*). */
export const SESSIONS: SessionDef[] = [
  { id: 'warmup', free: true, steps: ['fun', 'fun', 'growth', 'soul', 'fun', 'vision', 'soul', 'intimacy', 'growth', 'faith'] },
  { id: 'dreams', free: false, steps: ['fun', 'vision', 'vision', 'growth', 'finance', 'vision', 'finance', 'growth', 'soul', 'vision'] },
  { id: 'closer', free: false, steps: ['fun', 'soul', 'intimacy', 'soul', 'intimacy', 'intimacy', 'soul', 'intimacy', 'faith', 'intimacy'] },
  { id: 'deep', free: false, steps: ['soul', 'soul', 'faith', 'soul', 'intimacy', 'faith', 'soul', 'faith', 'intimacy', 'soul'] },
];

export const sessionById = (id: string) => SESSIONS.find((s) => s.id === id);
