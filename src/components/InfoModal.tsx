/**
 * InfoModal Component: Displays Privacy Policy and App Terms inside the app.
 * Fully supports dark/light mode and multi-language locales.
 */
import React from 'react';
import {
  View,
  Text,
  Modal,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  SafeAreaView,
  Platform,
} from 'react-native';
import { X, ShieldCheck, Mail, Globe } from 'lucide-react-native';
import { LocaleKey, ThemeColors } from '../types';
import { I18nService } from '../services/i18n';

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
  const isZhTw = locale === 'zh-TW';
  const isZhCn = locale === 'zh-CN';

  const modalTitle = isZhTw
    ? '隱私政策與說明'
    : isZhCn
    ? '隐私政策与说明'
    : 'Privacy Policy & About';

  const commitmentTitle = isZhTw
    ? '隱私與零資料收集承諾'
    : isZhCn
    ? '隐私与零数据收集承诺'
    : 'Zero-Data-Collection Guarantee';

  const commitmentText = isZhTw
    ? '「在我們之間」致力於為您與伴侶打造純淨的對話空間。我們不收集任何個人身分資料、無第三方廣告追蹤器、無登入系統。您的題目收藏與設定全部只儲存在您本人的手機中。'
    : isZhCn
    ? '「在我们之间」致力于为您与伴侣打造纯净的对话空间。我们不收集任何个人身份资料、无第三方广告追踪器、无登录系统。您的题目收藏与设置全部只储存在您本人的手机中。'
    : '"Between Us" is dedicated to creating an intimate conversation sanctuary. We collect zero personal data, use no ad tracking, and require no account. All bookmarks and settings stay entirely on your device.';

  const termsTitle = isZhTw
    ? '使用條款與版權'
    : isZhCn
    ? '使用条款与版权'
    : 'Terms of Use & Copyright';

  const termsText = isZhTw
    ? '本 App 所提供之 700 道題目與視覺風格均受智慧財產權保護，僅供個人與伴侶交流使用。本 App 按現狀提供，旨在促進伴侶情感交流。'
    : isZhCn
    ? '本 App 所提供之 700 道题目与视觉风格均受知识产权保护，仅供个人与伴侣交流使用。本 App 按现状提供，旨在促进伴侣情感交流。'
    : 'All 700 conversation prompts and visual designs are protected by copyright for personal, non-commercial use between partners.';

  const supportTitle = isZhTw ? '聯絡支援' : isZhCn ? '联系支持' : 'Contact Support';
  const supportEmail = 'support@lovebetweenus.app';
  const versionText = 'v1.0.0 (Build 1)';

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

            {/* Support Section */}
            <View style={styles.section}>
              <Text style={[styles.sectionTitle, { color: colors.ink }]}>{supportTitle}</Text>
              <View style={styles.infoRow}>
                <Mail size={16} color={colors.clay} style={{ marginRight: 8 }} />
                <Text style={[styles.infoText, { color: colors.ink }]}>{supportEmail}</Text>
              </View>
              <View style={[styles.infoRow, { marginTop: 6 }]}>
                <Globe size={16} color={colors.clay} style={{ marginRight: 8 }} />
                <Text style={[styles.infoText, { color: colors.ink }]}>https://love-between-us.pages.dev</Text>
              </View>
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
    backgroundColor: 'rgba(0, 0, 0, 0.55)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  container: {
    width: Platform.OS === 'web' ? 520 : '100%',
    maxHeight: '85%',
    borderRadius: 22,
    borderWidth: 1,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.15,
    shadowRadius: 16,
    elevation: 8,
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
