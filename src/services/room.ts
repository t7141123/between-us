/**
 * RoomService: Coordinates real-time partner sync sessions over HTTP polling.
 * Zero-configuration 4-digit room code for long-distance couples or dual-phone play.
 */
export interface RoomState {
  code: string;
  category: string;
  questionText: string;
  isFlipped: boolean;
  version: number;
  updatedAt: number;
}

export const RoomService = {
  /** Create a new room with current deck state */
  async createRoom(
    category: string,
    questionText: string
  ): Promise<{ success: boolean; room?: RoomState; error?: string }> {
    try {
      const res = await fetch('/api/room/create', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ category, questionText }),
      });
      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        return { success: false, error: (err as { error?: string }).error || '建立連線失敗' };
      }
      const data = (await res.json()) as { success: boolean; room: RoomState };
      return { success: true, room: data.room };
    } catch (err) {
      return {
        success: false,
        error: err instanceof Error ? err.message : '連線逾時，請重試',
      };
    }
  },

  /** Join an existing room with 4-digit code */
  async joinRoom(
    code: string
  ): Promise<{ success: boolean; room?: RoomState; error?: string }> {
    try {
      const res = await fetch('/api/room/join', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ code }),
      });
      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        return { success: false, error: (err as { error?: string }).error || '加入房間失敗' };
      }
      const data = (await res.json()) as { success: boolean; room: RoomState };
      return { success: true, room: data.room };
    } catch (err) {
      return {
        success: false,
        error: err instanceof Error ? err.message : '無法連線到房間',
      };
    }
  },

  /** Broadcast local card action to partner */
  async syncAction(
    code: string,
    updates: { category?: string; questionText?: string; isFlipped?: boolean }
  ): Promise<{ success: boolean; room?: RoomState }> {
    try {
      const res = await fetch('/api/room/sync', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ code, ...updates }),
      });
      if (!res.ok) return { success: false };
      const data = (await res.json()) as { success: boolean; room: RoomState };
      return { success: true, room: data.room };
    } catch {
      return { success: false };
    }
  },

  /** Poll partner's latest state */
  async pollRoom(
    code: string,
    currentVersion: number
  ): Promise<{ updated: boolean; room?: RoomState }> {
    try {
      const res = await fetch(`/api/room/poll?code=${encodeURIComponent(code)}&version=${currentVersion}`);
      if (!res.ok) return { updated: false };
      const data = (await res.json()) as { updated: boolean; room?: RoomState };
      return data;
    } catch {
      return { updated: false };
    }
  },
};
