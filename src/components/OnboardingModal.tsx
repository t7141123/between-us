/**
 * OnboardingModal: three short first-run screens (how to play, how the card works, privacy).
 * Can be reopened from the menu. Always skippable.
 */
import React, { useState } from 'react';
import { Modal, Platform, Pressable, StyleSheet, Text, View } from 'react-native';
import { I18nService } from '../services/i18n';
import { LocaleKey, ThemeColors } from '../types';

interface OnboardingModalProps {
  visible: boolean;
  locale: LocaleKey;
  colors: ThemeColors;
  isDark: boolean;
  onClose: () => void;
}

const PAGES = [
  { emoji: '💬', title: 'onb_1_title', desc: 'onb_1_desc' },
  { emoji: '🃏', title: 'onb_2_title', desc: 'onb_2_desc' },
  { emoji: '🔒', title: 'onb_3_title', desc: 'onb_3_desc' },
] as const;

export const OnboardingModal: React.FC<OnboardingModalProps> = ({ visible, locale, colors, isDark, onClose }) => {
  const [page, setPage] = useState(0);
  const close = () => {
    setPage(0); // so a later reopen starts from the first screen
    onClose();
  };

  const t = (key: string) => I18nService.t(locale, key);
  const current = PAGES[page];
  const isLast = page === PAGES.length - 1;

  return (
    <Modal visible={visible} animationType="fade" transparent onRequestClose={close}>
      <View style={styles.overlay}>
        <View
          style={[
            styles.card,
            {
              backgroundColor: isDark ? '#1C1917' : '#FAF6F0',
              borderColor: isDark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.08)',
            },
          ]}
        >
          <Text style={styles.emoji}>{current.emoji}</Text>
          <Text style={[styles.title, { color: colors.ink }]}>{t(current.title)}</Text>
          <Text style={[styles.desc, { color: colors.muted }]}>{t(current.desc)}</Text>

          <View style={styles.dots} accessibilityElementsHidden>
            {PAGES.map((_, i) => (
              <View
                key={i}
                style={[styles.dot, { backgroundColor: i === page ? colors.clay : colors.line }]}
              />
            ))}
          </View>

          <Pressable
            accessibilityRole="button"
            onPress={() => (isLast ? close() : setPage(page + 1))}
            style={[styles.primaryBtn, { backgroundColor: colors.clay }]}
          >
            <Text style={styles.primaryText}>{t(isLast ? 'onb_start' : 'onb_next')}</Text>
          </Pressable>

          {!isLast && (
            <Pressable accessibilityRole="button" onPress={close} style={styles.skipBtn}>
              <Text style={[styles.skipText, { color: colors.muted }]}>{t('onb_skip')}</Text>
            </Pressable>
          )}
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: 24, backgroundColor: 'rgba(0,0,0,0.6)' },
  card: {
    width: '100%',
    maxWidth: 380,
    borderRadius: 24,
    borderWidth: 1,
    padding: 28,
    alignItems: 'center',
    ...Platform.select({ web: { boxShadow: '0 20px 60px rgba(0,0,0,0.5)' } as object }),
  },
  emoji: { fontSize: 46, marginBottom: 14 },
  title: { fontSize: 21, fontWeight: '700', textAlign: 'center', marginBottom: 10 },
  desc: { fontSize: 15, lineHeight: 23, textAlign: 'center', marginBottom: 22, minHeight: 92 },
  dots: { flexDirection: 'row', gap: 8, marginBottom: 22 },
  dot: { width: 8, height: 8, borderRadius: 4 },
  primaryBtn: { width: '100%', height: 48, borderRadius: 24, alignItems: 'center', justifyContent: 'center' },
  primaryText: { color: '#FFFFFF', fontSize: 16, fontWeight: '600' },
  skipBtn: { paddingVertical: 14 },
  skipText: { fontSize: 14 },
});
