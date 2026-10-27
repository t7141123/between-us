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
import { Shuffle, Bookmark } from 'lucide-react-native';
import confetti from 'canvas-confetti';

import { LocaleKey, CategoryFilter, QuestionEntry, CardSkinId } from './types';
import { useTheme } from './hooks/useTheme';
import { useSound } from './hooks/useSound';
import { useHaptics } from './hooks/useHaptics';
import { I18nService } from './services/i18n';
import { StorageService } from './services/storage';
import { TelemetryService } from './services/telemetry';
import { PaymentService } from './services/payment';
import {
  MARRIAGE_PACK_DATA,
  PARENTING_PACK_DATA,
  SENSUAL_PACK_DATA,
} from './constants/packs';

import { HeaderBar } from './components/HeaderBar';
import { CategorySelect } from './components/CategorySelect';
import { Card3D, Card3DHandle } from './components/Card3D';
import { FavoritesModal } from './components/FavoritesModal';
import { TimerModal } from './components/TimerModal';
import { StoreModal } from './components/StoreModal';
import { AuthModal } from './components/AuthModal';
import { RoomModal } from './components/RoomModal';
import { MenuModal } from './components/MenuModal';
import { AuthService, AuthUser } from './services/auth';
import { RoomService, RoomState } from './services/room';

