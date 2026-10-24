/**
 * Main Application View for Between Us.
 * Seamlessly coordinates themes, locales, question decks, gestures and modals.
 */
import React, { useState, useEffect, useCallback, useMemo, useRef } from 'react';
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

import { LocaleKey, CategoryFilter, QuestionEntry, CardSkinId } from './types';
import { useTheme } from './hooks/useTheme';
import { useSound } from './hooks/useSound';
import { useHaptics } from './hooks/useHaptics';
import { I18nService } from './services/i18n';
import { StorageService } from './services/storage';
import { TelemetryService } from './services/telemetry';
import { PaymentService } from './services/payment';
import { MARRIAGE_PACK_DATA, SENSUAL_PACK_DATA } from './constants/packs';

import { HeaderBar } from './components/HeaderBar';
import { CategorySelect } from './components/CategorySelect';
import { Card3D, Card3DHandle } from './components/Card3D';
import { DrawerModal } from './components/DrawerModal';
import { TimerModal } from './components/TimerModal';
import { StoreModal } from './components/StoreModal';
import { AuthModal } from './components/AuthModal';
import { AuthService, AuthUser } from './services/auth';

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

  const [unlockedPacks, setUnlockedPacks] = useState<string[]>([]);
  const [selectedSkin, setSelectedSkin] = useState<CardSkinId>('classic');
  const [isSupporter, setIsSupporter] = useState(false);
  const [currentUser, setCurrentUser] = useState<AuthUser | null>(null);

  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [isTimerOpen, setIsTimerOpen] = useState(false);
  const [isStoreOpen, setIsStoreOpen] = useState(false);
  const [isAuthOpen, setIsAuthOpen] = useState(false);

  const cardRef = useRef<Card3DHandle>(null);

  // Load initial settings & initialize session duration telemetry
  useEffect(() => {
    let mounted = true;
    TelemetryService.initSession();
    Promise.all([
      StorageService.getLocale('zh-TW'),
      StorageService.getFavorites(),
      StorageService.getUnlockedPacks(),
      StorageService.getCardSkin('classic'),
      StorageService.getIsSupporter(),
      StorageService.getAuthUser(),
    ]).then(([savedLocale, savedFavs, savedPacks, savedSkin, savedSupporter, savedUser]) => {
      if (!mounted) return;
      setLocale(savedLocale);
      setFavorites(savedFavs);
      setUnlockedPacks(savedPacks);
      setSelectedSkin(savedSkin);
      setIsSupporter(savedSupporter);
      if (savedUser) {
        setCurrentUser(savedUser);
        // Silently sync latest entitlements from cloud on startup
        AuthService.syncCloudEntitlements(savedUser.id).then((cloud) => {
          if (!mounted || !cloud) return;
          if (cloud.unlockedPacks.length > 0) {
            setUnlockedPacks(cloud.unlockedPacks);
          }
          if (cloud.isSupporter) {
            setIsSupporter(true);
          }
        });
      }
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
    setCurrentIndex((prev) => (prev + 1) % deck.length);
  }, [deck.length, playClick, triggerImpact]);

  const handleToggleFavorite = useCallback(() => {
    if (!currentQuestion) return;
    playClick();
    triggerNotification();

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
  }, [currentQuestion, playClick, triggerNotification]);

  const handleSelectLocale = useCallback((newLocale: LocaleKey) => {
    setLocale(newLocale);
    StorageService.setLocale(newLocale);
  }, []);

  const handleSelectSkin = useCallback((skinId: CardSkinId) => {
    playClick();
    setSelectedSkin(skinId);
    StorageService.setCardSkin(skinId);
  }, [playClick]);

  const handleUnlockPack = useCallback((packId: string) => {
    playSuccess();
    triggerNotification();
    StorageService.unlockPack(packId).then((updated) => {
      setUnlockedPacks(updated);
    });
  }, [playSuccess, triggerNotification]);

  const handleSetSupporter = useCallback((supporter: boolean) => {
    playSuccess();
    triggerNotification();
    setIsSupporter(supporter);
    StorageService.setIsSupporter(supporter);
  }, [playSuccess, triggerNotification]);

  const handleLoadPackSample = useCallback((packId: string) => {
    playClick();
    if (packId === 'sensual') {
      const isUnlocked = unlockedPacks.includes('sensual');
      const packQuestions = SENSUAL_PACK_DATA.map((item, idx) => ({
        id: `sensual-${idx + 1}`,
        categoryKey: 'intimacy' as const,
        categoryLabel: I18nService.t(locale, 'pack_sensual_title', '🔥 深夜私語'),
        text: locale === 'zh-TW' ? item.tw : locale === 'zh-CN' ? item.cn : item.en,
        index: idx + 1,
      }));

      if (isUnlocked) {
        setDeck(shuffleDeck(packQuestions));
      } else {
        const trials = packQuestions.slice(0, 3);
        const lockCard: QuestionEntry = {
          id: 'sensual-lock',
          categoryKey: 'intimacy' as const,
          categoryLabel: I18nService.t(locale, 'pack_sensual_title', '🔥 深夜私語'),
          text: I18nService.t(locale, 'trial_ended_hint'),
          index: 4,
        };
        setDeck([...trials, lockCard]);
      }
      setCurrentIndex(0);
    } else if (packId === 'marriage') {
      const isUnlocked = unlockedPacks.includes('marriage');
      const packQuestions = MARRIAGE_PACK_DATA.map((item, idx) => ({
        id: `marriage-${idx + 1}`,
        categoryKey: 'vision' as const,
        categoryLabel: I18nService.t(locale, 'pack_marriage_title', '💍 婚姻誓約前夕'),
        text: locale === 'zh-TW' ? item.tw : locale === 'zh-CN' ? item.cn : item.en,
        index: idx + 1,
      }));

      if (isUnlocked) {
        setDeck(shuffleDeck(packQuestions));
      } else {
        const trials = packQuestions.slice(0, 3);
        const lockCard: QuestionEntry = {
          id: 'marriage-lock',
          categoryKey: 'vision' as const,
          categoryLabel: I18nService.t(locale, 'pack_marriage_title', '💍 婚姻誓約前夕'),
          text: I18nService.t(locale, 'trial_ended_hint'),
          index: 4,
        };
        setDeck([...trials, lockCard]);
      }
      setCurrentIndex(0);
    }
  }, [locale, playClick, shuffleDeck, unlockedPacks]);

  const handleFlipCard = useCallback(() => {
    playFlip();
  }, [playFlip]);

  const handleSelectFromDrawer = useCallback((item: QuestionEntry) => {
    setIsDrawerOpen(false);

    if (item.id.startsWith('sensual-')) {
      const packQuestions = SENSUAL_PACK_DATA.map((p, idx) => ({
        id: `sensual-${idx + 1}`,
        categoryKey: 'intimacy' as const,
        categoryLabel: I18nService.t(locale, 'pack_sensual_title', '🔥 深夜私語'),
        text: locale === 'zh-TW' ? p.tw : locale === 'zh-CN' ? p.cn : p.en,
        index: idx + 1,
      }));
      setDeck(packQuestions);
      const foundIdx = packQuestions.findIndex((q) => q.text === item.text);
      setCurrentIndex(foundIdx >= 0 ? foundIdx : 0);
      return;
    }

    if (item.id.startsWith('marriage-')) {
      const packQuestions = MARRIAGE_PACK_DATA.map((p, idx) => ({
        id: `marriage-${idx + 1}`,
        categoryKey: 'vision' as const,
        categoryLabel: I18nService.t(locale, 'pack_marriage_title', '💍 婚姻誓約前夕'),
        text: locale === 'zh-TW' ? p.tw : locale === 'zh-CN' ? p.cn : p.en,
        index: idx + 1,
      }));
      setDeck(packQuestions);
      const foundIdx = packQuestions.findIndex((q) => q.text === item.text);
      setCurrentIndex(foundIdx >= 0 ? foundIdx : 0);
      return;
    }

    setCurrentCategory(item.categoryKey);
    const questions = I18nService.getQuestions(locale, item.categoryKey);
    setDeck(questions);
    const foundIdx = questions.findIndex((q) => q.text === item.text);
    setCurrentIndex(foundIdx >= 0 ? foundIdx : 0);
  }, [locale]);

  const handleLogout = useCallback(() => {
    AuthService.logout().then(() => {
      setCurrentUser(null);
    });
  }, []);

  const handleUserChanged = useCallback((user: AuthUser | null) => {
    setCurrentUser(user);
  }, []);

  const handleSyncComplete = useCallback((packs: string[], supporter: boolean) => {
    setUnlockedPacks(packs);
    setIsSupporter(supporter);
    if (Platform.OS === 'web' && typeof confetti === 'function') {
      confetti({
        particleCount: 50,
        spread: 60,
        origin: { y: 0.6 },
        colors: ['#C87D65', '#D4AF37', '#78726D'],
      });
    }
  }, []);

  // Handle return from ECPay payment gateway on Web
  useEffect(() => {
    if (Platform.OS !== 'web' || typeof window === 'undefined') return;

    const urlParams = new URLSearchParams(window.location.search);
    const payment = urlParams.get('payment');
    const orderId = urlParams.get('orderId');

    if (payment === 'success' && orderId) {
      PaymentService.verifyOrder(orderId).then((res) => {
        if (res && res.paid) {
          if (res.type === 'pack' && res.target) {
            handleUnlockPack(res.target);
          } else if (res.type === 'supporter') {
            handleSetSupporter(true);
          }
          if (currentUser) {
            AuthService.claimOrder(currentUser.id, orderId);
          }
          if (typeof confetti === 'function') {
            confetti({
              particleCount: 60,
              spread: 70,
              origin: { y: 0.6 },
              colors: ['#C87D65', '#D4AF37', '#78726D'],
            });
          }
        }
      });
      window.history.replaceState({}, document.title, window.location.pathname);
    } else if (payment === 'cancelled' || payment === 'failed') {
      window.history.replaceState({}, document.title, window.location.pathname);
    }
  }, [currentUser, handleSetSupporter, handleUnlockPack]);

  // Global keyboard shortcuts for web desktop
  useEffect(() => {
    if (Platform.OS !== 'web' || typeof window === 'undefined') return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (['INPUT', 'TEXTAREA'].includes((e.target as HTMLElement)?.tagName)) {
        return;
      }
      if (e.code === 'Space' || e.key === ' ') {
        e.preventDefault();
        cardRef.current?.flip();
      } else if (e.key === 'ArrowRight' || e.key === 'Enter') {
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
          isSupporter={isSupporter}
          onToggleTheme={toggleTheme}
          onToggleMute={toggleMute}
          onSelectLocale={handleSelectLocale}
          onOpenStore={() => {
            playClick();
            setIsStoreOpen(true);
          }}
        />

        {/* Category Dropdown Select */}
        <CategorySelect
          currentCategory={currentCategory}
          locale={locale}
          colors={colors}
          onSelectCategory={(cat) => {
            playClick();
            setCurrentCategory(cat);
          }}
        />

        {/* 3D Flippable Question Card */}
        <View style={[styles.cardWrapper, isMobile && styles.cardWrapperMobile]}>
          <Card3D
            ref={cardRef}
            question={currentQuestion}
            totalInDeck={deck.length}
            currentIndex={currentIndex}
            locale={locale}
            colors={colors}
            skinId={selectedSkin}
            isFavorite={Boolean(currentQuestion && favorites[currentQuestion.text])}
            onToggleFavorite={handleToggleFavorite}
            onOpenTimer={() => {
              playClick();
              setIsTimerOpen(true);
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
        unlockedPacks={unlockedPacks}
        onClose={() => setIsDrawerOpen(false)}
        onSelectQuestion={handleSelectFromDrawer}
        onOpenStore={() => setIsStoreOpen(true)}
      />

      {/* Timer Modal */}
      <TimerModal
        visible={isTimerOpen}
        locale={locale}
        colors={colors}
        onClose={() => setIsTimerOpen(false)}
        onPlaySuccessSound={playSuccess}
      />

      {/* Store Modal */}
      <StoreModal
        visible={isStoreOpen}
        locale={locale}
        onClose={() => setIsStoreOpen(false)}
        theme={isDark ? 'dark' : 'light'}
        colors={colors}
        unlockedPacks={unlockedPacks}
        selectedSkin={selectedSkin}
        isSupporter={isSupporter}
        currentUser={currentUser}
        onSelectSkin={handleSelectSkin}
        onUnlockPack={handleUnlockPack}
        onSetSupporter={handleSetSupporter}
        onLoadPackSample={handleLoadPackSample}
        onOpenAuth={() => setIsAuthOpen(true)}
        onLogout={handleLogout}
      />

      {/* Progressive Optional Auth & Cloud Sync Modal */}
      <AuthModal
        visible={isAuthOpen}
        locale={locale}
        theme={isDark ? 'dark' : 'light'}
        colors={colors}
        currentUser={currentUser}
        onClose={() => setIsAuthOpen(false)}
        onUserChanged={handleUserChanged}
        onSyncComplete={handleSyncComplete}
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
