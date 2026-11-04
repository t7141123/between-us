/**
 * ProgressBadge: a quiet one-line summary under the category picker:
 * how many questions of this deck you have been through, a gentle streak, and a reset link.
 */
import React, { useEffect, useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { I18nService } from '../services/i18n';
import { LocaleKey, ThemeColors } from '../types';

interface ProgressBadgeProps {
  locale: LocaleKey;
  colors: ThemeColors;
  seen: number;
  total: number;
  /** Consecutive conversation days; shown from 2 days on. */
  streak: number;
  onReset: () => void;
}

export const ProgressBadge: React.FC<ProgressBadgeProps> = ({ locale, colors, seen, total, streak, onReset }) => {
  const [confirming, setConfirming] = useState(false);

  // The confirmation expires so a stray tap later never resets anything.
  useEffect(() => {
    if (!confirming) return;
    const timer = setTimeout(() => setConfirming(false), 3000);
    return () => clearTimeout(timer);
  }, [confirming]);

  if (total <= 0) return null;
  const t = (key: string) => I18nService.t(locale, key);

  return (
    <View style={styles.row}>
      <Text style={[styles.text, { color: colors.muted }]} accessibilityLabel={`${seen} / ${total}`}>
        {t('progress_seen').replace('{seen}', String(seen)).replace('{total}', String(total))}
      </Text>
      {streak >= 2 && (
        <Text style={[styles.text, { color: colors.muted }]}>
          {'  ·  '}
          {t('progress_streak').replace('{n}', String(streak))}
        </Text>
      )}
      {seen > 0 && (
        <Pressable
          accessibilityRole="button"
          onPress={() => {
            if (confirming) {
              setConfirming(false);
              onReset();
            } else {
              setConfirming(true);
            }
          }}
          hitSlop={8}
        >
          <Text style={[styles.text, styles.action, { color: colors.clay }]}>
            {'  ·  '}
            {t(confirming ? 'progress_reset_confirm' : 'progress_reset')}
          </Text>
        </Pressable>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  row: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', flexWrap: 'wrap', paddingHorizontal: 16, paddingTop: 2 },
  text: { fontSize: 12.5, letterSpacing: 0.4 },
  action: { fontWeight: '600' },
});
