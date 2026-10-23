/**
 * CategorySelect Component: dropdown select picker for dialog themes, replacing horizontal chip bar.
 */
import React, { useMemo } from 'react';
import { View, StyleSheet } from 'react-native';
import { Layers } from 'lucide-react-native';
import { CategoryFilter, LocaleKey, ThemeColors } from '../types';
import { CATEGORY_KEYS } from '../constants/categories';
import { I18nService } from '../services/i18n';
import { SelectPicker, SelectOption } from './SelectPicker';

interface CategorySelectProps {
  currentCategory: CategoryFilter;
  locale: LocaleKey;
  colors: ThemeColors;
  onSelectCategory: (cat: CategoryFilter) => void;
}

export const CategorySelect: React.FC<CategorySelectProps> = ({
  currentCategory,
  locale,
  colors,
  onSelectCategory,
}) => {
  const options: SelectOption<CategoryFilter>[] = useMemo(() => {
    return [
      {
        value: 'all',
        label: `${I18nService.t(locale, 'all', '全部')} (700)`,
        badge: '700',
      },
      ...CATEGORY_KEYS.map((key) => ({
        value: key,
        label: `${I18nService.getCategoryLabel(locale, key)} (100)`,
        badge: '100',
      })),
    ];
  }, [locale]);

  return (
    <View style={styles.container}>
      <SelectPicker<CategoryFilter>
        icon={<Layers size={15} color={colors.clay} />}
        options={options}
        selectedValue={currentCategory}
        onSelect={onSelectCategory}
        colors={colors}
        modalTitle={I18nService.t(locale, 'drawer_title', '主題分類')}
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
});
