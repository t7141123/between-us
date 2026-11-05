/** Timer rules (pure). The 5-minute timer is free; other lengths and turn-taking are Plus. */
export const DURATION_OPTIONS = [180, 300, 600, 900] as const;
export const FREE_DURATION = 300;

export type Turn = 1 | 2;

/** Free users always get the standard length; Plus may pick any option. */
export function allowedDuration(requested: number, isPlus: boolean): number {
  if (!isPlus) return FREE_DURATION;
  return (DURATION_OPTIONS as readonly number[]).includes(requested) ? requested : FREE_DURATION;
}

/**
 * What happens when the clock reaches zero. In turn-taking mode the first speaker's time is followed by
 * the second speaker's; after both have spoken the session is done.
 */
export function afterCompletion(turnMode: boolean, turn: Turn): { nextTurn: Turn; sessionDone: boolean } {
  if (!turnMode) return { nextTurn: 1, sessionDone: true };
  if (turn === 1) return { nextTurn: 2, sessionDone: false };
  return { nextTurn: 1, sessionDone: true };
}
