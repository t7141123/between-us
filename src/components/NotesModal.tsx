/**
 * NotesModal: write a short note about the current question, or browse earlier notes.
 * Free users see their most recent notes; older ones are kept and unlocked with Plus.
 */
import React, { useMemo, useState } from 'react';
import {
  KeyboardAvoidingView,
  Modal,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { FREE_NOTE_LIMIT, canUse } from '../constants/entitlements';
import { I18nService } from '../services/i18n';
import { listNotes, NOTE_MAX_LENGTH, NoteMap, visibleNotes } from '../services/notesCore';
import { LocaleKey, ThemeColors } from '../types';

interface NotesModalProps {
  visible: boolean;
  locale: LocaleKey;
  colors: ThemeColors;
  isDark: boolean;
  isPlus: boolean;
  /** The question being written about (null when only browsing). */
  currentQid: string | null;
  currentQuestionText: string;
  notes: NoteMap;
  /** Resolves a stored qid to the question text in the current language. */
  textOf: (qid: string) => string | undefined;
  onSave: (qid: string, text: string) => void;
  onOpenQuestion: (qid: string) => void;
  onOpenStore: () => void;
  onClose: () => void;
}

const NotesSheet: React.FC<NotesModalProps> = ({
  visible: _visible, locale, colors, isDark, isPlus, currentQid, currentQuestionText, notes,
  textOf, onSave, onOpenQuestion, onOpenStore, onClose,
}) => {
  const t = (key: string) => I18nService.t(locale, key);
  const [tab, setTab] = useState<'write' | 'all'>(currentQid ? 'write' : 'all');
  const [draft, setDraft] = useState(() => (currentQid ? notes[currentQid]?.text ?? '' : ''));

  // The sheet is mounted only while the modal is open, so these start fresh on every open.
  const { visible: shown, hiddenCount } = useMemo(
    () => visibleNotes(listNotes(notes), canUse('full_note_history', { isPlus }), FREE_NOTE_LIMIT),
    [notes, isPlus]
  );
  const total = Object.keys(notes).length;
  const border = isDark ? 'rgba(255,255,255,0.12)' : 'rgba(0,0,0,0.12)';

  const handleSave = () => {
    if (currentQid) onSave(currentQid, draft);
    onClose();
  };

  return (
    <KeyboardAvoidingView style={styles.overlay} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
      <>
        <Pressable style={styles.backdrop} onPress={onClose} accessibilityLabel={t('a11y_close')} />
        <View style={[styles.sheet, { backgroundColor: isDark ? '#1C1917' : '#FAF6F0', borderColor: border }]}>
          <View style={styles.tabs}>
            {currentQid && (
              <Pressable accessibilityRole="tab" accessibilityState={{ selected: tab === 'write' }} onPress={() => setTab('write')}
                style={[styles.tab, tab === 'write' && { borderBottomColor: colors.clay }]}>
                <Text style={[styles.tabText, { color: tab === 'write' ? colors.ink : colors.muted }]}>{t('notes_tab_write')}</Text>
              </Pressable>
            )}
            <Pressable accessibilityRole="tab" accessibilityState={{ selected: tab === 'all' }} onPress={() => setTab('all')}
              style={[styles.tab, tab === 'all' && { borderBottomColor: colors.clay }]}>
              <Text style={[styles.tabText, { color: tab === 'all' ? colors.ink : colors.muted }]}>
                {`${t('notes_tab_all')} (${total})`}
              </Text>
            </Pressable>
          </View>

          {tab === 'write' && currentQid ? (
            <View style={styles.body}>
              <Text style={[styles.question, { color: colors.muted }]} numberOfLines={3}>{currentQuestionText}</Text>
              <TextInput
                value={draft}
                onChangeText={setDraft}
                placeholder={t('notes_placeholder')}
                placeholderTextColor={colors.muted}
                multiline
                maxLength={NOTE_MAX_LENGTH}
                style={[styles.input, { color: colors.ink, borderColor: border, backgroundColor: isDark ? '#292524' : '#FFFFFF' }]}
                accessibilityLabel={t('notes_placeholder')}
              />
              <Text style={[styles.counter, { color: colors.muted }]}>{`${draft.length} / ${NOTE_MAX_LENGTH}`}</Text>
              <Pressable accessibilityRole="button" onPress={handleSave} style={[styles.primaryBtn, { backgroundColor: colors.clay }]}>
                <Text style={styles.primaryText}>{t('notes_save')}</Text>
              </Pressable>
            </View>
          ) : (
            <ScrollView style={styles.list} contentContainerStyle={{ paddingBottom: 8 }}>
              {shown.length === 0 && <Text style={[styles.empty, { color: colors.muted }]}>{t('notes_empty')}</Text>}
              {shown.map((n) => (
                <Pressable key={n.qid} accessibilityRole="button" onPress={() => { onClose(); onOpenQuestion(n.qid); }}
                  style={[styles.item, { borderColor: border, backgroundColor: isDark ? '#292524' : '#FFFFFF' }]}>
                  <Text style={[styles.itemQ, { color: colors.muted }]} numberOfLines={2}>{textOf(n.qid) ?? n.qid}</Text>
                  <Text style={[styles.itemNote, { color: colors.ink }]}>{n.text}</Text>
                </Pressable>
              ))}
              {hiddenCount > 0 && (
                <Pressable accessibilityRole="button" onPress={() => { onClose(); onOpenStore(); }} style={[styles.locked, { borderColor: colors.clay }]}>
                  <Text style={[styles.lockedText, { color: colors.clay }]}>
                    {t('notes_hidden').replace('{n}', String(hiddenCount))}
                  </Text>
                </Pressable>
              )}
            </ScrollView>
          )}

          <Pressable accessibilityRole="button" onPress={onClose} style={styles.closeBtn}>
            <Text style={[styles.closeText, { color: colors.muted }]}>{t('close')}</Text>
          </Pressable>
        </View>
      </>
    </KeyboardAvoidingView>
  );
};

export const NotesModal: React.FC<NotesModalProps> = (props) => (
  <Modal visible={props.visible} animationType="slide" transparent onRequestClose={props.onClose}>
    <NotesSheet {...props} />
  </Modal>
);

const styles = StyleSheet.create({
  overlay: { flex: 1, justifyContent: 'flex-end', alignItems: 'center' },
  backdrop: { ...StyleSheet.absoluteFill, backgroundColor: 'rgba(0,0,0,0.6)' },
  sheet: { width: '100%', maxWidth: 520, maxHeight: '85%', borderTopLeftRadius: 24, borderTopRightRadius: 24, borderWidth: 1, padding: 20 },
  tabs: { flexDirection: 'row', gap: 20, marginBottom: 14 },
  tab: { paddingBottom: 8, borderBottomWidth: 2, borderBottomColor: 'transparent' },
  tabText: { fontSize: 15, fontWeight: '600' },
  body: { gap: 10 },
  question: { fontSize: 13.5, lineHeight: 20 },
  input: { minHeight: 130, borderWidth: 1, borderRadius: 14, padding: 14, fontSize: 15.5, lineHeight: 23, textAlignVertical: 'top' },
  counter: { fontSize: 12, textAlign: 'right' },
  primaryBtn: { height: 48, borderRadius: 24, alignItems: 'center', justifyContent: 'center', marginTop: 4 },
  primaryText: { color: '#FFFFFF', fontSize: 16, fontWeight: '600' },
  list: { flexGrow: 0 },
  empty: { textAlign: 'center', paddingVertical: 28, fontSize: 14, lineHeight: 22 },
  item: { borderWidth: 1, borderRadius: 14, padding: 14, marginBottom: 10 },
  itemQ: { fontSize: 12.5, lineHeight: 18, marginBottom: 6 },
  itemNote: { fontSize: 15, lineHeight: 22 },
  locked: { borderWidth: 1, borderStyle: 'dashed', borderRadius: 14, padding: 14, alignItems: 'center' },
  lockedText: { fontSize: 13.5, fontWeight: '600', textAlign: 'center', lineHeight: 20 },
  closeBtn: { alignItems: 'center', paddingTop: 14 },
  closeText: { fontSize: 14 },
});
