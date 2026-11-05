/**
 * ShareSheet: share the current question as text (free) or as a picture of the card (Plus).
 * On the web the picture is drawn with a canvas; on phones the same SVG is rendered off-screen and captured.
 */
import React, { useRef, useState } from 'react';
import { Modal, Platform, Pressable, StyleSheet, Text, View } from 'react-native';
import { SvgXml } from 'react-native-svg';
import { CardSkinConfig } from '../constants/packs';
import { buildCardSvg, CARD_IMAGE_HEIGHT, CARD_IMAGE_WIDTH } from '../services/cardImageCore';
import { I18nService } from '../services/i18n';
import { shareOrDownloadPng, svgToPngBlob } from '../services/shareImage';
import { LocaleKey, QuestionEntry, ThemeColors } from '../types';

interface Props {
  visible: boolean;
  locale: LocaleKey;
  colors: ThemeColors;
  isDark: boolean;
  isPlus: boolean;
  question: QuestionEntry | null;
  skin: CardSkinConfig;
  onShareText: () => void;
  onOpenStore: () => void;
  onClose: () => void;
}

const PREVIEW_W = 360;
const PREVIEW_H = Math.round((PREVIEW_W * CARD_IMAGE_HEIGHT) / CARD_IMAGE_WIDTH);

const Sheet: React.FC<Props> = ({ locale, colors, isDark, isPlus, question, skin, onShareText, onOpenStore, onClose }) => {
  const t = (key: string) => I18nService.t(locale, key);
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const captureRef = useRef<React.ComponentRef<typeof View>>(null);
  const border = isDark ? 'rgba(255,255,255,0.12)' : 'rgba(0,0,0,0.12)';

  const svg = question
    ? buildCardSvg({
        text: question.text,
        label: question.categoryLabel,
        footer: '在我們之間 · Between Us',
        style: { bg: skin.bgColor, ink: skin.textColor, accent: skin.accentColor, sub: skin.subTextColor, border: skin.borderColor },
      })
    : '';

  const shareImage = async () => {
    if (!isPlus) {
      onClose();
      onOpenStore();
      return;
    }
    if (!question || busy) return;
    setBusy(true);
    setMessage(null);
    try {
      if (Platform.OS === 'web') {
        const blob = await svgToPngBlob(svg);
        const result = await shareOrDownloadPng(blob, 'between-us-card.png');
        if (result === 'downloaded') setMessage(t('share_image_saved'));
        else onClose();
      } else {
        const { captureRef: capture } = await import('react-native-view-shot');
        const Sharing = await import('expo-sharing');
        const uri = await capture(captureRef, { format: 'png', quality: 1, result: 'tmpfile', width: CARD_IMAGE_WIDTH, height: CARD_IMAGE_HEIGHT });
        if (await Sharing.isAvailableAsync()) await Sharing.shareAsync(uri, { mimeType: 'image/png' });
        onClose();
      }
    } catch {
      setMessage(t('share_image_failed'));
    } finally {
      setBusy(false);
    }
  };

  return (
    <View style={styles.overlay}>
      <Pressable style={styles.backdrop} onPress={onClose} accessibilityLabel={t('a11y_close')} />
      <View style={[styles.sheet, { backgroundColor: isDark ? '#1C1917' : '#FAF6F0', borderColor: border }]}>
        <Text style={[styles.title, { color: colors.ink }]}>{t('share_sheet_title')}</Text>

        <Pressable accessibilityRole="button" onPress={onShareText} style={[styles.row, { borderColor: border, backgroundColor: isDark ? '#292524' : '#FFFFFF' }]}>
          <Text style={[styles.rowTitle, { color: colors.ink }]}>{t('share_as_text')}</Text>
        </Pressable>

        <Pressable accessibilityRole="button" onPress={shareImage} disabled={busy} style={[styles.row, { borderColor: isPlus ? colors.clay : border, backgroundColor: isDark ? '#292524' : '#FFFFFF', opacity: busy ? 0.6 : 1 }]}>
          <Text style={[styles.rowTitle, { color: colors.ink }]}>{`${isPlus ? '' : '🔒 '}${t('share_as_image')}`}</Text>
          {!isPlus && <Text style={[styles.badge, { color: colors.clay }]}>Plus</Text>}
        </Pressable>

        {message && <Text style={[styles.message, { color: colors.clay }]}>{message}</Text>}

        <Pressable accessibilityRole="button" onPress={onClose} style={styles.closeBtn}>
          <Text style={[styles.closeText, { color: colors.muted }]}>{t('close')}</Text>
        </Pressable>
      </View>

      {/* Off-screen render of the card picture, captured on phones. */}
      {Platform.OS !== 'web' && isPlus && svg !== '' && (
        <View ref={captureRef} collapsable={false} pointerEvents="none" style={styles.offscreen}>
          <SvgXml xml={svg} width={PREVIEW_W} height={PREVIEW_H} />
        </View>
      )}
    </View>
  );
};

export const ShareSheet: React.FC<Props> = (props) => (
  <Modal visible={props.visible} animationType="slide" transparent onRequestClose={props.onClose}>
    <Sheet {...props} />
  </Modal>
);

const styles = StyleSheet.create({
  overlay: { flex: 1, justifyContent: 'flex-end', alignItems: 'center' },
  backdrop: { ...StyleSheet.absoluteFill, backgroundColor: 'rgba(0,0,0,0.6)' },
  sheet: { width: '100%', maxWidth: 520, borderTopLeftRadius: 24, borderTopRightRadius: 24, borderWidth: 1, padding: 20 },
  title: { fontSize: 18, fontWeight: '700', marginBottom: 14 },
  row: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', borderWidth: 1, borderRadius: 16, padding: 16, marginBottom: 10 },
  rowTitle: { fontSize: 15.5, fontWeight: '600' },
  badge: { fontSize: 12, fontWeight: '700' },
  message: { fontSize: 13, textAlign: 'center', marginBottom: 6 },
  closeBtn: { alignItems: 'center', paddingTop: 8 },
  closeText: { fontSize: 14 },
  offscreen: { position: 'absolute', left: -10000, top: 0, width: PREVIEW_W, height: PREVIEW_H },
});
