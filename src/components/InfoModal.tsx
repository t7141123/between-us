/**
 * InfoModal Component: Displays Privacy Policy and App Terms inside the app.
 * Fully supports dark/light mode and multi-language locales.
 */
import React, { useEffect, useState } from 'react';
import Constants from 'expo-constants';
import {
  View,
  Text,
  Modal,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  SafeAreaView,
  Platform,
  Linking,
  Switch,
} from 'react-native';
import { X, ShieldCheck, Mail, Globe } from 'lucide-react-native';
import { LocaleKey, ThemeColors } from '../types';
import { I18nService } from '../services/i18n';
import { TelemetryService } from '../services/telemetry';

const SITE_URL = 'https://between-us.ark-studio.app';
const SUPPORT_EMAIL = 'support@lovebetweenus.app';

interface InfoModalProps {
  visible: boolean;
  locale: LocaleKey;
  colors: ThemeColors;
  onClose: () => void;
}

export const InfoModal: React.FC<InfoModalProps> = ({
  visible,
  locale,
  colors,
  onClose,
}) => {
  const modalTitle = I18nService.t(locale, 'info_title', '隱私政策與說明');
  const [telemetryOn, setTelemetryOn] = useState(true);
  useEffect(() => {
    if (visible) TelemetryService.isEnabled().then(setTelemetryOn);
  }, [visible]);
  const toggleTelemetry = (value: boolean) => {
    setTelemetryOn(value);
    void TelemetryService.setEnabled(value);
  };
  const open = (url: string) => {
    Linking.openURL(url).catch(() => {});
  };
  const commitmentTitle = I18nService.t(locale, 'commitment_title');
  const commitmentText = I18nService.t(locale, 'commitment_text');
  const termsTitle = I18nService.t(locale, 'terms_title', '使用條款與版權');
  const termsText = I18nService.t(locale, 'terms_text', '本 App 所提供之 700 道題目與視覺風格均受智慧財產權保護，僅供個人與伴侶交流使用。本 App 按現狀提供，旨在促進伴侶情感交流。');
  const supportTitle = I18nService.t(locale, 'support_title', '聯絡支援');
  const supportEmail = SUPPORT_EMAIL;
  const versionText = `v${Constants.expoConfig?.version ?? ''}`;

  return (
    <Modal
      visible={visible}
      animationType="slide"
      transparent
      onRequestClose={onClose}
    >
      <View style={styles.overlay}>
        <SafeAreaView style={[styles.container, { backgroundColor: colors.card, borderColor: colors.line }]}>
          {/* Header */}
          <View style={[styles.header, { borderBottomColor: colors.line }]}>
            <View style={styles.headerTitleRow}>
              <ShieldCheck size={20} color={colors.clay} style={{ marginRight: 8 }} />
              <Text style={[styles.title, { color: colors.ink }]}>{modalTitle}</Text>
            </View>
            <TouchableOpacity onPress={onClose} style={styles.closeBtn} activeOpacity={0.7}>
              <X size={20} color={colors.muted} />
            </TouchableOpacity>
          </View>

          {/* Content */}
          <ScrollView contentContainerStyle={styles.scrollContent}>
            {/* Highlight box */}
            <View style={[styles.highlightBox, { backgroundColor: colors.badgeBg, borderColor: colors.clay }]}>
              <Text style={[styles.highlightTitle, { color: colors.clay }]}>{commitmentTitle}</Text>
              <Text style={[styles.highlightText, { color: colors.ink }]}>{commitmentText}</Text>
            </View>

            {/* Terms Section */}
            <View style={styles.section}>
              <Text style={[styles.sectionTitle, { color: colors.ink }]}>{termsTitle}</Text>
              <Text style={[styles.sectionText, { color: colors.muted }]}>{termsText}</Text>
            </View>

            {/* Analytics opt-out */}
            <View style={[styles.infoRow, { justifyContent: 'space-between' }]}>
              <View style={{ flex: 1, paddingRight: 12 }}>
                <Text style={[styles.sectionTitle, { color: colors.ink }]}>
                  {I18nService.t(locale, 'telemetry_toggle')}
                </Text>
                <Text style={[styles.sectionText, { color: colors.muted }]}>
                  {I18nService.t(locale, 'telemetry_toggle_desc')}
                </Text>
              </View>
              <Switch
                value={telemetryOn}
                onValueChange={toggleTelemetry}
                accessibilityLabel={I18nService.t(locale, 'telemetry_toggle')}
              />
            </View>

            {/* Support Section */}
            <View style={styles.section}>
              <Text style={[styles.sectionTitle, { color: colors.ink }]}>{supportTitle}</Text>
              <TouchableOpacity
                style={styles.infoRow}
                onPress={() => open(`mailto:${supportEmail}`)}
                accessibilityRole="link"
                accessibilityLabel={supportEmail}
              >
                <Mail size={16} color={colors.clay} style={{ marginRight: 8 }} />
                <Text style={[styles.infoText, { color: colors.ink }]}>{supportEmail}</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.infoRow, { marginTop: 10 }]}
                onPress={() => open(`${SITE_URL}/support`)}
                accessibilityRole="link"
              >
                <Globe size={16} color={colors.clay} style={{ marginRight: 8 }} />
                <Text style={[styles.infoText, { color: colors.ink }]}>
                  {I18nService.t(locale, 'support_link')}
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.infoRow, { marginTop: 10 }]}
                onPress={() => open(`${SITE_URL}/privacy`)}
                accessibilityRole="link"
              >
                <ShieldCheck size={16} color={colors.clay} style={{ marginRight: 8 }} />
                <Text style={[styles.infoText, { color: colors.ink }]}>
                  {I18nService.t(locale, 'privacy_policy_link')}
                </Text>
              </TouchableOpacity>
            </View>

            {/* Version */}
            <View style={styles.footer}>
              <Text style={[styles.versionText, { color: colors.muted }]}>
                在我們之間 · Between Us {versionText}
              </Text>
            </View>
          </ScrollView>

          {/* Close Action Button */}
          <View style={[styles.footerBtnArea, { borderTopColor: colors.line }]}>
            <TouchableOpacity
              onPress={onClose}
              style={[styles.confirmBtn, { backgroundColor: colors.clay }]}
              activeOpacity={0.8}
            >
              <Text style={styles.confirmBtnText}>{I18nService.t(locale, 'close', '關閉')}</Text>
            </TouchableOpacity>
          </View>
        </SafeAreaView>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.74)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
    ...Platform.select({
      web: {
        backdropFilter: 'blur(20px)',
        WebkitBackdropFilter: 'blur(20px)',
      } as any,
    }),
  },
  container: {
    width: Platform.OS === 'web' ? 520 : '100%',
    maxHeight: '85%',
    borderRadius: 22,
    borderWidth: 1,
    overflow: 'hidden',
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 12 },
        shadowOpacity: 0.35,
        shadowRadius: 24,
      },
      android: { elevation: 12 },
      web: {
        boxShadow: '0 20px 60px rgba(0, 0, 0, 0.6), 0 0 1px rgba(255, 255, 255, 0.1)',
      },
    }),
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
  },
  headerTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  title: {
    fontSize: 18,
    fontWeight: '600',
    fontFamily: Platform.OS === 'ios' ? 'Georgia' : 'serif',
  },
  closeBtn: {
    padding: 6,
  },
  scrollContent: {
    padding: 20,
    gap: 18,
  },
  highlightBox: {
    borderLeftWidth: 4,
    padding: 14,
    borderRadius: 10,
  },
  highlightTitle: {
    fontSize: 14,
    fontWeight: '700',
    marginBottom: 6,
  },
  highlightText: {
    fontSize: 13,
    lineHeight: 20,
  },
  section: {
    gap: 6,
  },
  sectionTitle: {
    fontSize: 15,
    fontWeight: '600',
    fontFamily: Platform.OS === 'ios' ? 'Georgia' : 'serif',
  },
  sectionText: {
    fontSize: 13,
    lineHeight: 20,
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  infoText: {
    fontSize: 13,
    fontWeight: '500',
  },
  footer: {
    alignItems: 'center',
    paddingVertical: 10,
  },
  versionText: {
    fontSize: 11,
  },
  footerBtnArea: {
    padding: 16,
    borderTopWidth: 1,
  },
  confirmBtn: {
    paddingVertical: 12,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
  },
  confirmBtnText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '600',
  },
});