export const MainApp: React.FC = () => {
  const { width, height } = useWindowDimensions();
  const isMobile = width < 600 || height < 750;

  const { isDark, colors } = useTheme();
  const { muted, toggleMute, playFlip, playClick, playSuccess } = useSound();
  const { triggerImpact, triggerNotification } = useHaptics();

  const [locale, setLocale] = useState<LocaleKey>('zh-TW');
  const [currentCategory, setCurrentCategory] = useState<CategoryFilter>('all');
  const [favorites, setFavorites] = useState<Record<string, boolean>>({});
  const [deck, setDeck] = useState<QuestionEntry[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);

  const [unlockedPacks, setUnlockedPacks] = useState<string[]>([]);
  const [unlockedSkins, setUnlockedSkins] = useState<CardSkinId[]>(['classic']);
  const [selectedSkin, setSelectedSkin] = useState<CardSkinId>('classic');
  const [isSupporter, setIsSupporter] = useState(false);
  const [currentUser, setCurrentUser] = useState<AuthUser | null>(null);

  const [isFavoritesOpen, setIsFavoritesOpen] = useState(false);
  const [isTimerOpen, setIsTimerOpen] = useState(false);
  const [isStoreOpen, setIsStoreOpen] = useState(false);
  const [isAuthOpen, setIsAuthOpen] = useState(false);
  const [isRoomOpen, setIsRoomOpen] = useState(false);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [currentRoom, setCurrentRoom] = useState<RoomState | null>(null);

  const cardRef = useRef<Card3DHandle>(null);

  const favoriteCount = useMemo(() => Object.keys(favorites).length, [favorites]);

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
      StorageService.getUnlockedSkins(),
    ]).then(([savedLocale, savedFavs, savedPacks, savedSkin, savedSupporter, savedUser, savedSkins]) => {
      if (!mounted) return;
      setLocale(savedLocale);
      setFavorites(savedFavs);
      setUnlockedPacks(savedPacks);
      setSelectedSkin(savedSkin);
      setIsSupporter(savedSupporter);
      if (savedSkins && savedSkins.length > 0) {
        setUnlockedSkins(savedSkins);
      }
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
    if (currentCategory === 'pack_sensual') {
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
      return;
    }

    if (currentCategory === 'pack_marriage') {
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
      return;
    }

    if (currentCategory === 'pack_parenting') {
      const isUnlocked = unlockedPacks.includes('parenting');
      const packQuestions = PARENTING_PACK_DATA.map((item, idx) => ({
        id: `parenting-${idx + 1}`,
        categoryKey: 'growth' as const,
        categoryLabel: I18nService.t(locale, 'pack_parenting_title', '🌱 新生兒與新手父母'),
        text: locale === 'zh-TW' ? item.tw : locale === 'zh-CN' ? item.cn : item.en,
        index: idx + 1,
      }));
      if (isUnlocked) {
        setDeck(shuffleDeck(packQuestions));
      } else {
        const trials = packQuestions.slice(0, 3);
        const lockCard: QuestionEntry = {
          id: 'parenting-lock',
          categoryKey: 'growth' as const,
          categoryLabel: I18nService.t(locale, 'pack_parenting_title', '🌱 新生兒與新手父母'),
          text: I18nService.t(locale, 'trial_ended_hint'),
          index: 4,
        };
        setDeck([...trials, lockCard]);
      }
      setCurrentIndex(0);
      return;
    }

    const rawQuestions = I18nService.getQuestions(locale, currentCategory);
    setDeck(shuffleDeck(rawQuestions));
    setCurrentIndex(0);
  }, [locale, currentCategory, shuffleDeck, unlockedPacks]);

  const currentQuestion = useMemo(() => {
    if (deck.length === 0) return null;
    return deck[currentIndex] ?? null;
  }, [deck, currentIndex]);

  const handleNextQuestion = useCallback((skipSync = false) => {
    playClick();
    triggerImpact();
    if (deck.length === 0) return;
    const nextIdx = (currentIndex + 1) % deck.length;
    setCurrentIndex(nextIdx);

    if (!skipSync && currentRoom && deck[nextIdx]) {
      RoomService.syncAction(currentRoom.code, {
        questionText: deck[nextIdx].text,
        category: currentCategory,
        isFlipped: false,
      }).then((res) => {
        if (res.room) setCurrentRoom(res.room);
      });
    }
  }, [currentIndex, currentRoom, currentCategory, deck, playClick, triggerImpact]);

  const handlePrevQuestion = useCallback((skipSync = false) => {
    if (currentIndex <= 0 || deck.length === 0) return;
    playClick();
    triggerImpact();
    const prevIdx = currentIndex - 1;
    setCurrentIndex(prevIdx);

    if (!skipSync && currentRoom && deck[prevIdx]) {
      RoomService.syncAction(currentRoom.code, {
        questionText: deck[prevIdx].text,
        category: currentCategory,
        isFlipped: false,
      }).then((res) => {
        if (res.room) setCurrentRoom(res.room);
      });
    }
  }, [currentIndex, currentRoom, currentCategory, deck, playClick, triggerImpact]);

  const handleDeckEnd = useCallback(() => {
    playClick();
    setIsStoreOpen(true);
  }, [playClick]);

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

  const handleUnlockSkin = useCallback((skinId: CardSkinId) => {
    playSuccess();
    triggerNotification();
    StorageService.unlockSkin(skinId).then((updated) => {
      setUnlockedSkins(updated);
    });
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
    } else if (packId === 'parenting') {
      const isUnlocked = unlockedPacks.includes('parenting');
      const packQuestions = PARENTING_PACK_DATA.map((item, idx) => ({
        id: `parenting-${idx + 1}`,
        categoryKey: 'growth' as const,
        categoryLabel: I18nService.t(locale, 'pack_parenting_title', '🌱 新生兒與新手父母'),
        text: locale === 'zh-TW' ? item.tw : locale === 'zh-CN' ? item.cn : item.en,
        index: idx + 1,
      }));

      if (isUnlocked) {
        setDeck(shuffleDeck(packQuestions));
      } else {
        const trials = packQuestions.slice(0, 3);
        const lockCard: QuestionEntry = {
          id: 'parenting-lock',
          categoryKey: 'growth' as const,
          categoryLabel: I18nService.t(locale, 'pack_parenting_title', '🌱 新生兒與新手父母'),
          text: I18nService.t(locale, 'trial_ended_hint'),
          index: 4,
        };
        setDeck([...trials, lockCard]);
      }
      setCurrentIndex(0);
    }
  }, [locale, playClick, shuffleDeck, unlockedPacks]);

  const handleFlipCard = useCallback((skipSync = false) => {
    playFlip();
    if (!skipSync && currentRoom && currentQuestion) {
      RoomService.syncAction(currentRoom.code, {
        questionText: currentQuestion.text,
        category: currentCategory,
        isFlipped: true,
      }).then((res) => {
        if (res.room) setCurrentRoom(res.room);
      });
    }
  }, [currentQuestion, currentRoom, currentCategory, playFlip]);

  const handleSelectFromDrawer = useCallback((item: QuestionEntry) => {
    setIsFavoritesOpen(false);

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

    if (item.id.startsWith('parenting-')) {
      const packQuestions = PARENTING_PACK_DATA.map((p, idx) => ({
        id: `parenting-${idx + 1}`,
        categoryKey: 'growth' as const,
        categoryLabel: I18nService.t(locale, 'pack_parenting_title', '🌱 新生兒與新手父母'),
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
    const roomParam = urlParams.get('room');
    if (roomParam && roomParam.length === 4) {
      RoomService.joinRoom(roomParam).then((res) => {
        if (res.success && res.room) {
          setCurrentRoom(res.room);
          setIsRoomOpen(true);
        }
      });
      window.history.replaceState({}, document.title, window.location.pathname);
    }
  }, []);

  // Room synchronization polling loop
  useEffect(() => {
    if (!currentRoom) return;

    const interval = setInterval(async () => {
      const res = await RoomService.pollRoom(currentRoom.code, currentRoom.version);
      if (res.updated && res.room) {
        setCurrentRoom(res.room);

        // Sync question text if changed by partner
        if (res.room.questionText && res.room.questionText !== currentQuestion?.text) {
          const foundIdx = deck.findIndex((q) => q.text === res.room?.questionText);
          if (foundIdx >= 0) {
            setCurrentIndex(foundIdx);
            playClick();
          }
        }

        // Sync flip animation
        if (res.room.isFlipped) {
          cardRef.current?.flip();
        }
      }
    }, 2800);

    return () => clearInterval(interval);
  }, [currentQuestion?.text, currentRoom, deck, playClick]);
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
          } else if (res.type === 'skin' && res.target) {
            const skinTarget = res.target as CardSkinId;
            handleUnlockSkin(skinTarget);
            handleSelectSkin(skinTarget);
          } else if (res.type === 'bundle_skins') {
            handleUnlockSkin('noir_gold');
            handleUnlockSkin('rose_wine');
            handleUnlockSkin('forest_sage');
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
  }, [currentUser, handleSelectSkin, handleSetSupporter, handleUnlockPack, handleUnlockSkin]);

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
      } else if (e.key === 'ArrowLeft') {
        handlePrevQuestion();
      } else if (e.key.toLowerCase() === 'f') {
        handleToggleFavorite();
      } else if (e.key.toLowerCase() === 't') {
        setIsTimerOpen(true);
      } else if (e.key === 'Escape') {
        setIsFavoritesOpen(false);
        setIsTimerOpen(false);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [handleNextQuestion, handlePrevQuestion, handleToggleFavorite]);

  const nextBtnText = I18nService.t(locale, 'next_question', '換一題');
  const keyboardHint =
    isMobile || Platform.OS !== 'web'
      ? I18nService.t(locale, 'mobile_hint', '輕觸翻牌 ｜ 滑動換題 ｜ 點擊收藏')
      : I18nService.t(locale, 'keyboard_hint', '空白鍵：翻牌 ｜ ←/→：換題 ｜ F：收藏 ｜ T：計時器');

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
          currentRoom={currentRoom}
          onOpenStore={() => {
            playClick();
            setIsStoreOpen(true);
          }}
          onOpenRoomSync={() => {
            playClick();
            setIsRoomOpen(true);
          }}
          onOpenMenu={() => {
            playClick();
            setIsMenuOpen(true);
          }}
        />

        {/* Category Dropdown Select */}
        <CategorySelect
          currentCategory={currentCategory}
          locale={locale}
          colors={colors}
          unlockedPacks={unlockedPacks}
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
            onPrevQuestion={handlePrevQuestion}
            onDeckEnd={handleDeckEnd}
            onFlipCard={handleFlipCard}
            onOpenStore={() => {
              playClick();
              setIsStoreOpen(true);
            }}
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
            onPress={() => handleNextQuestion()}
            activeOpacity={0.8}
          >
            <Shuffle size={17} color="#FFFFFF" style={{ marginRight: 7 }} />
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
              setIsFavoritesOpen(true);
            }}
            activeOpacity={0.8}
            accessibilityLabel="收藏的題目"
          >
            <Bookmark
              size={17}
              color={colors.clay}
              fill={favoriteCount > 0 ? colors.clay : 'none'}
              style={{ marginRight: 7 }}
            />
            <Text
              style={[styles.secondaryActionText, { color: colors.ink }]}
              numberOfLines={1}
            >
              {favoriteCount > 0
                ? `${I18nService.t(locale, 'favorites_btn', '收藏的題目')} (${favoriteCount})`
                : I18nService.t(locale, 'favorites_btn', '收藏的題目')}
            </Text>
          </TouchableOpacity>
        </View>

        {/* Hint Footer */}
        <View style={[styles.hintContainer, isMobile && styles.hintContainerMobile]}>
          <Text
            style={[
              styles.hintText,
              { color: colors.muted, fontSize: isMobile ? 12.5 : 13 },
            ]}
            numberOfLines={1}
          >
            {keyboardHint}
          </Text>
        </View>
      </ScrollView>

      {/* Favorites Modal */}
      <FavoritesModal
        visible={isFavoritesOpen}
        locale={locale}
        colors={colors}
        favorites={favorites}
        onClose={() => setIsFavoritesOpen(false)}
        onSelectQuestion={handleSelectFromDrawer}
        onToggleFavorite={(text) => {
          playClick();
          setFavorites((prev) => {
            const next = { ...prev };
            if (next[text]) delete next[text];
            else next[text] = true;
            StorageService.setFavorites(next);
            return next;
          });
        }}
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
        unlockedSkins={unlockedSkins}
        selectedSkin={selectedSkin}
        isSupporter={isSupporter}
        currentUser={currentUser}
        onSelectSkin={handleSelectSkin}
        onUnlockSkin={handleUnlockSkin}
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

      {/* Real-time Couple Sync Modal */}
      <RoomModal
        visible={isRoomOpen}
        locale={locale}
        theme={isDark ? 'dark' : 'light'}
        colors={colors}
        currentRoom={currentRoom}
        currentCategory={currentCategory}
        currentQuestionText={currentQuestion?.text || ''}
        onClose={() => setIsRoomOpen(false)}
        onRoomConnected={(room) => setCurrentRoom(room)}
        onLeaveRoom={() => setCurrentRoom(null)}
      />

      {/* Hamburger Drawer & Preferences Menu Modal */}
      <MenuModal
        visible={isMenuOpen}
        locale={locale}
        theme={isDark ? 'dark' : 'light'}
        colors={colors}
        muted={muted}
        onClose={() => setIsMenuOpen(false)}
        onToggleMute={toggleMute}
        onSelectLocale={handleSelectLocale}
        onOpenTimer={() => {
          playClick();
          setIsTimerOpen(true);
        }}
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
    paddingTop: Platform.OS === 'web' ? 14 : 10,
    paddingBottom: Platform.OS === 'web' ? 32 : (Platform.OS === 'ios' ? 36 : 28),
    justifyContent: 'space-between',
  },
  cardWrapper: {
    flex: 1,
    justifyContent: 'center',
    paddingHorizontal: 20,
    width: '100%',
  },
  cardWrapperMobile: {
    paddingHorizontal: 16,
    marginVertical: 4,
    justifyContent: 'center',
    alignItems: 'center',
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
    gap: 12,
    marginTop: 8,
    marginBottom: 6,
    paddingHorizontal: 16,
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
    height: 48,
    maxWidth: 165,
    borderRadius: 24,
  },
  primaryActionText: {
    color: '#FFFFFF',
    fontSize: 16,
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
    fontSize: 15.5,
    fontWeight: '600',
    letterSpacing: 0.5,
  },
  hintContainer: {
    alignItems: 'center',
    paddingVertical: 4,
  },
  hintContainerMobile: {
    paddingTop: 2,
    paddingBottom: 6,
  },
  hintText: {
    fontSize: 12.5,
    letterSpacing: 0.9,
  },
});
