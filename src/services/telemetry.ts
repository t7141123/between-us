/**
 * TelemetryService: Anonymous, privacy-respecting telemetry for app optimization.
 * Tracks feature adoption, platform distribution, and session activity.
 */
import { Platform } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { CategoryFilter, LocaleKey } from '../types';

const SESSION_KEY = '@between_us_session_id';
const SESSION_TIMESTAMP_KEY = '@between_us_session_ts';
const SESSION_TIMEOUT_MS = 30 * 60 * 1000; // 30 minutes

// Primary and fallback endpoints
const PRIMARY_ENDPOINT = 'https://between-us.ark-studio.app/api/track';
const FALLBACK_ENDPOINT = 'https://love-between-us.pages.dev/api/track';

interface EventPayload {
  eventName: string;
  category?: CategoryFilter | string;
  language?: LocaleKey;
  platform?: string;
}

export class TelemetryService {
  private static cachedSessionId: string | null = null;

  /**
   * Generates or retrieves an existing anonymous session ID.
   */
  private static async getSessionId(): Promise<string> {
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

      // Generate random session id
      const newSession = 's_' + Math.random().toString(36).substring(2, 12) + '_' + Date.now().toString(36);
      this.cachedSessionId = newSession;
      await AsyncStorage.setItem(SESSION_KEY, newSession);
      await AsyncStorage.setItem(SESSION_TIMESTAMP_KEY, String(now));
      return newSession;
    } catch {
      return 's_fallback_' + Math.random().toString(36).substring(2, 10);
    }
  }

  /**
   * Tracks an event asynchronously without blocking UI interactions.
   */
  public static track(payload: EventPayload): void {
    // Run in background
    setTimeout(async () => {
      try {
        const sessionId = await this.getSessionId();
        const platform = Platform.OS === 'web' ? 'web' : Platform.OS === 'ios' ? 'iOS (App)' : 'Android (App)';

        const body = JSON.stringify({
          sessionId,
          eventName: payload.eventName,
          category: payload.category || null,
          language: payload.language || null,
          platform: payload.platform || platform,
        });

        // Determine target URL
        let url = PRIMARY_ENDPOINT;
        if (Platform.OS === 'web' && typeof window !== 'undefined') {
          // In browser, use relative path if on same domain
          url = '/api/track';
        }

        try {
          const res = await fetch(url, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body,
          });
          if (!res.ok && url !== FALLBACK_ENDPOINT) {
            // Try fallback
            await fetch(FALLBACK_ENDPOINT, {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body,
            });
          }
        } catch {
          // If relative failed, try fallback
          if (url !== FALLBACK_ENDPOINT) {
            await fetch(FALLBACK_ENDPOINT, {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body,
            }).catch(() => {});
          }
        }
      } catch {
        // Silently ignore telemetry transmission errors
      }
    }, 0);
  }
}
