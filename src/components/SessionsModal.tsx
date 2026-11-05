/**
 * SessionsModal: Date Night guided sessions (ten questions, light to deep).
 * One is free; the rest need Plus.
 */
import React from 'react';
import { Modal, Platform, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SESSIONS } from '../constants/sessions';
import { I18nService } from '../services/i18n';
import { LocaleKey, ThemeColors } from '../types';

interface Props {
  visible: boolean;
  locale: LocaleKey;
  colors: ThemeColors;
  isDark: boolean;
  isPlus: boolean;
  onStart: (sessionId: string) => void;
  onOpenStore: () => void;
  onClose: () => void;
}

export const SessionsModal: React.FC<Props> = ({ visible, locale, colors, isDark, isPlus, onStart, onOpenStore, onClose }) => {
  const t = (key: string) => I18nService.t(locale, key);
  const border = isDark ? 'rgba(255,255,255,0.12)' : 'rgba(0,0,0,0.12)';
  return (
    <Modal visible={visible} animationType="slide" transparent onRequestClose={onClose}>
      <View style={styles.overlay}>
        <Pressable style={styles.backdrop} onPress={onClose} accessibilityLabel={t('a11y_close')} />
        <View style={[styles.sheet, { backgroundColor: isDark ? '#1C1917' : '#FAF6F0', borderColor: border }]}>
          <Text style={[styles.title, { color: colors.ink }]}>{t('sessions_title')}</Text>
          <Text style={[styles.desc, { color: colors.muted }]}>{t('sessions_desc')}</Text>
          <ScrollView style={{ flexGrow: 0 }}>
            {SESSIONS.map((s) => {
              const locked = !s.free && !isPlus;
              return (
                <Pressable
                  key={s.id}
                  accessibilityRole="button"
                  onPress={() => (locked ? onOpenStore() : onStart(s.id))}
                  style={[styles.card, { borderColor: locked ? border : colors.clay, backgroundColor: isDark ? '#292524' : '#FFFFFF' }]}
                >
                  <View style={styles.cardHead}>
                    <Text style={[styles.cardTitle, { color: colors.ink }]}>{`${locked ? '🔒 ' : ''}${t(`session_${s.id}_title`)}`}</Text>
                    <Text style={[styles.badge, { color: colors.clay }]}>{s.free ? t('sessions_free') : 'Plus'}</Text>
                  </View>
                  <Text style={[styles.cardDesc, { color: colors.muted }]}>{t(`session_${s.id}_desc`)}</Text>
                  <Text style={[styles.meta, { color: colors.muted }]}>{t('sessions_meta').replace('{n}', String(s.steps.length))}</Text>
                </Pressable>
              );
            })}
          </ScrollView>
          <Pressable accessibilityRole="button" onPress={onClose} style={styles.closeBtn}>
            <Text style={[styles.closeText, { color: colors.muted }]}>{t('close')}</Text>
          </Pressable>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: { flex: 1, justifyContent: 'flex-end', alignItems: 'center' },
  backdrop: { ...StyleSheet.absoluteFill, backgroundColor: 'rgba(0,0,0,0.6)' },
  sheet: { width: '100%', maxWidth: 520, maxHeight: '88%', borderTopLeftRadius: 24, borderTopRightRadius: 24, borderWidth: 1, padding: 20, ...Platform.select({ web: { boxShadow: '0 -10px 40px rgba(0,0,0,0.4)' } as object }) },
  title: { fontSize: 19, fontWeight: '700', marginBottom: 4 },
  desc: { fontSize: 13, lineHeight: 19, marginBottom: 14 },
  card: { borderWidth: 1, borderRadius: 16, padding: 16, marginBottom: 10 },
  cardHead: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 },
  cardTitle: { fontSize: 16.5, fontWeight: '700', flex: 1, paddingRight: 8 },
  badge: { fontSize: 12, fontWeight: '700' },
  cardDesc: { fontSize: 13.5, lineHeight: 20 },
  meta: { fontSize: 12, marginTop: 8 },
  closeBtn: { alignItems: 'center', paddingTop: 12 },
  closeText: { fontSize: 14 },
});
