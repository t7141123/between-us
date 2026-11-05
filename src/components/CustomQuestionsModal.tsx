/**
 * CustomQuestionsModal (Plus): write the couple's own questions and talk about them as a private deck.
 */
import React, { useState } from 'react';
import { KeyboardAvoidingView, Modal, Platform, Pressable, ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';
import { CUSTOM_MAX_COUNT, CUSTOM_MAX_LENGTH, CustomQuestion } from '../services/customCore';
import { I18nService } from '../services/i18n';
import { LocaleKey, ThemeColors } from '../types';

interface Props {
  visible: boolean;
  locale: LocaleKey;
  colors: ThemeColors;
  isDark: boolean;
  questions: CustomQuestion[];
  onAdd: (text: string) => void;
  onRemove: (id: string) => void;
  onStartTalking: () => void;
  onClose: () => void;
}

const Sheet: React.FC<Props> = ({ locale, colors, isDark, questions, onAdd, onRemove, onStartTalking, onClose }) => {
  const t = (key: string) => I18nService.t(locale, key);
  const [draft, setDraft] = useState('');
  const [confirmId, setConfirmId] = useState<string | null>(null);
  const border = isDark ? 'rgba(255,255,255,0.12)' : 'rgba(0,0,0,0.12)';
  const full = questions.length >= CUSTOM_MAX_COUNT;

  const submit = () => {
    if (draft.trim() === '' || full) return;
    onAdd(draft);
    setDraft('');
  };

  return (
    <KeyboardAvoidingView style={styles.overlay} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
      <Pressable style={styles.backdrop} onPress={onClose} accessibilityLabel={t('a11y_close')} />
      <View style={[styles.sheet, { backgroundColor: isDark ? '#1C1917' : '#FAF6F0', borderColor: border }]}>
        <Text style={[styles.title, { color: colors.ink }]}>{t('custom_title')}</Text>
        <Text style={[styles.desc, { color: colors.muted }]}>{t('custom_desc')}</Text>

        <View style={styles.addRow}>
          <TextInput
            value={draft}
            onChangeText={setDraft}
            placeholder={t('custom_placeholder')}
            placeholderTextColor={colors.muted}
            maxLength={CUSTOM_MAX_LENGTH}
            multiline
            style={[styles.input, { color: colors.ink, borderColor: border, backgroundColor: isDark ? '#292524' : '#FFFFFF' }]}
            accessibilityLabel={t('custom_placeholder')}
          />
          <Pressable
            accessibilityRole="button"
            onPress={submit}
            disabled={draft.trim() === '' || full}
            style={[styles.addBtn, { backgroundColor: colors.clay, opacity: draft.trim() === '' || full ? 0.45 : 1 }]}
          >
            <Text style={styles.addText}>{t('custom_add')}</Text>
          </Pressable>
        </View>

        <ScrollView style={styles.list} keyboardShouldPersistTaps="handled">
          {questions.length === 0 && <Text style={[styles.empty, { color: colors.muted }]}>{t('custom_empty')}</Text>}
          {questions.map((q) => (
            <View key={q.id} style={[styles.item, { borderColor: border, backgroundColor: isDark ? '#292524' : '#FFFFFF' }]}>
              <Text style={[styles.itemText, { color: colors.ink }]}>{q.text}</Text>
              <Pressable
                accessibilityRole="button"
                onPress={() => {
                  if (confirmId === q.id) {
                    setConfirmId(null);
                    onRemove(q.id);
                  } else {
                    setConfirmId(q.id);
                  }
                }}
                hitSlop={8}
              >
                <Text style={[styles.delete, { color: colors.clay }]}>{confirmId === q.id ? t('custom_delete_confirm') : t('custom_delete')}</Text>
              </Pressable>
            </View>
          ))}
        </ScrollView>

        {questions.length > 0 && (
          <Pressable accessibilityRole="button" onPress={onStartTalking} style={[styles.primaryBtn, { backgroundColor: colors.clay }]}>
            <Text style={styles.primaryText}>{t('custom_start')}</Text>
          </Pressable>
        )}
        <Pressable accessibilityRole="button" onPress={onClose} style={styles.closeBtn}>
          <Text style={[styles.closeText, { color: colors.muted }]}>{t('close')}</Text>
        </Pressable>
      </View>
    </KeyboardAvoidingView>
  );
};

export const CustomQuestionsModal: React.FC<Props> = (props) => (
  <Modal visible={props.visible} animationType="slide" transparent onRequestClose={props.onClose}>
    <Sheet {...props} />
  </Modal>
);

const styles = StyleSheet.create({
  overlay: { flex: 1, justifyContent: 'flex-end', alignItems: 'center' },
  backdrop: { ...StyleSheet.absoluteFill, backgroundColor: 'rgba(0,0,0,0.6)' },
  sheet: { width: '100%', maxWidth: 520, maxHeight: '88%', borderTopLeftRadius: 24, borderTopRightRadius: 24, borderWidth: 1, padding: 20 },
  title: { fontSize: 19, fontWeight: '700', marginBottom: 4 },
  desc: { fontSize: 13, lineHeight: 19, marginBottom: 14 },
  addRow: { flexDirection: 'row', gap: 10, alignItems: 'flex-end', marginBottom: 12 },
  input: { flex: 1, minHeight: 48, maxHeight: 110, borderWidth: 1, borderRadius: 14, paddingHorizontal: 12, paddingVertical: 10, fontSize: 15, textAlignVertical: 'top' },
  addBtn: { height: 48, paddingHorizontal: 18, borderRadius: 24, alignItems: 'center', justifyContent: 'center' },
  addText: { color: '#FFFFFF', fontWeight: '600', fontSize: 15 },
  list: { flexGrow: 0, marginBottom: 12 },
  empty: { textAlign: 'center', paddingVertical: 22, fontSize: 14, lineHeight: 21 },
  item: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: 12, borderWidth: 1, borderRadius: 14, padding: 14, marginBottom: 8 },
  itemText: { flex: 1, fontSize: 15, lineHeight: 22 },
  delete: { fontSize: 13, fontWeight: '600' },
  primaryBtn: { height: 48, borderRadius: 24, alignItems: 'center', justifyContent: 'center' },
  primaryText: { color: '#FFFFFF', fontSize: 16, fontWeight: '600' },
  closeBtn: { alignItems: 'center', paddingTop: 14 },
  closeText: { fontSize: 14 },
});
