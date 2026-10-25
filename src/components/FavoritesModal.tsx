/**
 * FavoritesModal Component:
 * Dedicated drawer modal focused strictly on user-saved/favorited conversation cards.
 * Replaces the raw 700-question library browser to preserve mystery and serendipity of drawing cards.
 */
import React, { useMemo, useState } from 'react';
import {
  FlatList,
  Modal,
  Platform,
  SafeAreaView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { Bookmark, Search, X } from 'lucide-react-native';
import { LocaleKey, QuestionEntry, ThemeColors } from '../types';
import { I18nService } from '../services/i18n';
import {
  MARRIAGE_PACK_DATA,
  PARENTING_PACK_DATA,
  SENSUAL_PACK_DATA,
} from '../constants/packs';

interface FavoritesModalProps {
  visible: boolean;
  locale: LocaleKey;
  colors: ThemeColors;
  favorites: Record<string, boolean>;
  onClose: () => void;
  onSelectQuestion: (question: QuestionEntry) => void;
  onToggleFavorite?: (text: string) => void;
}

export const FavoritesModal: React.FC<FavoritesModalProps> = ({
  visible,
  locale,
  colors,
  favorites,
  onClose,
  onSelectQuestion,
  onToggleFavorite,
}) => {
  const [searchQuery, setSearchQuery] = useState('');

  // Collect all potential questions across core categories and expansion packs
  const allPossibleQuestions = useMemo<QuestionEntry[]>(() => {
    const core = I18nService.getQuestions(locale, 'all');

    const sensual = SENSUAL_PACK_DATA.map((item, idx) => ({
      id: `sensual-${idx + 1}`,
      categoryKey: 'intimacy' as const,
      categoryLabel: I18nService.t(locale, 'pack_sensual_title', '🔥 深夜私語'),
      text: locale === 'zh-TW' ? item.tw : locale === 'zh-CN' ? item.cn : item.en,
      index: idx + 1,
    }));

    const marriage = MARRIAGE_PACK_DATA.map((item, idx) => ({
      id: `marriage-${idx + 1}`,
      categoryKey: 'vision' as const,
      categoryLabel: I18nService.t(locale, 'pack_marriage_title', '💍 婚姻誓約前夕'),
      text: locale === 'zh-TW' ? item.tw : locale === 'zh-CN' ? item.cn : item.en,
      index: idx + 1,
    }));

    const parenting = PARENTING_PACK_DATA.map((item, idx) => ({
      id: `parenting-${idx + 1}`,
      categoryKey: 'growth' as const,
      categoryLabel: I18nService.t(locale, 'pack_parenting_title', '🌱 新生兒與新手父母'),
      text: locale === 'zh-TW' ? item.tw : locale === 'zh-CN' ? item.cn : item.en,
      index: idx + 1,
    }));

    return [...core, ...sensual, ...marriage, ...parenting];
  }, [locale]);

  // Filter only saved/favorited cards
  const savedQuestions = useMemo(() => {
    return allPossibleQuestions.filter((q) => Boolean(favorites[q.text]));
  }, [allPossibleQuestions, favorites]);

  // Filter by search query
  const displayedQuestions = useMemo(() => {
    const query = searchQuery.trim().toLowerCase();
    if (!query) return savedQuestions;
    return savedQuestions.filter((q) => q.text.toLowerCase().includes(query));
  }, [savedQuestions, searchQuery]);

  const title = I18nService.t(locale, 'favorites_title', '收藏的題目');
  const searchPlaceholder = I18nService.t(
    locale,
    'favorites_search_placeholder',
    '搜尋收藏的話題…'
  );
  const emptyTitle = I18nService.t(locale, 'favorites_empty_title', '尚未收藏任何題目');
  const emptyDesc = I18nService.t(
    locale,
    'favorites_empty_desc',
    '在抽卡聊天時，輕觸卡片右上角的書籤圖示 🔖，即可將有共鳴的話題珍藏在此。'
  );

  return (
    <Modal
      visible={visible}
      animationType="slide"
      transparent
      onRequestClose={onClose}
    >
      <View style={styles.overlay}>
        <SafeAreaView
          style={[
            styles.drawerContainer,
            { backgroundColor: colors.card, borderLeftColor: colors.line },
          ]}
        >
          {/* Header */}
          <View style={[styles.header, { borderBottomColor: colors.line }]}>
            <View style={styles.headerTitleRow}>
              <Bookmark size={20} color={colors.clay} fill={colors.clay} style={{ marginRight: 8 }} />
              <View>
                <Text style={[styles.title, { color: colors.ink }]}>{title}</Text>
                <Text style={[styles.counterText, { color: colors.muted }]}>
                  {savedQuestions.length > 0
                    ? `${displayedQuestions.length} / ${savedQuestions.length} 題`
                    : '0 題'}
                </Text>
              </View>
            </View>
            <TouchableOpacity
              onPress={onClose}
              style={styles.closeBtn}
              activeOpacity={0.7}
              accessibilityLabel="關閉收藏清單"
            >
              <X size={20} color={colors.muted} />
            </TouchableOpacity>
          </View>

          {/* Search bar (only if there are saved questions) */}
          {savedQuestions.length > 0 && (
            <View
              style={[
                styles.searchArea,
                { borderBottomColor: colors.line, backgroundColor: colors.paper },
              ]}
            >
              <View
                style={[
                  styles.searchBar,
                  { backgroundColor: colors.card, borderColor: colors.line },
                ]}
              >
                <Search size={16} color={colors.muted} style={{ marginRight: 8 }} />
                <TextInput
                  value={searchQuery}
                  onChangeText={setSearchQuery}
                  placeholder={searchPlaceholder}
                  placeholderTextColor={colors.muted}
                  style={[styles.searchInput, { color: colors.ink }]}
                  clearButtonMode="while-editing"
                />
              </View>
            </View>
          )}

          {/* Content List / Empty State */}
          {savedQuestions.length === 0 ? (
            <View style={styles.emptyContainer}>
              <View
                style={[
                  styles.emptyIconCircle,
                  { backgroundColor: colors.badgeBg },
                ]}
              >
                <Bookmark size={36} color={colors.clay} />
              </View>
              <Text style={[styles.emptyTitle, { color: colors.ink }]}>
                {emptyTitle}
              </Text>
              <Text style={[styles.emptyDesc, { color: colors.muted }]}>
                {emptyDesc}
              </Text>
            </View>
          ) : (
            <FlatList
              data={displayedQuestions}
              keyExtractor={(item) => item.id || item.text}
              contentContainerStyle={styles.listContent}
              showsVerticalScrollIndicator={false}
              renderItem={({ item }) => (
                <TouchableOpacity
                  onPress={() => {
                    onSelectQuestion(item);
                    onClose();
                  }}
                  style={[
                    styles.questionCard,
                    {
                      backgroundColor: colors.card,
                      borderColor: colors.line,
                    },
                  ]}
                  activeOpacity={0.75}
                >
                  <View style={styles.cardHeader}>
                    <View
                      style={[
                        styles.badge,
                        { backgroundColor: colors.badgeBg, borderColor: colors.line },
                      ]}
                    >
                      <Text style={[styles.badgeText, { color: colors.clay }]}>
                        {item.categoryLabel}
                      </Text>
                    </View>

                    {onToggleFavorite && (
                      <TouchableOpacity
                        onPress={(e) => {
                          e.stopPropagation();
                          onToggleFavorite(item.text);
                        }}
                        style={styles.favActionBtn}
                        hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
                      >
                        <Bookmark size={16} color={colors.clay} fill={colors.clay} />
                      </TouchableOpacity>
                    )}
                  </View>

                  <Text
                    style={[styles.questionText, { color: colors.ink }]}
                    numberOfLines={3}
                  >
                    {item.text}
                  </Text>
                </TouchableOpacity>
              )}
            />
          )}
        </SafeAreaView>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
    flexDirection: 'row',
  },
  drawerContainer: {
    width: '100%',
    maxWidth: Platform.OS === 'web' ? 440 : 380,
    height: '100%',
    borderLeftWidth: 1,
    display: 'flex',
    flexDirection: 'column',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
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
    fontWeight: '800',
    letterSpacing: 0.5,
  },
  counterText: {
    fontSize: 11,
    marginTop: 2,
    fontWeight: '600',
  },
  closeBtn: {
    padding: 8,
  },
  searchArea: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
  },
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: Platform.OS === 'ios' ? 10 : 6,
    borderRadius: 12,
    borderWidth: 1,
  },
  searchInput: {
    flex: 1,
    fontSize: 14,
    padding: 0,
  },
  listContent: {
    padding: 16,
    gap: 12,
  },
  questionCard: {
    padding: 16,
    borderRadius: 16,
    borderWidth: 1,
    gap: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 6,
    elevation: 2,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  badge: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
    borderWidth: 0.5,
  },
  badgeText: {
    fontSize: 11,
    fontWeight: '600',
  },
  favActionBtn: {
    padding: 4,
  },
  questionText: {
    fontSize: 14,
    lineHeight: 22,
    fontWeight: '500',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 36,
  },
  emptyIconCircle: {
    width: 72,
    height: 72,
    borderRadius: 36,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: '700',
    marginBottom: 8,
    textAlign: 'center',
  },
  emptyDesc: {
    fontSize: 13,
    lineHeight: 20,
    textAlign: 'center',
  },
});
