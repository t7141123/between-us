/**
 * Reusable Cross-Platform SelectPicker Component supporting Light/Dark dual themes.
 * Provides a clean dropdown trigger button and an elegant selection modal across iOS, Android, and Web.
 */
import React, { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  Modal,
  FlatList,
  StyleSheet,
  TouchableWithoutFeedback,
  Platform,
} from 'react-native';
import { ChevronDown, Check, X } from 'lucide-react-native';
import { ThemeColors } from '../types';

export interface SelectOption<T extends string> {
  value: T;
  label: string;
  badge?: string;
}

interface SelectPickerProps<T extends string> {
  icon?: React.ReactNode;
  options: SelectOption<T>[];
  selectedValue: T;
  onSelect: (value: T) => void;
  colors: ThemeColors;
  modalTitle?: string;
  compact?: boolean;
}

export function SelectPicker<T extends string>({
  icon,
  options,
  selectedValue,
  onSelect,
  colors,
  modalTitle,
  compact = false,
}: SelectPickerProps<T>) {
  const [modalVisible, setModalVisible] = useState(false);

  const selectedOption = options.find((opt) => opt.value === selectedValue) || options[0];

  const handleSelect = (val: T) => {
    onSelect(val);
    setModalVisible(false);
  };

  return (
    <>
      {/* Trigger Button */}
      <TouchableOpacity
        onPress={() => setModalVisible(true)}
        style={[
          styles.triggerBtn,
          compact ? styles.triggerCompact : styles.triggerRegular,
          {
            backgroundColor: colors.card,
            borderColor: colors.line,
          },
        ]}
        activeOpacity={0.75}
      >
        <View style={styles.triggerLeft}>
          {icon && <View style={styles.iconContainer}>{icon}</View>}
          <Text
            style={[
              compact ? styles.triggerTextCompact : styles.triggerTextRegular,
              { color: colors.ink },
            ]}
            numberOfLines={1}
          >
            {selectedOption?.label}
          </Text>
        </View>
        <ChevronDown
          size={compact ? 13 : 15}
          color={colors.muted}
          style={styles.chevron}
        />
      </TouchableOpacity>

      {/* Options Selection Modal */}
      <Modal
        visible={modalVisible}
        transparent
        animationType="fade"
        onRequestClose={() => setModalVisible(false)}
      >
        <TouchableWithoutFeedback onPress={() => setModalVisible(false)}>
          <View style={styles.modalBackdrop}>
            <TouchableWithoutFeedback>
              <View
                style={[
                  styles.modalContent,
                  {
                    backgroundColor: colors.card,
                    borderColor: colors.line,
                  },
                ]}
              >
                {/* Modal Header */}
                <View style={[styles.modalHeader, { borderBottomColor: colors.line }]}>
                  <Text style={[styles.modalTitle, { color: colors.ink }]}>
                    {modalTitle || selectedOption?.label}
                  </Text>
                  <TouchableOpacity
                    onPress={() => setModalVisible(false)}
                    style={styles.modalCloseBtn}
                    activeOpacity={0.7}
                  >
                    <X size={18} color={colors.muted} />
                  </TouchableOpacity>
                </View>

                {/* Option List */}
                <FlatList
                  data={options}
                  keyExtractor={(item) => item.value}
                  contentContainerStyle={styles.optionsList}
                  renderItem={({ item }) => {
                    const isSelected = item.value === selectedValue;
                    return (
                      <TouchableOpacity
                        onPress={() => handleSelect(item.value)}
                        style={[
                          styles.optionItem,
                          {
                            backgroundColor: isSelected ? colors.badgeBg : 'transparent',
                            borderColor: isSelected ? colors.clay : colors.line,
                          },
                        ]}
                        activeOpacity={0.7}
                      >
                        <Text
                          style={[
                            styles.optionLabel,
                            {
                              color: isSelected ? colors.clay : colors.ink,
                              fontWeight: isSelected ? '600' : '400',
                            },
                          ]}
                          numberOfLines={1}
                        >
                          {item.label}
                        </Text>

                        <View style={styles.optionRight}>
                          {item.badge && (
                            <Text
                              style={[
                                styles.optionBadge,
                                {
                                  color: colors.muted,
                                  backgroundColor: colors.paper,
                                },
                              ]}
                            >
                              {item.badge}
                            </Text>
                          )}
                          {isSelected && <Check size={16} color={colors.clay} />}
                        </View>
                      </TouchableOpacity>
                    );
                  }}
                />
              </View>
            </TouchableWithoutFeedback>
          </View>
        </TouchableWithoutFeedback>
      </Modal>
    </>
  );
}

const styles = StyleSheet.create({
  triggerBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderWidth: 1,
    borderRadius: 22,
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 3,
    elevation: 1,
  },
  triggerCompact: {
    paddingHorizontal: 10,
    height: 34,
  },
  triggerRegular: {
    paddingHorizontal: 16,
    height: 42,
    minWidth: 160,
    alignSelf: 'center',
  },
  triggerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    flexShrink: 1,
  },
  iconContainer: {
    marginRight: 2,
    flexShrink: 0,
  },
  triggerTextCompact: {
    fontSize: 12,
    fontWeight: '500',
    flexShrink: 1,
  },
  triggerTextRegular: {
    fontSize: 15,
    fontWeight: '600',
    flexShrink: 1,
  },
  chevron: {
    marginLeft: 6,
    flexShrink: 0,
  },
  modalBackdrop: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.45)',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 20,
  },
  modalContent: {
    width: '100%',
    maxWidth: 380,
    borderRadius: 24,
    borderWidth: 1,
    maxHeight: '80%',
    shadowOffset: { width: 0, height: 16 },
    shadowOpacity: 0.2,
    shadowRadius: 28,
    elevation: 8,
    overflow: 'hidden',
  },
  modalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 18,
    paddingVertical: 14,
    borderBottomWidth: 1,
  },
  modalTitle: {
    fontSize: 16,
    fontWeight: '600',
    fontFamily: Platform.OS === 'ios' ? 'Georgia' : 'serif',
  },
  modalCloseBtn: {
    padding: 4,
  },
  optionsList: {
    padding: 12,
    gap: 6,
  },
  optionItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 14,
    paddingVertical: 12,
    borderRadius: 14,
    borderWidth: 1,
  },
  optionLabel: {
    fontSize: 14,
    flexShrink: 1,
  },
  optionRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    flexShrink: 0,
  },
  optionBadge: {
    fontSize: 11,
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 8,
  },
});
