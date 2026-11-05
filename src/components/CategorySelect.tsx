/**
 * CategorySelect Component: dropdown select picker for dialog themes, replacing horizontal chip bar.
 */
import React, { useMemo } from 'react';
import { View, StyleSheet, useWindowDimensions } from 'react-native';
import { Layers } from 'lucide-react-native';
import { CategoryFilter, LocaleKey, ThemeColors } from '../types';
import { CATEGORY_KEYS } from '../constants/categories';
import { I18nService } from '../services/i18n';
import { sessionIdOfCategory } from '../services/sessionCore';
import { SelectPicker, SelectOption } from './SelectPicker';

interface CategorySelectProps {
  currentCategory: CategoryFilter;
  locale: LocaleKey;
  colors: ThemeColors;
  unlockedPacks?: string[];
  isPlus?: boolean;
  customCount?: number;
  onSelectCategory: (cat: CategoryFilter) => void;
}

export const CategorySelect: React.FC<CategorySelectProps> = ({
  currentCategory,
  locale,
  colors,
  unlockedPacks = [],
  isPlus = false,
  customCount = 0,
  onSelectCategory,
}) => {
  const { width, height } = useWindowDimensions();
  const isMobile = width < 600 || height < 750;

  const options: SelectOption<CategoryFilter>[] = useMemo(() => {
    const isSensualUnlocked = unlockedPacks.includes('sensual');
    const isMarriageUnlocked = unlockedPacks.includes('marriage');
    const isParentingUnlocked = unlockedPacks.includes('parenting');

    return [
      {
        value: 'all',
        label: I18nService.t(locale, 'all', '全部'),
        badge: '350',
      },
      ...CATEGORY_KEYS.map((key) => ({
        value: key,
        label: I18nService.getCategoryLabel(locale, key),
        badge: '50',
      })),
      {
        value: 'pack_sensual',
        label: `${I18nService.t(locale, 'pack_sensual_title', '🔥 深夜私語')}${isSensualUnlocked ? '' : ' 🔒'}`,
        badge: '50',
      },
      {
        value: 'pack_marriage',
        label: `${I18nService.t(locale, 'pack_marriage_title', '💍 婚姻誓約前夕')}${isMarriageUnlocked ? '' : ' 🔒'}`,
        badge: '50',
      },
      {
        value: 'pack_parenting',
        label: `${I18nService.t(locale, 'pack_parenting_title', '🌱 新生兒與新手父母')}${isParentingUnlocked ? '' : ' 🔒'}`,
        badge: '50',
      },
      {
        value: 'custom',
        label: `${I18nService.t(locale, 'custom_label')}${isPlus ? '' : ' 🔒'}`,
        badge: isPlus ? String(customCount) : 'Plus',
      },
    ];
  }, [locale, unlockedPacks, isPlus, customCount]);

  // While a Date Night session is active it is shown as the current choice.
  const optionsWithSession = useMemo(() => {
    const sessionId = sessionIdOfCategory(String(currentCategory));
    if (!sessionId) return options;
    return [{ value: currentCategory, label: `🌙 ${I18nService.t(locale, `session_${sessionId}_title`)}`, badge: '10' }, ...options];
  }, [options, currentCategory, locale]);

  return (
    <View style={[styles.container, isMobile && styles.containerMobile]}>
      <SelectPicker<CategoryFilter>
        icon={<Layers size={16} color={colors.clay} />}
        options={optionsWithSession}
        selectedValue={currentCategory}
        onSelect={onSelectCategory}
        colors={colors}
        modalTitle={I18nService.t(locale, 'drawer_title', '主題分類')}
        closeLabel={I18nService.t(locale, 'a11y_close')}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    width: '100%',
    alignItems: 'center',
    paddingVertical: 8,
    paddingHorizontal: 20,
  },
  containerMobile: {
    paddingTop: 6,
    paddingBottom: 10,
    paddingHorizontal: 16,
  },
});
