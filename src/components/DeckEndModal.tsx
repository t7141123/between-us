/**
 * DeckEndModal: shown when the last card of a deck is reached.
 * Free categories get a friendly "round complete" screen; a locked pack's trial ends with a soft
 * invitation to unlock it. Never blocks: both actions are optional.
 */
import React from 'react';
import { Modal, Platform, Pressable, StyleSheet, Text, View } from 'react-native';
import { I18nService } from '../services/i18n';
import { LocaleKey, ThemeColors } from '../types';

interface DeckEndModalProps {
  visible: boolean;
  locale: LocaleKey;
  colors: ThemeColors;
  isDark: boolean;
  /** The deck ended on a locked pack's lock card (free trial finished). */
  isLockedPack: boolean;
  /** The deck was a Date Night session. */
  isSession?: boolean;
  onOpenSessions?: () => void;
  /** At least one expansion pack is still locked (to offer a gentle pointer). */
  hasLockedPacks: boolean;
  onPlayAgain: () => void;
  onClose: () => void;
  onOpenStore: () => void;
}

export const DeckEndModal: React.FC<DeckEndModalProps> = ({
  visible,
  locale,
  colors,
  isDark,
  isLockedPack,
  isSession = false,
  onOpenSessions,
  hasLockedPacks,
  onPlayAgain,
  onClose,
  onOpenStore,
}) => {
  const t = (key: string) => I18nService.t(locale, key);

  return (
    <Modal visible={visible} animationType="fade" transparent onRequestClose={onClose}>
      <View style={styles.overlay}>
        <Pressable style={styles.backdrop} onPress={onClose} accessibilityLabel={t('a11y_close')} />
        <View
          style={[
            styles.card,
            {
              backgroundColor: isDark ? '#1C1917' : '#FAF6F0',
              borderColor: isDark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.08)',
            },
          ]}
        >
          <Text style={styles.emoji}>{isLockedPack ? '🔒' : isSession ? '🌙' : '🎉'}</Text>
          <Text style={[styles.title, { color: colors.ink }]}>
            {t(isLockedPack ? 'deck_end_locked_title' : isSession ? 'deck_end_session_title' : 'deck_end_title')}
          </Text>
          <Text style={[styles.desc, { color: colors.muted }]}>
            {t(isLockedPack ? 'deck_end_locked_desc' : isSession ? 'deck_end_session_desc' : 'deck_end_desc')}
          </Text>

          {isLockedPack ? (
            <Pressable
              accessibilityRole="button"
              onPress={onOpenStore}
              style={[styles.primaryBtn, { backgroundColor: colors.clay }]}
            >
              <Text style={styles.primaryText}>{t('deck_end_store')}</Text>
            </Pressable>
          ) : isSession ? (
            <Pressable
              accessibilityRole="button"
              onPress={onOpenSessions}
              style={[styles.primaryBtn, { backgroundColor: colors.clay }]}
            >
              <Text style={styles.primaryText}>{t('deck_end_sessions')}</Text>
            </Pressable>
          ) : (
            <Pressable
              accessibilityRole="button"
              onPress={onPlayAgain}
              style={[styles.primaryBtn, { backgroundColor: colors.clay }]}
            >
              <Text style={styles.primaryText}>{t('deck_end_again')}</Text>
            </Pressable>
          )}

          <Pressable accessibilityRole="button" onPress={onClose} style={styles.secondaryBtn}>
            <Text style={[styles.secondaryText, { color: colors.ink }]}>{t(isSession ? 'close' : 'deck_end_close')}</Text>
          </Pressable>

          {!isLockedPack && !isSession && hasLockedPacks && (
            <Pressable accessibilityRole="link" onPress={onOpenStore} style={styles.linkBtn}>
              <Text style={[styles.linkText, { color: colors.clay }]}>{t('deck_end_explore')}</Text>
            </Pressable>
          )}
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: 24 },
  backdrop: { ...StyleSheet.absoluteFill, backgroundColor: 'rgba(0,0,0,0.6)' },
  card: {
    width: '100%',
    maxWidth: 380,
    borderRadius: 24,
    borderWidth: 1,
    padding: 28,
    alignItems: 'center',
    ...Platform.select({ web: { boxShadow: '0 20px 60px rgba(0,0,0,0.5)' } as object }),
  },
  emoji: { fontSize: 40, marginBottom: 12 },
  title: { fontSize: 20, fontWeight: '700', textAlign: 'center', marginBottom: 8 },
  desc: { fontSize: 14.5, lineHeight: 22, textAlign: 'center', marginBottom: 22 },
  primaryBtn: { width: '100%', height: 48, borderRadius: 24, alignItems: 'center', justifyContent: 'center' },
  primaryText: { color: '#FFFFFF', fontSize: 16, fontWeight: '600' },
  secondaryBtn: { paddingVertical: 14 },
  secondaryText: { fontSize: 15, fontWeight: '500' },
  linkBtn: { paddingVertical: 4 },
  linkText: { fontSize: 13.5, fontWeight: '500' },
});
