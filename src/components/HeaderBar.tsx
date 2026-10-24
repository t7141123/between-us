/**
 * HeaderBar Component containing title, subtitle, theme toggle, mute toggle and language picker.
 */
import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Platform, useWindowDimensions } from 'react-native';
import { Sun, Moon, Volume2, VolumeX, Globe, Sparkles } from 'lucide-react-native';
import { LocaleKey, ThemeColors } from '../types';
import { I18nService } from '../services/i18n';
import { SelectPicker, SelectOption } from './SelectPicker';

interface HeaderBarProps {
  locale: LocaleKey;
  colors: ThemeColors;
  isDark: boolean;
  muted: boolean;
  isSupporter?: boolean;
  onToggleTheme: () => void;
  onToggleMute: () => void;
  onSelectLocale: (locale: LocaleKey) => void;
  onOpenStore?: () => void;
}

const LOCALES_OPTIONS: SelectOption<LocaleKey>[] = [
  { value: 'zh-TW', label: '繁中' },
  { value: 'zh-CN', label: '简中' },
  { value: 'en', label: 'EN' },
];

export const HeaderBar: React.FC<HeaderBarProps> = ({
  locale,
  colors,
  isDark,
  muted,
  isSupporter = false,
  onToggleTheme,
  onToggleMute,
  onSelectLocale,
  onOpenStore,
}) => {
  const { width, height } = useWindowDimensions();
  const isMobile = width < 600 || height < 750;

  const title = I18nService.t(locale, 'title');
  const subtitle = I18nService.t(locale, 'subtitle');

  return (
    <View style={[styles.container, isMobile && styles.containerMobile]}>
      {/* Action icons row */}
      <View style={[styles.topRow, isMobile && styles.topRowMobile]}>
        <View style={styles.brandRow}>
          <View style={styles.brandTag}>
            <Text style={[styles.brandText, { color: colors.clay }]}>BETWEEN US</Text>
          </View>
          {isSupporter && (
            <View style={styles.supporterTag}>
              <Text style={styles.supporterTagText}>✦</Text>
            </View>
          )}
        </View>

        <View style={styles.controlsRow}>
          {/* Store / Atelier button */}
          {onOpenStore && (
            <TouchableOpacity
              onPress={onOpenStore}
              style={[
                styles.storeButton,
                { borderColor: colors.clay, backgroundColor: isDark ? 'rgba(196,112,79,0.15)' : '#FBF3EC' },
              ]}
              activeOpacity={0.7}
              accessibilityLabel="典藏沙龍"
            >
              <Sparkles size={13} color={colors.clay} />
              <Text style={[styles.storeButtonText, { color: colors.clay }]}>
                {I18nService.t(locale, 'store_btn', '典藏')}
              </Text>
            </TouchableOpacity>
          )}

          {/* Language Selection Dropdown Picker */}
          <SelectPicker<LocaleKey>
            icon={<Globe size={13} color={colors.muted} />}
            options={LOCALES_OPTIONS}
            selectedValue={locale}
            onSelect={onSelectLocale}
            colors={colors}
            modalTitle={I18nService.t(locale, 'language', '語言')}
            compact
          />

          {/* Audio toggle button */}
          <TouchableOpacity
            onPress={onToggleMute}
            style={[styles.iconButton, { borderColor: colors.line, backgroundColor: colors.card }]}
            activeOpacity={0.7}
            accessibilityLabel="切換音效"
          >
            {muted ? (
              <VolumeX size={15} color={colors.muted} />
            ) : (
              <Volume2 size={15} color={colors.clay} />
            )}
          </TouchableOpacity>

          {/* Theme toggle button */}
          <TouchableOpacity
            onPress={onToggleTheme}
            style={[styles.iconButton, { borderColor: colors.line, backgroundColor: colors.card }]}
            activeOpacity={0.7}
            accessibilityLabel="切換主題模式"
          >
            {isDark ? (
              <Sun size={15} color={colors.clay} />
            ) : (
              <Moon size={15} color={colors.muted} />
            )}
          </TouchableOpacity>
        </View>
      </View>

      {/* Main Title & Subtitle */}
      <View style={styles.titleContainer}>
        <Text
          style={[
            styles.title,
            {
              color: colors.ink,
              fontSize: isMobile ? 22 : (Platform.OS === 'web' ? 34 : 28),
              lineHeight: isMobile ? 28 : (Platform.OS === 'web' ? 40 : 34),
            },
          ]}
          numberOfLines={1}
          ellipsizeMode="tail"
        >
          {title}
        </Text>
        <Text
          style={[
            styles.subtitle,
            {
              color: colors.muted,
              fontSize: isMobile ? 12 : 13,
              lineHeight: isMobile ? 17 : 20,
              marginTop: isMobile ? 3 : 6,
            },
          ]}
          numberOfLines={2}
        >
          {subtitle}
        </Text>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    width: '100%',
    paddingHorizontal: 16,
    paddingTop: Platform.OS === 'web' ? 20 : 12,
    paddingBottom: 8,
    alignItems: 'center',
  },
  containerMobile: {
    paddingTop: Platform.OS === 'web' ? 12 : 8,
    paddingBottom: 4,
  },
  topRow: {
    width: '100%',
    maxWidth: 600,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  topRowMobile: {
    marginBottom: 6,
  },
  brandRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    flexShrink: 0,
  },
  brandTag: {
    paddingVertical: 2,
    flexShrink: 0,
  },
  brandText: {
    fontSize: 10,
    fontWeight: '700',
    letterSpacing: 2,
  },
  supporterTag: {
    backgroundColor: '#F59E0B',
    width: 16,
    height: 16,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  supporterTagText: {
    color: '#FFFFFF',
    fontSize: 10,
    fontWeight: '700',
  },
  storeButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 8,
    height: 32,
    borderRadius: 16,
    borderWidth: 1,
  },
  storeButtonText: {
    fontSize: 11,
    fontWeight: '700',
    letterSpacing: 0.5,
  },
  controlsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    flexShrink: 0,
  },
  iconButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  titleContainer: {
    alignItems: 'center',
    paddingHorizontal: 8,
    width: '100%',
  },
  title: {
    fontWeight: '400',
    letterSpacing: 0.5,
    textAlign: 'center',
    fontFamily: Platform.OS === 'ios' ? 'Georgia' : 'serif',
  },
  subtitle: {
    textAlign: 'center',
    maxWidth: 420,
  },
});
