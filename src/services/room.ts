/**
 * RoomService: Coordinates real-time partner sync sessions over HTTP polling.
 * Zero-configuration 4-digit room code for long-distance couples or dual-phone play.
 */
import { API_BASE_URL } from '../constants/api';
import { ErrorCode, errorFromResponse } from './errors';
import { StorageService } from './storage';

export interface RoomState {
  code: string;
  category: string;
  questionText: string;
  /** Language-independent question id (absent on rooms created by older clients). */
  qid?: string;
  /** 'reveal' = both partners answer, answers are shown together (Plus). */
  mode?: 'sync' | 'reveal';
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
    updates: { category?: string; qid?: string; questionText?: string; isFlipped?: boolean; mode?: 'sync' | 'reveal' }
  ): Promise<{ success: boolean; room?: RoomState; plusRequired?: boolean }> {
    try {
      const user = await StorageService.getAuthUser();
      const res = await fetch(`${API_BASE_URL}/api/room/sync`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', ...(user?.token ? { Authorization: `Bearer ${user.token}` } : {}) },
        body: JSON.stringify({ code, ...updates }),
      });
      if (res.status === 403) return { success: false, plusRequired: true };
      if (!res.ok) return { success: false };
      const data = (await res.json()) as { success: boolean; room: RoomState };
      return { success: true, room: data.room };
    } catch {
      return { success: false };
    }
  },

  /** Sends this phone's answer for a question (room must be in 'reveal' mode). */
  async submitAnswer(
    code: string,
    qid: string,
    clientId: string,
    text: string
  ): Promise<{ success: boolean; error?: ErrorCode }> {
    try {
      const res = await fetch(`${API_BASE_URL}/api/room/answer`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ code, qid, clientId, text }),
      });
      if (res.ok) return { success: true };
      const body = (await res.json().catch(() => ({}))) as { code?: string };
      return { success: false, error: body.code === 'room_full' ? 'err_room_full' : 'err_generic' };
    } catch {
      return { success: false, error: 'err_network' };
    }
  },

  /** Own answer, whether the partner answered, and the partner's text once both have answered. */
  async getAnswers(
    code: string,
    qid: string,
    clientId: string
  ): Promise<{ mine: string | null; partnerSubmitted: boolean; partner: string | null } | null> {
    try {
      const qs = new URLSearchParams({ code, qid, clientId });
      const res = await fetch(`${API_BASE_URL}/api/room/answers?${qs.toString()}`);
      if (!res.ok) return null;
      return (await res.json()) as { mine: string | null; partnerSubmitted: boolean; partner: string | null };
    } catch {
      return null;
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
