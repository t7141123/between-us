/**
 * RevealModal: "answer together". Each partner writes an answer to the current question; the two
 * answers are shown only after BOTH have been sent, so nobody is influenced by the other.
 */
import React, { useCallback, useEffect, useState } from 'react';
import { KeyboardAvoidingView, Modal, Platform, Pressable, ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';
import { I18nService } from '../services/i18n';
import { RoomService } from '../services/room';
import { LocaleKey, ThemeColors } from '../types';

interface Props {
  visible: boolean;
  locale: LocaleKey;
  colors: ThemeColors;
  isDark: boolean;
  roomCode: string;
  clientId: string;
  qid: string;
  questionText: string;
  onClose: () => void;
}

interface Status {
  mine: string | null;
  partnerSubmitted: boolean;
  partner: string | null;
}

const POLL_MS = 2500;

const Sheet: React.FC<Props> = ({ locale, colors, isDark, roomCode, clientId, qid, questionText, onClose }) => {
  const t = (key: string) => I18nService.t(locale, key);
  const [draft, setDraft] = useState('');
  const [status, setStatus] = useState<Status | null>(null);
  const [editing, setEditing] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const border = isDark ? 'rgba(255,255,255,0.12)' : 'rgba(0,0,0,0.12)';

  const refresh = useCallback(async () => {
    const next = await RoomService.getAnswers(roomCode, qid, clientId);
    if (next) setStatus(next);
  }, [roomCode, qid, clientId]);

  useEffect(() => {
    const first = setTimeout(() => void refresh(), 0); // fetched from a callback, not during the effect itself
    const timer = setInterval(() => void refresh(), POLL_MS);
    return () => {
      clearTimeout(first);
      clearInterval(timer);
    };
  }, [refresh]);

  const submit = async () => {
    if (draft.trim() === '' || busy) return;
    setBusy(true);
    setError(null);
    const res = await RoomService.submitAnswer(roomCode, qid, clientId, draft);
    if (res.success) {
      setEditing(false);
      await refresh();
    } else {
      setError(t(res.error ?? 'err_generic'));
    }
    setBusy(false);
  };

  const answered = status?.mine != null;
  const bothDone = answered && status?.partner != null;
  const showEditor = !answered || editing;

  return (
    <KeyboardAvoidingView style={styles.overlay} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
      <Pressable style={styles.backdrop} onPress={onClose} accessibilityLabel={t('a11y_close')} />
      <View style={[styles.sheet, { backgroundColor: isDark ? '#1C1917' : '#FAF6F0', borderColor: border }]}>
        <Text style={[styles.kicker, { color: colors.clay }]}>{t(bothDone ? 'reveal_both_title' : 'reveal_title')}</Text>
        <Text style={[styles.question, { color: colors.ink }]}>{questionText}</Text>

        <ScrollView keyboardShouldPersistTaps="handled" style={{ flexGrow: 0 }}>
          {bothDone && !editing && (
            <View style={{ gap: 10 }}>
              <View style={[styles.answerBox, { borderColor: colors.clay, backgroundColor: isDark ? '#292524' : '#FFFFFF' }]}>
                <Text style={[styles.who, { color: colors.clay }]}>{t('reveal_you')}</Text>
                <Text style={[styles.answerText, { color: colors.ink }]}>{status?.mine}</Text>
              </View>
              <View style={[styles.answerBox, { borderColor: border, backgroundColor: isDark ? '#292524' : '#FFFFFF' }]}>
                <Text style={[styles.who, { color: colors.muted }]}>{t('reveal_partner')}</Text>
                <Text style={[styles.answerText, { color: colors.ink }]}>{status?.partner}</Text>
              </View>
            </View>
          )}

          {answered && !bothDone && !editing && (
            <View style={[styles.answerBox, { borderColor: colors.clay, backgroundColor: isDark ? '#292524' : '#FFFFFF' }]}>
              <Text style={[styles.who, { color: colors.clay }]}>{t('reveal_you')}</Text>
              <Text style={[styles.answerText, { color: colors.ink }]}>{status?.mine}</Text>
              <Text style={[styles.waiting, { color: colors.muted }]}>{t('reveal_waiting')}</Text>
            </View>
          )}

          {showEditor && (
            <View>
              {status?.partnerSubmitted && !answered && (
                <Text style={[styles.waiting, { color: colors.clay, marginBottom: 8 }]}>{t('reveal_partner_done')}</Text>
              )}
              <TextInput
                value={draft}
                onChangeText={setDraft}
                placeholder={t('reveal_placeholder')}
                placeholderTextColor={colors.muted}
                multiline
                maxLength={500}
                style={[styles.input, { color: colors.ink, borderColor: border, backgroundColor: isDark ? '#292524' : '#FFFFFF' }]}
                accessibilityLabel={t('reveal_placeholder')}
              />
              {error && <Text style={[styles.waiting, { color: colors.clay }]}>{error}</Text>}
              <Pressable accessibilityRole="button" onPress={submit} disabled={busy || draft.trim() === ''} style={[styles.primaryBtn, { backgroundColor: colors.clay, opacity: busy || draft.trim() === '' ? 0.5 : 1 }]}>
                <Text style={styles.primaryText}>{t('reveal_submit')}</Text>
              </Pressable>
            </View>
          )}
        </ScrollView>

        {answered && !editing && !bothDone && (
          <Pressable accessibilityRole="button" onPress={() => { setDraft(status?.mine ?? ''); setEditing(true); }} style={styles.linkBtn}>
            <Text style={[styles.linkText, { color: colors.clay }]}>{t('reveal_edit')}</Text>
          </Pressable>
        )}
        <Pressable accessibilityRole="button" onPress={onClose} style={styles.closeBtn}>
          <Text style={[styles.closeText, { color: colors.muted }]}>{t('close')}</Text>
        </Pressable>
      </View>
    </KeyboardAvoidingView>
  );
};

export const RevealModal: React.FC<Props> = (props) => (
  <Modal visible={props.visible} animationType="slide" transparent onRequestClose={props.onClose}>
    {/* keyed by question so a new question starts clean */}
    <Sheet key={`${props.roomCode}:${props.qid}`} {...props} />
  </Modal>
);

const styles = StyleSheet.create({
  overlay: { flex: 1, justifyContent: 'flex-end', alignItems: 'center' },
  backdrop: { ...StyleSheet.absoluteFill, backgroundColor: 'rgba(0,0,0,0.6)' },
  sheet: { width: '100%', maxWidth: 520, maxHeight: '88%', borderTopLeftRadius: 24, borderTopRightRadius: 24, borderWidth: 1, padding: 20 },
  kicker: { fontSize: 13, fontWeight: '700', letterSpacing: 1.2, textAlign: 'center' },
  question: { fontSize: 17, lineHeight: 26, textAlign: 'center', marginVertical: 14, fontWeight: '500' },
  input: { minHeight: 110, borderWidth: 1, borderRadius: 14, padding: 14, fontSize: 15.5, lineHeight: 23, textAlignVertical: 'top', marginBottom: 10 },
  primaryBtn: { height: 48, borderRadius: 24, alignItems: 'center', justifyContent: 'center' },
  primaryText: { color: '#FFFFFF', fontSize: 16, fontWeight: '600' },
  answerBox: { borderWidth: 1, borderRadius: 16, padding: 14 },
  who: { fontSize: 12, fontWeight: '700', marginBottom: 6, letterSpacing: 0.6 },
  answerText: { fontSize: 15.5, lineHeight: 23 },
  waiting: { fontSize: 13, lineHeight: 19, marginTop: 8 },
  linkBtn: { alignItems: 'center', paddingTop: 10 },
  linkText: { fontSize: 13.5, fontWeight: '600' },
  closeBtn: { alignItems: 'center', paddingTop: 12 },
  closeText: { fontSize: 14 },
});
