/**
 * Date Night sessions: a short guided sequence that moves from light to deep by walking through
 * categories in a fixed order. Which question is picked from each category depends only on the
 * date and the session id, so both partners' phones build the same session. Pure logic.
 */
export interface SessionDef {
  id: string;
  /** Category of each step, in order. */
  steps: readonly string[];
  /** Free users can play exactly the sessions marked free. */
  free: boolean;
}

export const SESSION_PREFIX = 'session_';

export function sessionIdOfCategory(category: string): string | null {
  return category.startsWith(SESSION_PREFIX) ? category.slice(SESSION_PREFIX.length) : null;
}

function hash(input: string): number {
  let h = 0x811c9dc5;
  for (let i = 0; i < input.length; i++) {
    h ^= input.charCodeAt(i);
    h = Math.imul(h, 0x01000193) >>> 0;
  }
  return h >>> 0;
}

/**
 * Picks one question per step. `poolByCategory` lists the qids of each category in canonical order.
 * A question is never used twice in a session, even if a category appears several times.
 */
export function pickSessionQids(
  def: SessionDef,
  poolByCategory: Readonly<Record<string, readonly string[]>>,
  day: string
): string[] {
  const used = new Set<string>();
  const out: string[] = [];
  def.steps.forEach((category, step) => {
    const pool = poolByCategory[category] ?? [];
    if (pool.length === 0) return;
    let idx = hash(`between-us:${day}:${def.id}:${step}`) % pool.length;
    for (let tries = 0; tries < pool.length && used.has(pool[idx]); tries++) idx = (idx + 1) % pool.length;
    const qid = pool[idx];
    if (!used.has(qid)) {
      used.add(qid);
      out.push(qid);
    }
  });
  return out;
}
