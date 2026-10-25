/**
 * TelemetryService: Privacy-first usage and session analytics.
 * Tracks distinct visitors, device platforms, and active session duration.
 * Does not track individual card flips or private dialogue content.
 */
import { Platform } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';

const USER_KEY = '@between_us_user_id';
const SESSION_KEY = '@between_us_session_id';
const SESSION_TIMESTAMP_KEY = '@between_us_session_ts';
const SESSION_TIMEOUT_MS = 30 * 60 * 1000; // 30 minutes inactivity timeout

const PRIMARY_ENDPOINT = 'https://between-us.ark-studio.app/api/track';
const FALLBACK_ENDPOINT = 'https://between-us.ark-studio.app/api/track';

export class TelemetryService {
  private static cachedUserId: string | null = null;
  private static cachedSessionId: string | null = null;
  private static sessionStartTime = Date.now();
  private static heartbeatInterval: ReturnType<typeof setInterval> | null = null;
  private static isInitialized = false;

  /**
   * Retrieves or creates a permanent anonymous visitor ID.
   */
  public static async getUserId(): Promise<string> {
    if (this.cachedUserId) return this.cachedUserId;
    try {
      const savedUser = await AsyncStorage.getItem(USER_KEY);
      if (savedUser) {
        this.cachedUserId = savedUser;
        return savedUser;
      }
      const newUser = 'u_' + Math.random().toString(36).substring(2, 10) + Date.now().toString(36).slice(-4);
      this.cachedUserId = newUser;
      await AsyncStorage.setItem(USER_KEY, newUser);
      return newUser;
    } catch {
      return 'u_' + Math.random().toString(36).substring(2, 10);
    }
  }

  /**
   * Retrieves or rotates the current visit session ID.
   */
  public static async getSessionId(): Promise<string> {
    if (this.cachedSessionId) return this.cachedSessionId;

    try {
      const now = Date.now();
      const lastTs = await AsyncStorage.getItem(SESSION_TIMESTAMP_KEY);
      const savedSession = await AsyncStorage.getItem(SESSION_KEY);

      if (savedSession && lastTs && now - Number(lastTs) < SESSION_TIMEOUT_MS) {
        this.cachedSessionId = savedSession;
        await AsyncStorage.setItem(SESSION_TIMESTAMP_KEY, String(now));
        return savedSession;
      }

      const newSession = 's_' + Math.random().toString(36).substring(2, 10) + '_' + Date.now().toString(36);
      this.cachedSessionId = newSession;
      this.sessionStartTime = now;
      await AsyncStorage.setItem(SESSION_KEY, newSession);
      await AsyncStorage.setItem(SESSION_TIMESTAMP_KEY, String(now));
      return newSession;
    } catch {
      return 's_' + Math.random().toString(36).substring(2, 10);
    }
  }

  /**
   * Dispatches a session telemetry payload to the server.
   */
  private static async sendPing(eventName: 'session_start' | 'session_ping'): Promise<void> {
    try {
      const userId = await this.getUserId();
      const sessionId = await this.getSessionId();
      const duration = Math.max(0, Math.round((Date.now() - this.sessionStartTime) / 1000));
      const platform = Platform.OS === 'web' ? 'web' : Platform.OS === 'ios' ? 'iOS (App)' : 'Android (App)';

      const body = JSON.stringify({
        userId,
        sessionId,
        eventName,
        duration,
        platform,
      });

      let url = PRIMARY_ENDPOINT;
      if (Platform.OS === 'web' && typeof window !== 'undefined') {
        url = '/api/track';
      }

      // Keepalive ensures the request succeeds even when unloading or closing tabs on web
      const isWeb = Platform.OS === 'web' && typeof window !== 'undefined';
      const fetchOptions: RequestInit = {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body,
        ...(isWeb ? { keepalive: true } : {}),
      };

      try {
        const res = await fetch(url, fetchOptions);
        if (!res.ok && url !== FALLBACK_ENDPOINT) {
          await fetch(FALLBACK_ENDPOINT, fetchOptions).catch(() => {});
        }
      } catch {
        if (url !== FALLBACK_ENDPOINT) {
          await fetch(FALLBACK_ENDPOINT, fetchOptions).catch(() => {});
        }
      }
    } catch {
      // Silently ignore telemetry transmission failures
    }
  }

  /**
   * Initializes session tracking and heartbeat timer.
   */
  public static initSession(): void {
    if (this.isInitialized) return;
    this.isInitialized = true;
    this.sessionStartTime = Date.now();

    // Send initial session start
    this.sendPing('session_start');

    // Send heartbeat every 30 seconds to track active usage duration
    if (!this.heartbeatInterval) {
      this.heartbeatInterval = setInterval(() => {
        if (Platform.OS === 'web' && typeof document !== 'undefined' && document.hidden) {
          return; // Pause ping when tab is backgrounded
        }
        this.sendPing('session_ping');
      }, 30000);
    }

    // Capture exit on web
    if (Platform.OS === 'web' && typeof window !== 'undefined') {
      window.addEventListener('beforeunload', () => {
        this.sendPing('session_ping');
      });
      document.addEventListener('visibilitychange', () => {
        if (document.visibilityState === 'hidden') {
          this.sendPing('session_ping');
        }
      });
    }
  }
}
