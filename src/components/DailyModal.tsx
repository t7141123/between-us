/**
 * DailyModal: today's question, a shortcut to talk about it, and the optional local reminder.
 */
import React from 'react';
import { Modal, Platform, Pressable, StyleSheet, Switch, Text, View } from 'react-native';
import { I18nService } from '../services/i18n';
import { REMINDER_HOURS, ReminderSettings } from '../services/dailyCore';
import { LocaleKey, ThemeColors } from '../types';

interface DailyModalProps {
  visible: boolean;
  locale: LocaleKey;
  colors: ThemeColors;
  isDark: boolean;
  questionText: string;
  categoryLabel: string;
  reminder: ReminderSettings;
  reminderSupported: boolean;
  permissionDenied: boolean;
  onTalk: () => void;
  onChangeReminder: (next: ReminderSettings) => void;
  onClose: () => void;
}

export const DailyModal: React.FC<DailyModalProps> = ({
  visible, locale, colors, isDark, questionText, categoryLabel, reminder,
  reminderSupported, permissionDenied, onTalk, onChangeReminder, onClose,
}) => {
  const t = (key: string) => I18nService.t(locale, key);
  return (
    <Modal visible={visible} animationType="fade" transparent onRequestClose={onClose}>
      <View style={styles.overlay}>
        <Pressable style={styles.backdrop} onPress={onClose} accessibilityLabel={t('a11y_close')} />
        <View style={[styles.card, { backgroundColor: isDark ? '#1C1917' : '#FAF6F0', borderColor: isDark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.08)' }]}>
          <Text style={[styles.kicker, { color: colors.clay }]}>{t('daily_title')}</Text>
          <Text style={[styles.category, { color: colors.muted }]}>{categoryLabel}</Text>
          <Text style={[styles.question, { color: colors.ink }]}>{questionText}</Text>

          <Pressable accessibilityRole="button" onPress={onTalk} style={[styles.primaryBtn, { backgroundColor: colors.clay }]}>
            <Text style={styles.primaryText}>{t('daily_talk')}</Text>
          </Pressable>

          {reminderSupported && (
            <View style={[styles.reminder, { borderTopColor: colors.line }]}>
              <View style={styles.reminderRow}>
                <View style={{ flex: 1, paddingRight: 12 }}>
                  <Text style={[styles.reminderTitle, { color: colors.ink }]}>{t('daily_reminder')}</Text>
                  <Text style={[styles.reminderDesc, { color: colors.muted }]}>{t('daily_reminder_desc')}</Text>
                </View>
                <Switch
                  value={reminder.enabled}
                  onValueChange={(enabled) => onChangeReminder({ ...reminder, enabled })}
                  accessibilityLabel={t('daily_reminder')}
                />
              </View>
              {reminder.enabled && (
                <View style={styles.hours}>
                  {REMINDER_HOURS.map((h) => {
                    const active = reminder.hour === h;
                    return (
                      <Pressable
                        key={h}
                        accessibilityRole="button"
                        accessibilityState={{ selected: active }}
                        onPress={() => onChangeReminder({ ...reminder, hour: h, minute: 0 })}
                        style={[styles.hourChip, { borderColor: active ? colors.clay : colors.line, backgroundColor: active ? colors.clay : 'transparent' }]}
                      >
                        <Text style={{ color: active ? '#FFFFFF' : colors.ink, fontWeight: '600' }}>{`${h}:00`}</Text>
                      </Pressable>
                    );
                  })}
                </View>
              )}
              {permissionDenied && (
                <Text style={[styles.reminderDesc, { color: colors.clay, marginTop: 8 }]}>{t('daily_permission_denied')}</Text>
              )}
            </View>
          )}

          <Pressable accessibilityRole="button" onPress={onClose} style={styles.closeBtn}>
            <Text style={[styles.closeText, { color: colors.muted }]}>{t('close')}</Text>
          </Pressable>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: 24 },
  backdrop: { ...StyleSheet.absoluteFill, backgroundColor: 'rgba(0,0,0,0.6)' },
  card: { width: '100%', maxWidth: 400, borderRadius: 24, borderWidth: 1, padding: 26, ...Platform.select({ web: { boxShadow: '0 20px 60px rgba(0,0,0,0.5)' } as object }) },
  kicker: { fontSize: 13, fontWeight: '700', letterSpacing: 1.5, textAlign: 'center' },
  category: { fontSize: 12.5, textAlign: 'center', marginTop: 6 },
  question: { fontSize: 19, lineHeight: 29, textAlign: 'center', marginVertical: 20, fontWeight: '500' },
  primaryBtn: { height: 48, borderRadius: 24, alignItems: 'center', justifyContent: 'center' },
  primaryText: { color: '#FFFFFF', fontSize: 16, fontWeight: '600' },
  reminder: { marginTop: 22, paddingTop: 18, borderTopWidth: 1 },
  reminderRow: { flexDirection: 'row', alignItems: 'center' },
  reminderTitle: { fontSize: 15, fontWeight: '600' },
  reminderDesc: { fontSize: 12.5, lineHeight: 18, marginTop: 2 },
  hours: { flexDirection: 'row', gap: 10, marginTop: 12 },
  hourChip: { paddingHorizontal: 16, paddingVertical: 8, borderRadius: 999, borderWidth: 1 },
  closeBtn: { alignItems: 'center', paddingTop: 16 },
  closeText: { fontSize: 14 },
});
