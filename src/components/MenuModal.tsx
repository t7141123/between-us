/**
 * MenuModal Component:
 * Clean, elegant hamburger drawer menu that organizes settings (theme, mute, language, timer, about)
 * without cluttering the main screen header.
 */
import React from 'react';
import {
  Modal,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import {
  Clock,
  Globe,
  ShieldCheck,
  Volume2,
  VolumeX,
  X,
} from 'lucide-react-native';
import { LocaleKey, ThemeColors, ThemeMode } from '../types';
import { I18nService } from '../services/i18n';

interface MenuModalProps {
  visible: boolean;
  locale: LocaleKey;
  theme: ThemeMode;
  colors: ThemeColors;
  muted: boolean;
  onClose: () => void;
  onToggleMute: () => void;
  onSelectLocale: (locale: LocaleKey) => void;
  onOpenTimer?: () => void;
}

const LOCALES: { key: LocaleKey; label: string; subLabel: string }[] = [
  { key: 'zh-TW', label: '繁體中文', subLabel: 'Traditional Chinese' },
  { key: 'zh-CN', label: '简体中文', subLabel: 'Simplified Chinese' },
  { key: 'en', label: 'English', subLabel: '英文' },
];

export const MenuModal: React.FC<MenuModalProps> = ({
  visible,
  locale,
  theme,
  colors,
  muted,
  onClose,
  onToggleMute,
  onSelectLocale,
  onOpenTimer,
}) => {
  const isDark = theme === 'dark';

  return (
    <Modal
      visible={visible}
      animationType="fade"
      transparent
      onRequestClose={onClose}
    >
      <View style={styles.overlay}>
        <Pressable style={styles.backdrop} onPress={onClose} />
        <View
          style={[
            styles.container,
            {
              backgroundColor: isDark ? '#1C1917' : '#FAF6F0',
              borderColor: isDark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.08)',
            },
          ]}
        >
          {/* Header */}
          <View style={styles.header}>
            <View>
              <Text style={[styles.title, { color: colors.ink }]}>
                {I18nService.t(locale, 'menu_title', '選單與偏好設定')}
              </Text>
              <Text style={[styles.subtitle, { color: colors.muted }]}>
                BETWEEN US · 在我們之間
              </Text>
            </View>
            <TouchableOpacity
              onPress={onClose}
              hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}
              style={[
                styles.closeBtn,
                { backgroundColor: isDark ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.05)' },
              ]}
              accessibilityLabel="關閉選單"
            >
              <X size={18} color={colors.ink} />
            </TouchableOpacity>
          </View>

          <ScrollView
            style={styles.scrollArea}
            contentContainerStyle={styles.scrollContent}
            showsVerticalScrollIndicator={false}
          >
            {/* Section 1: Appearance & Sound */}
            <View style={styles.section}>
              <Text style={[styles.sectionTitle, { color: colors.muted }]}>
                偏好體驗
              </Text>

              {/* Mute Toggle Card */}
              <View
                style={[
                  styles.cardRow,
                  {
                    backgroundColor: isDark ? '#292524' : '#FFFFFF',
                    borderColor: isDark ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.06)',
                  },
                ]}
              >
                <View style={styles.rowLeft}>
                  {muted ? (
                    <VolumeX size={20} color={colors.muted} />
                  ) : (
                    <Volume2 size={20} color={colors.clay} />
                  )}
                  <View style={styles.textStack}>
                    <Text style={[styles.itemTitle, { color: colors.ink }]}>
                      {I18nService.t(locale, 'menu_sound', '互動音效')}
                    </Text>
                    <Text style={[styles.itemSub, { color: colors.muted }]}>
                      {muted
                        ? I18nService.t(locale, 'menu_sound_off', '靜音模式')
                        : I18nService.t(locale, 'menu_sound_on', '開啟音效')}
                    </Text>
                  </View>
                </View>

                <TouchableOpacity
                  onPress={onToggleMute}
                  style={[
                    styles.pillToggleBtn,
                    {
                      backgroundColor: muted
                        ? (isDark ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.04)')
                        : (isDark ? 'rgba(196,112,79,0.2)' : '#FCE7D8'),
                      borderColor: muted ? colors.line : colors.clay,
                    },
                  ]}
                  activeOpacity={0.7}
                >
                  <Text
                    style={[
                      styles.pillToggleText,
                      { color: muted ? colors.muted : colors.clay },
                    ]}
                  >
                    {muted ? '已靜音' : '開啟中'}
                  </Text>
                </TouchableOpacity>
              </View>
            </View>

            {/* Section 2: Language Selection */}
            <View style={styles.section}>
              <View style={styles.sectionHeaderRow}>
                <Globe size={14} color={colors.muted} />
                <Text style={[styles.sectionTitle, { color: colors.muted, marginLeft: 6 }]}>
                  {I18nService.t(locale, 'menu_lang', '顯示語言')}
                </Text>
              </View>

              <View
                style={[
                  styles.langCard,
                  {
                    backgroundColor: isDark ? '#292524' : '#FFFFFF',
                    borderColor: isDark ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.06)',
                  },
                ]}
              >
                {LOCALES.map((item, idx) => {
                  const isSelected = locale === item.key;
                  return (
                    <TouchableOpacity
                      key={item.key}
                      onPress={() => onSelectLocale(item.key)}
                      style={[
                        styles.langRow,
                        idx < LOCALES.length - 1 && {
                          borderBottomWidth: 1,
                          borderBottomColor: isDark
                            ? 'rgba(255,255,255,0.06)'
                            : 'rgba(0,0,0,0.05)',
                        },
                      ]}
                      activeOpacity={0.7}
                    >
                      <View>
                        <Text
                          style={[
                            styles.langLabel,
                            { color: isSelected ? colors.clay : colors.ink },
                            isSelected && { fontWeight: '700' },
                          ]}
                        >
                          {item.label}
                        </Text>
                        <Text style={[styles.langSub, { color: colors.muted }]}>
                          {item.subLabel}
                        </Text>
                      </View>
                      {isSelected && (
                        <View
                          style={[styles.checkCircle, { backgroundColor: colors.clay }]}
                        >
                          <Text style={styles.checkText}>✓</Text>
                        </View>
                      )}
                    </TouchableOpacity>
                  );
                })}
              </View>
            </View>

            {/* Section 3: Conversation Utilities */}
            {onOpenTimer && (
              <View style={styles.section}>
                <Text style={[styles.sectionTitle, { color: colors.muted }]}>
                  雙人對話輔助
                </Text>

                <TouchableOpacity
                  onPress={() => {
                    onClose();
                    onOpenTimer();
                  }}
                  style={[
                    styles.cardRow,
                    {
                      backgroundColor: isDark ? '#292524' : '#FFFFFF',
                      borderColor: isDark ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.06)',
                    },
                  ]}
                  activeOpacity={0.8}
                >
                  <View style={styles.rowLeft}>
                    <Clock size={20} color={colors.clay} />
                    <View style={styles.textStack}>
                      <Text style={[styles.itemTitle, { color: colors.ink }]}>
                        {I18nService.t(locale, 'menu_timer', '5 分鐘沉思計時')}
                      </Text>
                      <Text style={[styles.itemSub, { color: colors.muted }]}>
                        給彼此五分鐘，一人傾訴、一人專心聆聽
                      </Text>
                    </View>
                  </View>
                  <Text style={[styles.arrowText, { color: colors.muted }]}>›</Text>
                </TouchableOpacity>
              </View>
            )}

            {/* Section 4: Privacy & Commitment */}
            <View style={styles.section}>
              <View style={styles.sectionHeaderRow}>
                <ShieldCheck size={14} color={colors.muted} />
                <Text style={[styles.sectionTitle, { color: colors.muted, marginLeft: 6 }]}>
                  {I18nService.t(locale, 'menu_about', '隱私承諾與說明')}
                </Text>
              </View>

              <View
                style={[
                  styles.aboutBox,
                  {
                    backgroundColor: isDark ? 'rgba(255,255,255,0.03)' : 'rgba(0,0,0,0.02)',
                    borderColor: isDark ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.06)',
                  },
                ]}
              >
                <Text style={[styles.aboutText, { color: colors.muted }]}>
                  {I18nService.t(
                    locale,
                    'commitment_text',
                    '「在我們之間」致力於為您與伴侶打造純淨的對話空間。我們不收集任何個人身分資料、無第三方廣告追蹤器。您的題目收藏與設定全部只儲存在您本人的裝置中。'
                  )}
                </Text>
                <Text style={[styles.versionText, { color: colors.muted }]}>
                  v1.2.0 · Designed with Heart for Intimate Connections
                </Text>
              </View>
            </View>
          </ScrollView>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: Platform.OS === 'web' ? 24 : 16,
  },
  backdrop: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0, 0, 0, 0.74)',
    ...Platform.select({
      web: {
        backdropFilter: 'blur(20px)',
        WebkitBackdropFilter: 'blur(20px)',
      } as any,
    }),
  },
  container: {
    width: '100%',
    maxWidth: 440,
    maxHeight: '88%',
    borderRadius: 24,
    borderWidth: 1,
    paddingTop: 20,
    paddingBottom: 16,
    paddingHorizontal: 20,
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
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingBottom: 14,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(0,0,0,0.06)',
  },
  title: {
    fontSize: 18,
    fontWeight: '800',
    letterSpacing: 0.5,
  },
  subtitle: {
    fontSize: 11,
    marginTop: 2,
    fontWeight: '600',
    letterSpacing: 1,
  },
  closeBtn: {
    width: 34,
    height: 34,
    borderRadius: 17,
    justifyContent: 'center',
    alignItems: 'center',
  },
  scrollArea: {
    marginTop: 12,
  },
  scrollContent: {
    paddingBottom: 16,
    gap: 16,
  },
  section: {
    gap: 8,
  },
  sectionHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  sectionTitle: {
    fontSize: 12,
    fontWeight: '700',
    letterSpacing: 0.5,
    textTransform: 'uppercase',
  },
  cardRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 14,
    borderRadius: 16,
    borderWidth: 1,
  },
  rowLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    gap: 12,
  },
  textStack: {
    flex: 1,
  },
  itemTitle: {
    fontSize: 14,
    fontWeight: '700',
  },
  itemSub: {
    fontSize: 11,
    marginTop: 2,
  },
  pillToggleBtn: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 999,
    borderWidth: 1,
  },
  pillToggleText: {
    fontSize: 12,
    fontWeight: '700',
  },
  langCard: {
    borderRadius: 16,
    borderWidth: 1,
    overflow: 'hidden',
  },
  langRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 12,
    paddingHorizontal: 16,
  },
  langLabel: {
    fontSize: 14,
    fontWeight: '600',
  },
  langSub: {
    fontSize: 11,
    marginTop: 1,
  },
  checkCircle: {
    width: 20,
    height: 20,
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
  },
  checkText: {
    color: '#FFFFFF',
    fontSize: 11,
    fontWeight: '800',
  },
  arrowText: {
    fontSize: 18,
    fontWeight: '700',
  },
  aboutBox: {
    borderRadius: 14,
    borderWidth: 1,
    padding: 14,
    gap: 8,
  },
  aboutText: {
    fontSize: 12,
    lineHeight: 18,
  },
  versionText: {
    fontSize: 11,
    fontWeight: '600',
    marginTop: 4,
  },
});
