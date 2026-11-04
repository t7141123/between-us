/**
 * Local daily reminder (iOS/Android). Scheduled entirely on the device: no server, no push token,
 * nothing is sent anywhere. Each of the next few days gets its own notification carrying that day's
 * question; the schedule is refreshed whenever the app opens.
 */
import { Platform } from 'react-native';
import { dayKey } from './progressCore';
import {
  dailyQid,
  REMINDER_DAYS_AHEAD,
  ReminderSettings,
  upcomingTriggerDates,
} from './dailyCore';
import { I18nService } from './i18n';
import type { LocaleKey } from '../types';

type NotificationsModule = typeof import('expo-notifications');

let handlerSet = false;

async function load(): Promise<NotificationsModule | null> {
  if (Platform.OS === 'web') return null;
  const Notifications = await import('expo-notifications');
  if (!handlerSet) {
    Notifications.setNotificationHandler({
      handleNotification: async () => ({
        shouldShowBanner: true,
        shouldShowList: true,
        shouldPlaySound: false,
        shouldSetBadge: false,
      }),
    });
    handlerSet = true;
  }
  return Notifications;
}

export const ReminderService = {
  isSupported(): boolean {
    return Platform.OS !== 'web';
  },

  /** Asks for permission (only call after the user turned the reminder on). */
  async requestPermission(): Promise<boolean> {
    const N = await load();
    if (!N) return false;
    const current = await N.getPermissionsAsync();
    if (current.granted) return true;
    if (!current.canAskAgain) return false;
    return (await N.requestPermissionsAsync()).granted;
  },

  async hasPermission(): Promise<boolean> {
    const N = await load();
    return N ? (await N.getPermissionsAsync()).granted : false;
  },

  /**
   * Replaces all scheduled reminders to match `settings`. `questionFor(day)` returns the text of
   * that day's question for the current language.
   */
  async sync(settings: ReminderSettings, locale: LocaleKey, pool: readonly string[], textOf: (qid: string) => string | undefined): Promise<void> {
    const N = await load();
    if (!N) return;
    await N.cancelAllScheduledNotificationsAsync();
    if (!settings.enabled || !(await N.getPermissionsAsync()).granted) return;

    const title = I18nService.t(locale, 'daily_notif_title');
    for (const date of upcomingTriggerDates(new Date(), settings.hour, settings.minute, REMINDER_DAYS_AHEAD)) {
      const qid = dailyQid(dayKey(date), pool);
      const body = (qid && textOf(qid)) || I18nService.t(locale, 'daily_notif_fallback');
      await N.scheduleNotificationAsync({
        content: { title, body },
        trigger: { type: N.SchedulableTriggerInputTypes.DATE, date },
      });
    }
  },
};
