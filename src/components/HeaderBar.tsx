/**
 * HeaderBar Component containing title, subtitle, theme toggle, mute toggle and language picker.
 */
import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Platform } from 'react-native';
import { Sun, Moon, Volume2, VolumeX, Globe } from 'lucide-react-native';
import { LocaleKey, ThemeColors } from '../types';
import { I18nService } from '../services/i18n';
import { SelectPicker, SelectOption } from './SelectPicker';

interface HeaderBarProps {
  locale: LocaleKey;
  colors: ThemeColors;
  isDark: boolean;
  muted: boolean;
  onToggleTheme: () => void;
  onToggleMute: () => void;
  onSelectLocale: (locale: LocaleKey) => void;
}

const LOCALES_OPTIONS: SelectOption<LocaleKey>[] = [
  { value: 'zh-TW', label: '繁體中文' },
  { value: 'zh-CN', label: '简体中文' },
  { value: 'en', label: 'English' },
];

export const HeaderBar: React.FC<HeaderBarProps> = ({
  locale,
  colors,
  isDark,
  muted,
  onToggleTheme,
  onToggleMute,
  onSelectLocale,
}) => {
  const title = I18nService.t(locale, 'title');
  const subtitle = I18nService.t(locale, 'subtitle');

  return (
    <View style={styles.container}>
      {/* Action icons row */}
      <View style={styles.topRow}>
        <View style={styles.brandTag}>
          <Text style={[styles.brandText, { color: colors.clay }]}>BETWEEN US</Text>
        </View>

        <View style={styles.controlsRow}>
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
              <VolumeX size={16} color={colors.muted} />
            ) : (
              <Volume2 size={16} color={colors.clay} />
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
              <Sun size={16} color={colors.clay} />
            ) : (
              <Moon size={16} color={colors.muted} />
            )}
          </TouchableOpacity>
        </View>
      </View>

      {/* Main Title & Subtitle */}
      <View style={styles.titleContainer}>
        <Text style={[styles.title, { color: colors.ink }]}>{title}</Text>
        <Text style={[styles.subtitle, { color: colors.muted }]}>{subtitle}</Text>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    width: '100%',
    paddingHorizontal: 20,
    paddingTop: Platform.OS === 'web' ? 24 : 12,
    paddingBottom: 12,
    alignItems: 'center',
  },
  topRow: {
    width: '100%',
    maxWidth: 600,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  brandTag: {
    paddingVertical: 2,
  },
  brandText: {
    fontSize: 11,
    fontWeight: '600',
    letterSpacing: 2,
  },
  controlsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  iconButton: {
    width: 34,
    height: 34,
    borderRadius: 17,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  titleContainer: {
    alignItems: 'center',
    paddingHorizontal: 8,
  },
  title: {
    fontSize: Platform.OS === 'web' ? 36 : 28,
    fontWeight: '400',
    letterSpacing: 0.5,
    textAlign: 'center',
    fontFamily: Platform.OS === 'ios' ? 'Georgia' : 'serif',
  },
  subtitle: {
    fontSize: 13,
    lineHeight: 20,
    textAlign: 'center',
    marginTop: 6,
    maxWidth: 420,
  },
});
