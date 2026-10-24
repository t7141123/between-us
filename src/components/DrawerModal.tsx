/**
 * DrawerModal Component: question library with search, category tags, and favorite filtering.
 */
import React, { useState, useMemo } from 'react';
import {
  View,
  Text,
  Modal,
  TextInput,
  TouchableOpacity,
  FlatList,
  StyleSheet,
  Platform,
  SafeAreaView,
  ScrollView,
} from 'react-native';
import { X, Search, Bookmark, ShieldCheck, Lock, Sparkles } from 'lucide-react-native';
import { LocaleKey, QuestionEntry, ThemeColors } from '../types';
import { I18nService } from '../services/i18n';
import { MARRIAGE_PACK_DATA, SENSUAL_PACK_DATA } from '../constants/packs';
import { InfoModal } from './InfoModal';

interface DrawerModalProps {
  visible: boolean;
  locale: LocaleKey;
  colors: ThemeColors;
  favorites: Record<string, boolean>;
  unlockedPacks?: string[];
  onClose: () => void;
  onSelectQuestion: (question: QuestionEntry) => void;
  onOpenStore?: () => void;
}

type DrawerTab = 'all' | 'fav' | 'sensual' | 'marriage';

export const DrawerModal: React.FC<DrawerModalProps> = ({
  visible,
  locale,
  colors,
  favorites,
  unlockedPacks = [],
  onClose,
  onSelectQuestion,
  onOpenStore,
}) => {
  const [activeTab, setActiveTab] = useState<DrawerTab>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [showInfoModal, setShowInfoModal] = useState(false);

  const isSensualUnlocked = unlockedPacks.includes('sensual');
  const isMarriageUnlocked = unlockedPacks.includes('marriage');

  const sensualQuestions = useMemo<QuestionEntry[]>(() => {
    return SENSUAL_PACK_DATA.map((item, idx) => ({
      id: `sensual-${idx + 1}`,
      categoryKey: 'intimacy',
      categoryLabel: I18nService.t(locale, 'pack_sensual_title', '🔥 深夜私語'),
      text: locale === 'zh-TW' ? item.tw : locale === 'zh-CN' ? item.cn : item.en,
      index: idx + 1,
    }));
  }, [locale]);

  const marriageQuestions = useMemo<QuestionEntry[]>(() => {
    return MARRIAGE_PACK_DATA.map((item, idx) => ({
      id: `marriage-${idx + 1}`,
      categoryKey: 'vision',
      categoryLabel: I18nService.t(locale, 'pack_marriage_title', '💍 婚姻誓約前夕'),
      text: locale === 'zh-TW' ? item.tw : locale === 'zh-CN' ? item.cn : item.en,
      index: idx + 1,
    }));
  }, [locale]);

  const currentDeck = useMemo<QuestionEntry[]>(() => {
    if (activeTab === 'sensual') {
      return sensualQuestions;
    }
    if (activeTab === 'marriage') {
      return marriageQuestions;
    }
    const all = I18nService.getQuestions(locale, 'all');
    if (activeTab === 'fav') {
      return all.filter((item) => favorites[item.text]);
    }
    return all;
  }, [activeTab, locale, sensualQuestions, marriageQuestions, favorites]);

  const filteredQuestions = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    if (!q) return currentDeck;
    return currentDeck.filter((item) => item.text.toLowerCase().includes(q));
  }, [currentDeck, searchQuery]);

  const drawerTitle = I18nService.t(locale, 'drawer_title', '題庫抽屜');
  const allLabel = I18nService.t(locale, 'drawer_all', '全部');
  const favLabel = I18nService.t(locale, 'drawer_fav', '僅看收藏');
  const searchPlaceholder = I18nService.t(locale, 'search_placeholder', '搜尋問題…');
  const emptyText = I18nService.t(locale, 'deck_empty', '目前沒有符合的題目');
  const privacyLabel = I18nService.t(locale, 'privacy_policy', '隱私政策與條款');

  const handleItemPress = (item: QuestionEntry) => {
    const isSensualItem = item.id.startsWith('sensual-');
    const isMarriageItem = item.id.startsWith('marriage-');

    if (isSensualItem && !isSensualUnlocked) {
      if (item.index <= 3) {
        onSelectQuestion(item);
      } else {
        onOpenStore?.();
      }
      return;
    }

    if (isMarriageItem && !isMarriageUnlocked) {
      if (item.index <= 3) {
        onSelectQuestion(item);
      } else {
        onOpenStore?.();
      }
      return;
    }

    onSelectQuestion(item);
  };

  return (
    <Modal
      visible={visible}
      animationType="slide"
      transparent
      onRequestClose={onClose}
    >
      <View style={styles.overlay}>
        <SafeAreaView style={[styles.drawerContainer, { backgroundColor: colors.card, borderLeftColor: colors.line }]}>
          {/* Header */}
          <View style={[styles.header, { borderBottomColor: colors.line }]}>
            <View>
              <Text style={[styles.title, { color: colors.ink }]}>{drawerTitle}</Text>
              <Text style={[styles.counterText, { color: colors.muted }]}>
                {filteredQuestions.length} / {currentDeck.length}
              </Text>
            </View>
            <TouchableOpacity onPress={onClose} style={styles.closeBtn} activeOpacity={0.7}>
              <X size={20} color={colors.muted} />
            </TouchableOpacity>
          </View>

          {/* Scope Filters & Search */}
          <View style={[styles.searchArea, { borderBottomColor: colors.line, backgroundColor: colors.paper }]}>
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.filterRow}
            >
              <TouchableOpacity
                onPress={() => setActiveTab('all')}
                style={[
                  styles.filterBtn,
                  activeTab === 'all'
                    ? { backgroundColor: colors.clay }
                    : { borderColor: colors.line, backgroundColor: colors.card },
                ]}
                activeOpacity={0.7}
              >
                <Text style={[styles.filterBtnText, { color: activeTab === 'all' ? '#FFFFFF' : colors.muted }]}>
                  {allLabel} (700)
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                onPress={() => setActiveTab('fav')}
                style={[
                  styles.filterBtn,
                  activeTab === 'fav'
                    ? { backgroundColor: colors.clay }
                    : { borderColor: colors.line, backgroundColor: colors.card },
                ]}
                activeOpacity={0.7}
              >
                <Text style={[styles.filterBtnText, { color: activeTab === 'fav' ? '#FFFFFF' : colors.muted }]}>
                  {favLabel}
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                onPress={() => setActiveTab('sensual')}
                style={[
                  styles.filterBtn,
                  activeTab === 'sensual'
                    ? { backgroundColor: colors.clay }
                    : { borderColor: colors.line, backgroundColor: colors.card },
                ]}
                activeOpacity={0.7}
              >
                <Text style={[styles.filterBtnText, { color: activeTab === 'sensual' ? '#FFFFFF' : colors.muted }]}>
                  {I18nService.t(locale, 'pack_sensual_title', '🔥 深夜私語')}{!isSensualUnlocked ? ' 🔒' : ''}
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                onPress={() => setActiveTab('marriage')}
                style={[
                  styles.filterBtn,
                  activeTab === 'marriage'
                    ? { backgroundColor: colors.clay }
                    : { borderColor: colors.line, backgroundColor: colors.card },
                ]}
                activeOpacity={0.7}
              >
                <Text style={[styles.filterBtnText, { color: activeTab === 'marriage' ? '#FFFFFF' : colors.muted }]}>
                  {I18nService.t(locale, 'pack_marriage_title', '💍 婚姻誓約')}{!isMarriageUnlocked ? ' 🔒' : ''}
                </Text>
              </TouchableOpacity>
            </ScrollView>

            <View style={[styles.searchBar, { borderColor: colors.line, backgroundColor: colors.card }]}>
              <Search size={15} color={colors.muted} style={{ marginRight: 8 }} />
              <TextInput
                style={[styles.searchInput, { color: colors.ink }]}
                placeholder={searchPlaceholder}
                placeholderTextColor={colors.muted}
                value={searchQuery}
                onChangeText={setSearchQuery}
                clearButtonMode="while-editing"
              />
              {searchQuery.length > 0 && (
                <TouchableOpacity
                  onPress={() => setSearchQuery('')}
                  style={styles.clearSearchBtn}
                  hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
                  accessibilityLabel="清空搜尋"
                >
                  <X size={14} color={colors.muted} />
                </TouchableOpacity>
              )}
            </View>
          </View>

          {/* Question List */}
          <FlatList
            data={filteredQuestions}
            keyExtractor={(item) => item.id}
            contentContainerStyle={styles.listContent}
            renderItem={({ item }) => {
              const isFav = Boolean(favorites[item.text]);
              const isSensualItem = item.id.startsWith('sensual-');
              const isMarriageItem = item.id.startsWith('marriage-');
              const isLocked =
                (isSensualItem && !isSensualUnlocked && item.index > 3) ||
                (isMarriageItem && !isMarriageUnlocked && item.index > 3);
              const isTrial =
                (isSensualItem && !isSensualUnlocked && item.index <= 3) ||
                (isMarriageItem && !isMarriageUnlocked && item.index <= 3);

              return (
                <TouchableOpacity
                  onPress={() => handleItemPress(item)}
                  style={[
                    styles.itemCard,
                    {
                      borderColor: colors.line,
                      backgroundColor: colors.card,
                      opacity: isLocked ? 0.72 : 1,
                    },
                  ]}
                  activeOpacity={0.7}
                >
                  <View style={styles.itemTextContainer}>
                    <View style={styles.tagRow}>
                      <Text style={[styles.itemTag, { color: colors.clay, backgroundColor: colors.badgeBg }]}>
                        {item.categoryLabel}
                      </Text>
                      {isTrial && (
                        <Text style={[styles.trialBadge, { backgroundColor: colors.clay }]}>
                          {I18nService.t(locale, 'pack_trial_tag', '試讀')}
                        </Text>
                      )}
                      {isLocked && (
                        <View style={styles.lockBadge}>
                          <Lock size={11} color={colors.muted} />
                        </View>
                      )}
                    </View>
                    <Text
                      style={[
                        styles.itemQuestion,
                        { color: isLocked ? colors.muted : colors.ink },
                        isLocked && styles.itemQuestionLocked,
                      ]}
                    >
                      {isLocked
                        ? I18nService.t(locale, 'pack_locked_hint', '🔒 專題包專屬題目，點擊解鎖全部 50 題')
                        : item.text}
                    </Text>
                  </View>
                  {isFav && !isLocked && (
                    <Bookmark size={15} color={colors.clay} fill={colors.clay} style={{ marginLeft: 8 }} />
                  )}
                  {isLocked && (
                    <View style={[styles.unlockHintBtn, { borderColor: colors.clay }]}>
                      <Sparkles size={12} color={colors.clay} />
                    </View>
                  )}
                </TouchableOpacity>
              );
            }}
            ListEmptyComponent={
              <View style={styles.emptyContainer}>
                <Text style={[styles.emptyText, { color: colors.muted }]}>{emptyText}</Text>
              </View>
            }
          />
          {/* Drawer Footer: Privacy & Terms */}
          <View style={[styles.drawerFooter, { borderTopColor: colors.line, backgroundColor: colors.paper }]}>
            <TouchableOpacity
              onPress={() => setShowInfoModal(true)}
              style={styles.privacyLinkBtn}
              activeOpacity={0.7}
            >
              <ShieldCheck size={14} color={colors.clay} style={{ marginRight: 6 }} />
              <Text style={[styles.privacyLinkText, { color: colors.clay }]}>{privacyLabel}</Text>
            </TouchableOpacity>
            <Text style={[styles.footerVersionText, { color: colors.muted }]}>v1.0.0</Text>
          </View>
        </SafeAreaView>
      </View>

      {/* Privacy Policy & Terms Modal */}
      <InfoModal
        visible={showInfoModal}
        locale={locale}
        colors={colors}
        onClose={() => setShowInfoModal(false)}
      />
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.45)',
    flexDirection: 'row',
    justifyContent: 'flex-end',
  },
  drawerContainer: {
    width: Platform.OS === 'web' ? 440 : '100%',
    maxWidth: '100%',
    height: '100%',
    borderLeftWidth: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
  },
  title: {
    fontSize: 20,
    fontWeight: '500',
    fontFamily: Platform.OS === 'ios' ? 'Georgia' : 'serif',
  },
  counterText: {
    fontSize: 11,
    marginTop: 2,
  },
  closeBtn: {
    padding: 6,
  },
  searchArea: {
    paddingHorizontal: 16,
    paddingVertical: 14,
    borderBottomWidth: 1,
    gap: 12,
  },
  filterRow: {
    flexDirection: 'row',
    gap: 8,
    paddingBottom: 2,
  },
  filterBtn: {
    paddingHorizontal: 14,
    paddingVertical: 7,
    borderRadius: 18,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  filterBtnText: {
    fontSize: 12,
    fontWeight: '500',
  },
  tagRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 6,
  },
  trialBadge: {
    color: '#FFFFFF',
    fontSize: 9,
    fontWeight: '700',
    paddingHorizontal: 6,
    paddingVertical: 1.5,
    borderRadius: 8,
  },
  lockBadge: {
    paddingHorizontal: 4,
  },
  unlockHintBtn: {
    width: 28,
    height: 28,
    borderRadius: 14,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
    marginLeft: 8,
  },
  itemQuestionLocked: {
    fontStyle: 'italic',
    fontSize: 13,
  },
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderRadius: 14,
    paddingHorizontal: 12,
    height: 38,
  },
  searchInput: {
    flex: 1,
    fontSize: 13,
    padding: 0,
  },
  clearSearchBtn: {
    padding: 4,
    marginLeft: 6,
  },
  listContent: {
    padding: 16,
    gap: 10,
  },
  itemCard: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 14,
    borderRadius: 16,
    borderWidth: 1,
  },
  itemTextContainer: {
    flex: 1,
  },
  itemTag: {
    alignSelf: 'flex-start',
    fontSize: 10,
    fontWeight: '600',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 10,
    marginBottom: 6,
  },
  itemQuestion: {
    fontSize: 14,
    lineHeight: 21,
    fontFamily: Platform.OS === 'ios' ? 'Georgia' : 'serif',
  },
  emptyContainer: {
    paddingVertical: 48,
    alignItems: 'center',
    justifyContent: 'center',
  },
  emptyText: {
    fontSize: 13,
  },
  drawerFooter: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 14,
    borderTopWidth: 1,
  },
  privacyLinkBtn: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  privacyLinkText: {
    fontSize: 13,
    fontWeight: '600',
  },
  footerVersionText: {
    fontSize: 12,
  },
});
