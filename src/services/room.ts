/**
 * RoomService: Coordinates real-time partner sync sessions over HTTP polling.
 * Zero-configuration 4-digit room code for long-distance couples or dual-phone play.
 */
import { API_BASE_URL } from '../constants/api';
import { ErrorCode, errorFromResponse } from './errors';

export interface RoomState {
  code: string;
  category: string;
  questionText: string;
  /** Language-independent question id (absent on rooms created by older clients). */
  qid?: string;
  isFlipped: boolean;
  version: number;
  updatedAt: number;
}

export const RoomService = {
  /** Create a new room with current deck state */
  async createRoom(
    category: string,
    questionText: string,
    qid = ''
  ): Promise<{ success: boolean; room?: RoomState; error?: ErrorCode }> {
    try {
      const res = await fetch(`${API_BASE_URL}/api/room/create`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ category, questionText, qid }),
      });
      if (!res.ok) {
        return { success: false, error: await errorFromResponse(res, 'err_room_create') };
      }
      const data = (await res.json()) as { success: boolean; room: RoomState };
      return { success: true, room: data.room };
    } catch {
      return { success: false, error: 'err_network' };
    }
  },

  /** Join an existing room with 4-digit code */
  async joinRoom(
    code: string
  ): Promise<{ success: boolean; room?: RoomState; error?: ErrorCode }> {
    try {
      const res = await fetch(`${API_BASE_URL}/api/room/join`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ code }),
      });
      if (!res.ok) {
        return {
          success: false,
          error: res.status === 404 ? 'err_room_not_found' : await errorFromResponse(res, 'err_room_join'),
        };
      }
      const data = (await res.json()) as { success: boolean; room: RoomState };
      return { success: true, room: data.room };
    } catch {
      return { success: false, error: 'err_network' };
    }
  },

  /** Broadcast local card action to partner */
  async syncAction(
    code: string,
    updates: { category?: string; qid?: string; questionText?: string; isFlipped?: boolean }
  ): Promise<{ success: boolean; room?: RoomState }> {
    try {
      const res = await fetch(`${API_BASE_URL}/api/room/sync`, {
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
      const res = await fetch(`${API_BASE_URL}/api/room/poll?code=${encodeURIComponent(code)}&version=${currentVersion}`);
      if (!res.ok) return { updated: false };
      const data = (await res.json()) as { updated: boolean; room?: RoomState };
      return data;
    } catch {
      return { updated: false };
    }
  },
};
