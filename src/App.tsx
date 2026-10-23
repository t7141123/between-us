/**
 * Main Application View for Between Us.
 * Seamlessly coordinates themes, locales, question decks, gestures and modals.
 */
import React, { useState, useEffect, useCallback, useMemo } from 'react';
import {
  SafeAreaView,
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Platform,
  StatusBar,
  ScrollView,
  useWindowDimensions,
} from 'react-native';
import { Shuffle, BookOpen } from 'lucide-react-native';
import confetti from 'canvas-confetti';

import { LocaleKey, CategoryFilter, QuestionEntry } from './types';
import { useTheme } from './hooks/useTheme';
import { useSound } from './hooks/useSound';
import { useHaptics } from './hooks/useHaptics';
import { I18nService } from './services/i18n';
import { StorageService } from './services/storage';
import { TelemetryService } from './services/telemetry';

import { HeaderBar } from './components/HeaderBar';
import { CategorySelect } from './components/CategorySelect';
import { Card3D } from './components/Card3D';
import { DrawerModal } from './components/DrawerModal';
import { TimerModal } from './components/TimerModal';

export const MainApp: React.FC = () => {
  const { width, height } = useWindowDimensions();
  const isMobile = width < 600 || height < 750;

  const { isDark, colors, toggleTheme } = useTheme();
  const { muted, toggleMute, playFlip, playClick, playSuccess } = useSound();
  const { triggerImpact, triggerNotification } = useHaptics();

  const [locale, setLocale] = useState<LocaleKey>('zh-TW');
  const [currentCategory, setCurrentCategory] = useState<CategoryFilter>('all');
  const [favorites, setFavorites] = useState<Record<string, boolean>>({});
  const [deck, setDeck] = useState<QuestionEntry[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);

  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [isTimerOpen, setIsTimerOpen] = useState(false);

  // Load initial settings & track pageview
  useEffect(() => {
    let mounted = true;
    Promise.all([
      StorageService.getLocale('zh-TW'),
      StorageService.getFavorites(),
    ]).then(([savedLocale, savedFavs]) => {
      if (!mounted) return;
      setLocale(savedLocale);
      setFavorites(savedFavs);
      TelemetryService.track({ eventName: 'pageview', language: savedLocale });
    });
    return () => {
      mounted = false;
    };
  }, []);

  // Fisher-Yates array shuffle
  const shuffleDeck = useCallback((items: QuestionEntry[]) => {
    const arr = [...items];
    for (let i = arr.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [arr[i], arr[j]] = [arr[j], arr[i]];
    }
    return arr;
  }, []);

  // Rebuild deck when locale or category changes
  useEffect(() => {
    const rawQuestions = I18nService.getQuestions(locale, currentCategory);
    setDeck(shuffleDeck(rawQuestions));
    setCurrentIndex(0);
  }, [locale, currentCategory, shuffleDeck]);

  const currentQuestion = useMemo(() => {
    if (deck.length === 0) return null;
    return deck[currentIndex] ?? null;
  }, [deck, currentIndex]);

  const handleNextQuestion = useCallback(() => {
    playClick();
    triggerImpact();
    if (deck.length === 0) return;
    TelemetryService.track({
      eventName: 'next_question',
      category: currentCategory,
      language: locale,
    });
    setCurrentIndex((prev) => (prev + 1) % deck.length);
  }, [deck.length, playClick, triggerImpact, currentCategory, locale]);

  const handleToggleFavorite = useCallback(() => {
    if (!currentQuestion) return;
    playClick();
    triggerNotification();
    TelemetryService.track({
      eventName: 'toggle_favorite',
      category: currentQuestion.categoryKey,
      language: locale,
    });

    setFavorites((prev) => {
      const next = { ...prev };
      if (next[currentQuestion.text]) {
        delete next[currentQuestion.text];
      } else {
        next[currentQuestion.text] = true;
        if (Platform.OS === 'web' && typeof confetti === 'function') {
          confetti({
            particleCount: 30,
            spread: 50,
            origin: { y: 0.65 },
            colors: ['#C87D65', '#D4AF37', '#78726D'],
          });
        }
      }
      StorageService.setFavorites(next);
      return next;
    });
  }, [currentQuestion, playClick, triggerNotification, locale]);

  const handleSelectLocale = useCallback((newLocale: LocaleKey) => {
    setLocale(newLocale);
    StorageService.setLocale(newLocale);
    TelemetryService.track({ eventName: 'change_language', language: newLocale });
  }, []);

  const handleFlipCard = useCallback(() => {
    playFlip();
    TelemetryService.track({
      eventName: 'flip_card',
      category: currentQuestion?.categoryKey,
      language: locale,
    });
  }, [playFlip, currentQuestion?.categoryKey, locale]);

  const handleSelectFromDrawer = useCallback((item: QuestionEntry) => {
    setIsDrawerOpen(false);
    setCurrentCategory(item.categoryKey);
    TelemetryService.track({
      eventName: 'change_category',
      category: item.categoryKey,
      language: locale,
    });
    const questions = I18nService.getQuestions(locale, item.categoryKey);
    setDeck(questions);
    const foundIdx = questions.findIndex((q) => q.text === item.text);
    setCurrentIndex(foundIdx >= 0 ? foundIdx : 0);
  }, [locale]);

  // Global keyboard shortcuts for web desktop
  useEffect(() => {
    if (Platform.OS !== 'web' || typeof window === 'undefined') return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (['INPUT', 'TEXTAREA'].includes((e.target as HTMLElement)?.tagName)) {
        return;
      }
      if (e.key === 'ArrowRight' || e.key === 'Enter') {
        handleNextQuestion();
      } else if (e.key.toLowerCase() === 'f') {
        handleToggleFavorite();
      } else if (e.key.toLowerCase() === 't') {
        setIsTimerOpen(true);
      } else if (e.key === 'Escape') {
        setIsDrawerOpen(false);
        setIsTimerOpen(false);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [handleNextQuestion, handleToggleFavorite]);

  const nextBtnText = I18nService.t(locale, 'next_question', '換一題');
  const drawerBtnText = I18nService.t(locale, 'drawer_btn', '從題庫挑');
  const keyboardHint =
    isMobile || Platform.OS !== 'web'
      ? I18nService.t(locale, 'mobile_hint', '輕觸翻牌 ｜ 滑動換題 ｜ 點擊收藏')
      : I18nService.t(locale, 'keyboard_hint', '空白鍵：翻牌 ｜ →：換一題 ｜ F：收藏 ｜ T：計時器');

  return (
    <SafeAreaView style={[styles.safeArea, { backgroundColor: colors.paper }]}>
      <StatusBar barStyle={isDark ? 'light-content' : 'dark-content'} backgroundColor={colors.paper} />

      <ScrollView
        contentContainerStyle={[styles.mainContainer, isMobile && styles.mainContainerMobile]}
        bounces={false}
        showsVerticalScrollIndicator={false}
      >
        {/* Header Bar */}
        <HeaderBar
          locale={locale}
          colors={colors}
          isDark={isDark}
          muted={muted}
          onToggleTheme={toggleTheme}
          onToggleMute={toggleMute}
          onSelectLocale={handleSelectLocale}
        />

        {/* Category Dropdown Select */}
        <CategorySelect
          currentCategory={currentCategory}
          locale={locale}
          colors={colors}
          onSelectCategory={(cat) => {
            playClick();
            setCurrentCategory(cat);
            TelemetryService.track({
              eventName: 'change_category',
              category: cat,
              language: locale,
            });
          }}
        />

        {/* 3D Flippable Question Card */}
        <View style={[styles.cardWrapper, isMobile && styles.cardWrapperMobile]}>
          <Card3D
            question={currentQuestion}
            totalInDeck={deck.length}
            currentIndex={currentIndex}
            locale={locale}
            colors={colors}
            isFavorite={Boolean(currentQuestion && favorites[currentQuestion.text])}
            onToggleFavorite={handleToggleFavorite}
            onOpenTimer={() => {
              playClick();
              setIsTimerOpen(true);
              TelemetryService.track({
                eventName: 'start_timer',
                category: currentCategory,
                language: locale,
              });
            }}
            onNextQuestion={handleNextQuestion}
            onFlipCard={handleFlipCard}
          />
        </View>

        {/* Primary Action Buttons */}
        <View style={[styles.actionsContainer, isMobile && styles.actionsContainerMobile]}>
          <TouchableOpacity
            style={[
              styles.primaryActionBtn,
              isMobile && styles.actionBtnMobile,
              { backgroundColor: colors.clay },
            ]}
            onPress={handleNextQuestion}
            activeOpacity={0.8}
          >
            <Shuffle size={16} color="#FFFFFF" style={{ marginRight: 6 }} />
            <Text style={styles.primaryActionText} numberOfLines={1}>
              {nextBtnText}
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[
              styles.secondaryActionBtn,
              isMobile && styles.actionBtnMobile,
              { borderColor: colors.line, backgroundColor: colors.card },
            ]}
            onPress={() => {
              playClick();
              setIsDrawerOpen(true);
            }}
            activeOpacity={0.8}
          >
            <BookOpen size={16} color={colors.clay} style={{ marginRight: 6 }} />
            <Text
              style={[styles.secondaryActionText, { color: colors.ink }]}
              numberOfLines={1}
            >
              {drawerBtnText}
            </Text>
          </TouchableOpacity>
        </View>

        {/* Hint Footer */}
        <View style={styles.hintContainer}>
          <Text
            style={[
              styles.hintText,
              { color: colors.muted, fontSize: isMobile ? 11 : 12 },
            ]}
            numberOfLines={1}
          >
            {keyboardHint}
          </Text>
        </View>
      </ScrollView>

      {/* Drawer Modal */}
      <DrawerModal
        visible={isDrawerOpen}
        locale={locale}
        colors={colors}
        favorites={favorites}
        onClose={() => setIsDrawerOpen(false)}
        onSelectQuestion={handleSelectFromDrawer}
      />

      {/* Timer Modal */}
      <TimerModal
        visible={isTimerOpen}
        locale={locale}
        colors={colors}
        onClose={() => setIsTimerOpen(false)}
        onPlaySuccessSound={playSuccess}
      />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
  },
  mainContainer: {
    flexGrow: 1,
    width: '100%',
    maxWidth: 680,
    alignSelf: 'center',
    justifyContent: 'space-between',
    paddingBottom: Platform.OS === 'ios' ? 12 : 18,
  },
  mainContainerMobile: {
    paddingBottom: 8,
  },
  cardWrapper: {
    flex: 1,
    justifyContent: 'center',
    paddingHorizontal: 20,
    width: '100%',
  },
  cardWrapperMobile: {
    paddingHorizontal: 12,
  },
  actionsContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 12,
    paddingHorizontal: 20,
    marginVertical: 12,
  },
  actionsContainerMobile: {
    gap: 8,
    marginVertical: 6,
    paddingHorizontal: 12,
  },
  primaryActionBtn: {
    flex: 1,
    maxWidth: 180,
    height: 48,
    borderRadius: 24,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 4,
  },
  actionBtnMobile: {
    height: 42,
    maxWidth: 150,
  },
  primaryActionText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '600',
    letterSpacing: 0.5,
  },
  secondaryActionBtn: {
    flex: 1,
    maxWidth: 180,
    height: 48,
    borderRadius: 24,
    borderWidth: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  secondaryActionText: {
    fontSize: 14,
    fontWeight: '500',
    letterSpacing: 0.5,
  },
  hintContainer: {
    alignItems: 'center',
    paddingVertical: 4,
  },
  hintText: {
    fontSize: 11,
    letterSpacing: 0.8,
  },
});
