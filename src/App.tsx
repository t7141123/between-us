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
import { DeckEndModal } from './components/DeckEndModal';
import { OnboardingModal } from './components/OnboardingModal';
import { DailyModal } from './components/DailyModal';
import { CARD_SKINS } from './constants/packs';
import { NotesModal } from './components/NotesModal';
import { ShareSheet } from './components/ShareSheet';
import { SessionsModal } from './components/SessionsModal';
import { sessionIdOfCategory } from './services/sessionCore';
import { CustomQuestionsModal } from './components/CustomQuestionsModal';
import { addCustom, CustomQuestion, makeCustomQuestion, removeCustom, sanitizeCustom } from './services/customCore';
import { NoteMap, sanitizeNotes, saveNote } from './services/notesCore';
import { contentHash, mergeCustom, mergeFavorites, mergeNotes, mergeSeen } from './services/syncCore';
import type { KindAdapter } from './services/cloudSync';
import { useCloudSync } from './hooks/useCloudSync';
import { ReminderService } from './services/reminders';
import { dailyQid, DEFAULT_REMINDER, ReminderSettings } from './services/dailyCore';
import { ProgressBadge } from './components/ProgressBadge';
import { useProgress } from './hooks/useProgress';
import { countSeen, currentStreak, dayKey, prioritizeUnseen } from './services/progressCore';
import { useTheme } from './hooks/useTheme';
import { useSound } from './hooks/useSound';
import { useHaptics } from './hooks/useHaptics';
import { I18nService } from './services/i18n';
import { StorageService } from './services/storage';
import { TelemetryService } from './services/telemetry';
import { PaymentService } from './services/payment';
import { IapService } from './services/iap';
import {
  buildDeck,
  categoryOfQid,
  findQidIndex,
  getAllQuestions,
  isLockCard,
  migrateFavorites,
  PACK_IDS,
} from './services/deck';
import type { PendingPaid, ShareTarget } from './services/deck';

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

/** Reads deep-link/share parameters from the web URL once at startup. */
function readInitialShareTarget(): ShareTarget | null {
      if (Platform.OS === 'web' && typeof window !== 'undefined') {
        const params = new URLSearchParams(window.location.search);
        const c = params.get('c') || params.get('cat');
        const pack = params.get('pack');
        const qStr = params.get('q');
        const qNum = qStr ? parseInt(qStr, 10) : NaN;
        if (!isNaN(qNum) && qNum >= 1 && qNum <= 50) {
          if (pack && ['sensual', 'marriage', 'parenting'].includes(pack)) {
            return { pack, q: qNum };
          }
          if (c && ['vision', 'soul', 'finance', 'intimacy', 'fun', 'growth', 'faith', 'all'].includes(c)) {
            return { category: c as CategoryFilter, q: qNum };
          }
        }
      }
      return null;
    }

const NO_CUSTOM: CustomQuestion[] = [];

const LEGACY_ROOM_CATEGORIES: Record<string, string> = {
  sensual: 'pack_sensual',
  marriage: 'pack_marriage',
  parenting: 'pack_parenting',
};

export const MainApp: React.FC = () => {
  const { width, height } = useWindowDimensions();
  const isMobile = width < 600 || height < 750;

  const { isDark, colors, toggleTheme } = useTheme();
  const { muted, toggleMute, playFlip, playClick, playSuccess } = useSound();
  const { triggerImpact, triggerNotification } = useHaptics();

  const [initialShareTarget] = useState<ShareTarget | null>(readInitialShareTarget);
  const initialShareTargetRef = useRef<ShareTarget | null>(initialShareTarget);
  const pendingPaidTargetRef = useRef<PendingPaid | null>(null);
  // A question to open once the deck for its category has been rebuilt (favorites / partner sync).
  const pendingJumpQidRef = useRef<string | null>(null);

  const [locale, setLocale] = useState<LocaleKey>('zh-TW');
  const [currentCategory, setCurrentCategory] = useState<CategoryFilter>(() => {
    if (initialShareTarget?.pack) {
      return `pack_${initialShareTarget.pack}` as CategoryFilter;
    }
    if (initialShareTarget?.category) {
      return initialShareTarget.category;
    }
    return 'all';
  });
  const [favorites, setFavorites] = useState<Record<string, boolean>>({});
  const [deck, setDeck] = useState<QuestionEntry[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  // Bumped to reshuffle the current category ("play another round").
  const [reshuffleKey, setReshuffleKey] = useState(0);
  const [isDeckEndOpen, setIsDeckEndOpen] = useState(false);

  const [isStorageLoaded, setIsStorageLoaded] = useState(false);
  // What was bought individually (or synced from the account). Plus adds everything on top: see below.
  const [ownedPacks, setOwnedPacks] = useState<string[]>([]);
  const [ownedSkins, setOwnedSkins] = useState<CardSkinId[]>(['classic']);
  const [isPlus, setIsPlus] = useState(false);
  const unlockedPacks = useMemo(() => (isPlus ? [...PACK_IDS] : ownedPacks), [isPlus, ownedPacks]);
  const unlockedSkins = useMemo<CardSkinId[]>(
    () => (isPlus ? CARD_SKINS.map((skin) => skin.id) : ownedSkins),
    [isPlus, ownedSkins]
  );
  const [selectedSkin, setSelectedSkin] = useState<CardSkinId>('classic');
  const [isSupporter, setIsSupporter] = useState(false);
  const [currentUser, setCurrentUser] = useState<AuthUser | null>(null);

  const [isFavoritesOpen, setIsFavoritesOpen] = useState(false);
  const [isTimerOpen, setIsTimerOpen] = useState(false);
  const [isStoreOpen, setIsStoreOpen] = useState(false);
  const [isAuthOpen, setIsAuthOpen] = useState(false);
  const [isPurchaseGateAuth, setIsPurchaseGateAuth] = useState(false);
  const [isRoomOpen, setIsRoomOpen] = useState(false);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [currentRoom, setCurrentRoom] = useState<RoomState | null>(null);

  const [isOnboardingOpen, setIsOnboardingOpen] = useState(false);
  const [isDailyOpen, setIsDailyOpen] = useState(false);
  const [isNotesOpen, setIsNotesOpen] = useState(false);
  const [notesBrowseOnly, setNotesBrowseOnly] = useState(false);
  const [notes, setNotes] = useState<NoteMap>({});
  const [customQuestions, setCustomQuestions] = useState<CustomQuestion[]>([]);
  const [isCustomOpen, setIsCustomOpen] = useState(false);
  const [isSessionsOpen, setIsSessionsOpen] = useState(false);
  const [isShareOpen, setIsShareOpen] = useState(false);
  const [reminder, setReminder] = useState<ReminderSettings>(DEFAULT_REMINDER);
  const [permissionDenied, setPermissionDenied] = useState(false);
  const progress = useProgress();
  const hydrateProgress = progress.hydrate;

  const cardRef = useRef<Card3DHandle>(null);

  const favoriteCount = useMemo(() => Object.keys(favorites).length, [favorites]);

  // Load initial settings & initialize session duration telemetry
  // iOS: attach to StoreKit early and silently verify purchases that could not be verified earlier
  // (made while signed out/offline). Re-runs when the signed-in user changes.
  useEffect(() => {
    if (!currentUser || !IapService.isAvailable()) return;
    let cancelled = false;
    IapService.recover().then(async (recovered) => {
      if (cancelled || recovered === 0) return;
      const cloud = await AuthService.syncCloudEntitlements();
      if (cancelled || !cloud) return;
      if (cloud.unlockedPacks.length > 0) setOwnedPacks(cloud.unlockedPacks);
      if (cloud.unlockedSkins && cloud.unlockedSkins.length > 0) setOwnedSkins(cloud.unlockedSkins);
      if (cloud.isSupporter) setIsSupporter(true);
      setIsPlus(cloud.isPlus);
    });
    return () => {
      cancelled = true;
    };
  }, [currentUser]);

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
      StorageService.getSeen(),
      StorageService.getStreak(),
      StorageService.getOnboarded(),
      StorageService.getReminder(),
      StorageService.getNotes(),
      StorageService.getIsPlus(),
      StorageService.getCustomQuestions(),
    ]).then(([savedLocale, savedFavs, savedPacks, savedSkin, savedSupporter, savedUser, savedSkins, savedSeen, savedStreak, onboarded, savedReminder, savedNotes, savedPlus, savedCustom]) => {
      if (!mounted) return;
      setCustomQuestions(savedCustom);
      setIsPlus(savedPlus);
      setNotes(savedNotes);
      setReminder(savedReminder);
      hydrateProgress(savedSeen, savedStreak);
      // First run: show the short guide (not for visitors arriving via a shared question or room link).
      if (!onboarded && !initialShareTargetRef.current) setIsOnboardingOpen(true);
      setLocale(savedLocale);
      const migrated = migrateFavorites(savedFavs);
      if (migrated.changed) StorageService.setFavorites(migrated.favorites);
      setFavorites(migrated.favorites);
      setOwnedPacks(savedPacks);
      setSelectedSkin(savedSkin);
      setIsSupporter(savedSupporter);
      if (savedSkins && savedSkins.length > 0) {
        setOwnedSkins(savedSkins);
      }
      if (savedUser) {
        setCurrentUser(savedUser);
        // Silently sync latest entitlements from cloud on startup
        AuthService.syncCloudEntitlements(savedUser.id).then((cloud) => {
          if (!mounted || !cloud) return;
          if (cloud.unlockedPacks.length > 0) {
            setOwnedPacks(cloud.unlockedPacks);
          }
          if (cloud.unlockedSkins && cloud.unlockedSkins.length > 0) {
            setOwnedSkins(cloud.unlockedSkins);
          }
          if (cloud.isSupporter) {
            setIsSupporter(true);
          }
          setIsPlus(cloud.isPlus);
        });
      }
      setIsStorageLoaded(true);
    });
    return () => {
      mounted = false;
    };
  }, [hydrateProgress]);

  // Custom questions only matter to the deck while the custom category is open (avoids needless reshuffles).
  const customForDeck = useMemo(() => (currentCategory === 'custom' ? customQuestions : NO_CUSTOM), [currentCategory, customQuestions]);

  // Rebuild the deck when locale, category, unlocked packs or the reshuffle key change.
  useEffect(() => {
    if (!isStorageLoaded) return;

    // A shared / remembered target must stay on top; otherwise unseen questions come first.
    const hasTarget = Boolean(initialShareTargetRef.current || pendingPaidTargetRef.current);
    const result = buildDeck({
      category: currentCategory,
      locale,
      unlockedPacks,
      initialTarget: initialShareTargetRef.current,
      pendingPaid: pendingPaidTargetRef.current,
      custom: customForDeck,
    });
    initialShareTargetRef.current = null;
    pendingPaidTargetRef.current = result.pendingPaid;
    // Guided sessions keep their order; everything else draws unseen questions first.
    const ordered = sessionIdOfCategory(String(currentCategory))
      ? result.deck
      : prioritizeUnseen(result.deck, progress.seenRef.current, hasTarget);

    const jumpQid = pendingJumpQidRef.current;
    pendingJumpQidRef.current = null;
    const jumpIdx = jumpQid ? findQidIndex(ordered, jumpQid) : -1;

    setDeck(ordered);
    setCurrentIndex(jumpIdx >= 0 ? jumpIdx : result.startIndex);
    setIsDeckEndOpen(false);
  }, [isStorageLoaded, locale, currentCategory, unlockedPacks, reshuffleKey, progress.seenRef, customForDeck]);

  /** Opens a question by its language-independent id, switching category when needed. */
  const jumpToQid = useCallback(
    (qid: string): boolean => {
      const idx = findQidIndex(deck, qid);
      if (idx >= 0) {
        setCurrentIndex(idx);
        return true;
      }
      const cat = categoryOfQid(qid);
      if (!cat || cat === currentCategory) return false; // e.g. a locked pack question
      pendingJumpQidRef.current = qid;
      setCurrentCategory(cat);
      return true;
    },
    [deck, currentCategory]
  );

  const currentQuestion = useMemo(() => {
    if (deck.length === 0) return null;
    return deck[currentIndex] ?? null;
  }, [deck, currentIndex]);

  // Count a question as seen once the user has spent a moment on it (also marks today as a talking day).
  const currentQid = currentQuestion?.qid;
  const currentIsLock = isLockCard(currentQuestion);
  const markSeen = progress.markSeen;
  useEffect(() => {
    if (!currentQid || currentIsLock) return;
    const timer = setTimeout(() => markSeen(currentQid), 1500);
    return () => clearTimeout(timer);
  }, [currentQid, currentIsLock, markSeen]);

  const deckProgress = useMemo(() => countSeen(deck, progress.seen), [deck, progress.seen]);
  const streakDays = currentStreak(progress.streak, dayKey(new Date()));
  const handleResetProgress = useCallback(() => {
    progress.resetSeen(deck.map((q) => q.qid));
  }, [deck, progress]);

  const handleCloseOnboarding = useCallback(() => {
    setIsOnboardingOpen(false);
    void StorageService.setOnboarded(true);
  }, []);

  // Question of the day: from the free base questions so everyone can join in.
  const dailyPool = useMemo(() => I18nService.getQuestions(locale, 'all'), [locale]);
  const todayKey = dayKey(new Date());
  const dailyEntry = useMemo(() => {
    const qid = dailyQid(todayKey, dailyPool.map((q) => q.qid));
    return dailyPool.find((q) => q.qid === qid) ?? null;
  }, [dailyPool, todayKey]);

  // Keep the local reminder schedule in step with settings and language (also refreshes upcoming days).
  useEffect(() => {
    if (!isStorageLoaded || !ReminderService.isSupported()) return;
    const qids = dailyPool.map((q) => q.qid);
    const textByQid = new Map(dailyPool.map((q) => [q.qid, q.text]));
    void ReminderService.sync(reminder, locale, qids, (qid) => textByQid.get(qid));
  }, [isStorageLoaded, reminder, locale, dailyPool]);

  const handleChangeReminder = useCallback(async (next: ReminderSettings) => {
    if (next.enabled && !reminder.enabled) {
      const granted = await ReminderService.requestPermission();
      setPermissionDenied(!granted);
      if (!granted) return;
    } else {
      setPermissionDenied(false);
    }
    setReminder(next);
    void StorageService.setReminder(next);
  }, [reminder.enabled]);

  const allQuestionTexts = useMemo(() => {
    const map = new Map<string, string>();
    for (const q of getAllQuestions(locale, customQuestions)) map.set(q.qid, q.text);
    return map;
  }, [locale, customQuestions]);

  const handleAddCustom = useCallback((text: string) => {
    const q = makeCustomQuestion(text, Date.now());
    if (!q) return;
    setCustomQuestions((prev) => {
      const next = addCustom(prev, q);
      void StorageService.setCustomQuestions(next);
      return next;
    });
  }, []);

  const handleRemoveCustom = useCallback((id: string) => {
    setCustomQuestions((prev) => {
      const next = removeCustom(prev, id);
      void StorageService.setCustomQuestions(next);
      return next;
    });
  }, []);

  const handleSaveNote = useCallback((qid: string, text: string) => {
    setNotes((prev) => {
      const next = saveNote(prev, qid, text, Date.now());
      void StorageService.setNotes(next);
      return next;
    });
  }, []);

  // ---- Cloud backup (Plus + signed in) ----
  const seenSorted = useMemo(() => [...progress.seen].sort(), [progress.seen]);
  const replaceSeen = progress.replaceSeen;
  const cloudAdapters = useMemo<KindAdapter<any>[]>(
    () => [
      {
        kind: 'favorites',
        read: () => favorites,
        normalize: (raw: unknown) =>
          raw && typeof raw === 'object' && !Array.isArray(raw)
            ? Object.fromEntries(Object.keys(raw as object).map((k) => [k, true]))
            : {},
        apply: (v: Record<string, boolean>) => {
          setFavorites(v);
          void StorageService.setFavorites(v);
        },
        merge: mergeFavorites,
        isEmpty: (v: Record<string, boolean>) => Object.keys(v).length === 0,
      },
      {
        kind: 'notes',
        read: () => notes,
        normalize: sanitizeNotes,
        apply: (v: NoteMap) => {
          setNotes(v);
          void StorageService.setNotes(v);
        },
        merge: mergeNotes,
        isEmpty: (v: NoteMap) => Object.keys(v).length === 0,
      },
      {
        kind: 'seen',
        read: () => seenSorted,
        normalize: (raw: unknown) => (Array.isArray(raw) ? raw.filter((x): x is string => typeof x === 'string').sort() : []),
        apply: (v: string[]) => replaceSeen(v),
        merge: mergeSeen,
        isEmpty: (v: string[]) => v.length === 0,
      },
      {
        kind: 'custom',
        read: () => customQuestions,
        normalize: sanitizeCustom,
        apply: (v: CustomQuestion[]) => {
          setCustomQuestions(v);
          void StorageService.setCustomQuestions(v);
        },
        merge: mergeCustom,
        isEmpty: (v: CustomQuestion[]) => v.length === 0,
      },
    ],
    [favorites, notes, seenSorted, replaceSeen, customQuestions]
  );
  const cloudDataKey = useMemo(
    () => contentHash([favorites, notes, seenSorted, customQuestions]),
    [favorites, notes, seenSorted, customQuestions]
  );
  const cloud = useCloudSync({
    enabled: isPlus && currentUser !== null && isStorageLoaded,
    userId: currentUser?.id ?? null,
    adapters: cloudAdapters,
    dataKey: cloudDataKey,
  });

  const lastNavTimeRef = useRef(0);

  const handleNextQuestion = useCallback((skipSync = false) => {
    const now = Date.now();
    if (now - lastNavTimeRef.current < 250) return;
    lastNavTimeRef.current = now;

    playClick();
    triggerImpact();
    if (deck.length === 0) return;
    if (currentIndex >= deck.length - 1) {
      // Reached the end: show a completion screen instead of silently wrapping around.
      setIsDeckEndOpen(true);
      return;
    }
    const nextIdx = currentIndex + 1;
    setCurrentIndex(nextIdx);

    if (!skipSync && currentRoom && deck[nextIdx]) {
      RoomService.syncAction(currentRoom.code, {
        qid: deck[nextIdx].qid,
        questionText: deck[nextIdx].text,
        category: currentCategory,
        isFlipped: false,
      }).then((res) => {
        if (res.room) setCurrentRoom(res.room);
      });
    }
  }, [currentIndex, currentRoom, currentCategory, deck, playClick, triggerImpact]);

  const handlePrevQuestion = useCallback((skipSync = false) => {
    const now = Date.now();
    if (now - lastNavTimeRef.current < 250) return;
    lastNavTimeRef.current = now;

    if (currentIndex <= 0 || deck.length === 0) return;
    playClick();
    triggerImpact();
    const prevIdx = currentIndex - 1;
    setCurrentIndex(prevIdx);

    if (!skipSync && currentRoom && deck[prevIdx]) {
      RoomService.syncAction(currentRoom.code, {
        qid: deck[prevIdx].qid,
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
    setIsDeckEndOpen(true);
  }, [playClick]);

  const handleToggleFavorite = useCallback(() => {
    if (!currentQuestion || isLockCard(currentQuestion)) return;
    playClick();
    triggerNotification();

    setFavorites((prev) => {
      const next = { ...prev };
      if (next[currentQuestion.qid]) {
        delete next[currentQuestion.qid];
      } else {
        next[currentQuestion.qid] = true;
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
      setOwnedPacks(updated);
    });
  }, [playSuccess, triggerNotification]);

  const handleSetPlus = useCallback((plus: boolean) => {
    playSuccess();
    triggerNotification();
    setIsPlus(plus);
    StorageService.setIsPlus(plus);
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
      setOwnedSkins(updated);
    });
  }, [playSuccess, triggerNotification]);

  const handleLoadPackSample = useCallback((packId: string) => {
    playClick();
    if (!(PACK_IDS as string[]).includes(packId)) return;
    const result = buildDeck({ category: `pack_${packId}` as CategoryFilter, locale, unlockedPacks });
    setDeck(result.deck);
    setCurrentIndex(result.startIndex);
  }, [locale, playClick, unlockedPacks]);

  const handleFlipCard = useCallback((skipSync = false) => {
    playFlip();
    if (currentQuestion && !isLockCard(currentQuestion)) markSeen(currentQuestion.qid);
    if (!skipSync && currentRoom && currentQuestion) {
      RoomService.syncAction(currentRoom.code, {
        qid: currentQuestion.qid,
        questionText: currentQuestion.text,
        category: currentCategory,
        isFlipped: true,
      }).then((res) => {
        if (res.room) setCurrentRoom(res.room);
      });
    }
  }, [currentQuestion, currentRoom, currentCategory, playFlip, markSeen]);

  const handleSelectFromDrawer = useCallback((item: QuestionEntry) => {
    setIsFavoritesOpen(false);
    jumpToQid(item.qid);
  }, [jumpToQid]);

  const handleLogout = useCallback(() => {
    AuthService.logout().then(() => {
      setCurrentUser(null);
    });
  }, []);

  const handleUserChanged = useCallback((user: AuthUser | null) => {
    setCurrentUser(user);
  }, []);

  const handleSyncComplete = useCallback((packs: string[], supporter: boolean, skins?: CardSkinId[], plus?: boolean) => {
    if (plus !== undefined) setIsPlus(plus);
    setOwnedPacks(packs);
    setIsSupporter(supporter);
    if (skins && skins.length > 0) {
      setOwnedSkins(skins);
    }
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
    } else if (urlParams.has('c') || urlParams.has('cat') || urlParams.has('pack') || urlParams.has('q')) {
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

        // Older clients send short pack names; normalise them.
        const partnerCategory = (LEGACY_ROOM_CATEGORIES[res.room.category] ?? res.room.category) as CategoryFilter;

        if (partnerCategory && partnerCategory !== currentCategory) {
          // Switch category first; the deck rebuild then opens the partner's question.
          if (res.room.qid) pendingJumpQidRef.current = res.room.qid;
          setCurrentCategory(partnerCategory);
        } else if (res.room.qid) {
          // Match by language-independent id so partners may use different languages.
          const foundIdx = findQidIndex(deck, res.room.qid);
          if (foundIdx >= 0 && foundIdx !== currentIndex) {
            setCurrentIndex(foundIdx);
            playClick();
          }
        } else if (res.room.questionText && res.room.questionText !== currentQuestion?.text) {
          const foundIdx = deck.findIndex((q) => q.text === res.room?.questionText);
          if (foundIdx >= 0) {
            setCurrentIndex(foundIdx);
            playClick();
          }
        }

        // Sync flip animation state accurately
        if (typeof res.room.isFlipped === 'boolean') {
          cardRef.current?.setFlipped(res.room.isFlipped);
        }
      }
    }, 2800);

    return () => clearInterval(interval);
  }, [currentCategory, currentIndex, currentQuestion?.text, currentRoom, deck, playClick]);
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
          } else if (res.type === 'plus') {
            handleSetPlus(true);
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
  }, [currentUser, handleSelectSkin, handleSetPlus, handleSetSupporter, handleUnlockPack, handleUnlockSkin]);

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
      <StatusBar barStyle={isDark ? 'light-content' : 'dark-content'} />

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
          isPlus={isPlus}
          customCount={customQuestions.length}
          onSelectCategory={(cat) => {
            playClick();
            if (cat === 'custom') {
              if (!isPlus) {
                setIsStoreOpen(true);
                return;
              }
              if (customQuestions.length === 0) {
                setIsCustomOpen(true);
                return;
              }
            }
            setCurrentCategory(cat);
          }}
        />

        {!isLockCard(currentQuestion) && (
          <ProgressBadge
            locale={locale}
            colors={colors}
            seen={deckProgress.seen}
            total={deckProgress.total}
            streak={streakDays}
            onReset={handleResetProgress}
          />
        )}

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
            isFavorite={Boolean(currentQuestion && favorites[currentQuestion.qid])}
            onToggleFavorite={handleToggleFavorite}
            onOpenTimer={() => {
              playClick();
              setIsTimerOpen(true);
            }}
            onShare={() => {
              playClick();
              setIsShareOpen(true);
            }}
            onOpenNote={() => {
              playClick();
              setNotesBrowseOnly(false);
              setIsNotesOpen(true);
            }}
            hasNote={Boolean(currentQuestion && notes[currentQuestion.qid])}
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
            accessibilityLabel={I18nService.t(locale, 'favorites_btn', '收藏的題目')}
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
        customQuestions={customQuestions}
        onClose={() => setIsFavoritesOpen(false)}
        onSelectQuestion={handleSelectFromDrawer}
        onToggleFavorite={(qid) => {
          playClick();
          setFavorites((prev) => {
            const next = { ...prev };
            if (next[qid]) delete next[qid];
            else next[qid] = true;
            StorageService.setFavorites(next);
            return next;
          });
        }}
      />

      <NotesModal
        visible={isNotesOpen}
        locale={locale}
        colors={colors}
        isDark={isDark}
        isPlus={isPlus}
        currentQid={notesBrowseOnly || isLockCard(currentQuestion) ? null : currentQuestion?.qid ?? null}
        currentQuestionText={currentQuestion?.text ?? ''}
        notes={notes}
        textOf={(qid) => allQuestionTexts.get(qid)}
        onSave={handleSaveNote}
        onOpenQuestion={(qid) => {
          jumpToQid(qid);
        }}
        onOpenStore={() => setIsStoreOpen(true)}
        onClose={() => setIsNotesOpen(false)}
      />

      <ShareSheet
        visible={isShareOpen}
        locale={locale}
        colors={colors}
        isDark={isDark}
        isPlus={isPlus}
        question={currentQuestion}
        skin={CARD_SKINS.find((s) => s.id === selectedSkin) ?? CARD_SKINS[0]}
        onShareText={() => {
          setIsShareOpen(false);
          cardRef.current?.shareText();
        }}
        onOpenStore={() => setIsStoreOpen(true)}
        onClose={() => setIsShareOpen(false)}
      />

      <SessionsModal
        visible={isSessionsOpen}
        locale={locale}
        colors={colors}
        isDark={isDark}
        isPlus={isPlus}
        onStart={(id) => {
          playClick();
          setIsSessionsOpen(false);
          setCurrentCategory(`session_${id}`);
          setReshuffleKey((k) => k + 1);
        }}
        onOpenStore={() => {
          setIsSessionsOpen(false);
          setIsStoreOpen(true);
        }}
        onClose={() => setIsSessionsOpen(false)}
      />

      <CustomQuestionsModal
        visible={isCustomOpen}
        locale={locale}
        colors={colors}
        isDark={isDark}
        questions={customQuestions}
        onAdd={handleAddCustom}
        onRemove={handleRemoveCustom}
        onStartTalking={() => {
          setIsCustomOpen(false);
          setCurrentCategory('custom');
          setReshuffleKey((k) => k + 1);
        }}
        onClose={() => setIsCustomOpen(false)}
      />

      <DailyModal
        visible={isDailyOpen}
        locale={locale}
        colors={colors}
        isDark={isDark}
        questionText={dailyEntry?.text ?? ''}
        categoryLabel={dailyEntry?.categoryLabel ?? ''}
        reminder={reminder}
        reminderSupported={ReminderService.isSupported()}
        permissionDenied={permissionDenied}
        onTalk={() => {
          setIsDailyOpen(false);
          if (dailyEntry) jumpToQid(dailyEntry.qid);
        }}
        onChangeReminder={handleChangeReminder}
        onClose={() => setIsDailyOpen(false)}
      />

      <OnboardingModal
        visible={isOnboardingOpen}
        locale={locale}
        colors={colors}
        isDark={isDark}
        onClose={handleCloseOnboarding}
      />

      {/* End-of-deck completion */}
      <DeckEndModal
        visible={isDeckEndOpen}
        locale={locale}
        colors={colors}
        isDark={isDark}
        isLockedPack={isLockCard(currentQuestion)}
        isSession={sessionIdOfCategory(String(currentCategory)) !== null}
        onOpenSessions={() => {
          setIsDeckEndOpen(false);
          setIsSessionsOpen(true);
        }}
        hasLockedPacks={PACK_IDS.some((id) => !unlockedPacks.includes(id))}
        onPlayAgain={() => {
          playClick();
          setReshuffleKey((k) => k + 1);
        }}
        onClose={() => setIsDeckEndOpen(false)}
        onOpenStore={() => {
          setIsDeckEndOpen(false);
          setIsStoreOpen(true);
        }}
      />

      {/* Timer Modal */}
      <TimerModal
        visible={isTimerOpen}
        locale={locale}
        colors={colors}
        isPlus={isPlus}
        onOpenStore={() => setIsStoreOpen(true)}
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
        isPlus={isPlus}
        onSetPlus={handleSetPlus}
        currentUser={currentUser}
        onSelectSkin={handleSelectSkin}
        onUnlockSkin={handleUnlockSkin}
        onUnlockPack={handleUnlockPack}
        onSetSupporter={handleSetSupporter}
        onLoadPackSample={handleLoadPackSample}
        onOpenAuth={() => {
          setIsPurchaseGateAuth(true);
          setIsAuthOpen(true);
        }}
        onLogout={handleLogout}
      />

      {/* Progressive Optional Auth & Cloud Sync Modal */}
      <AuthModal
        visible={isAuthOpen}
        locale={locale}
        theme={isDark ? 'dark' : 'light'}
        colors={colors}
        currentUser={currentUser}
        purchaseGateNotice={isPurchaseGateAuth}
        onClose={() => {
          setIsAuthOpen(false);
          setIsPurchaseGateAuth(false);
        }}
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
        currentQuestionQid={currentQuestion?.qid || ''}
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
        onToggleTheme={toggleTheme}
        onToggleMute={toggleMute}
        onSelectLocale={handleSelectLocale}
        onOpenTimer={() => {
          playClick();
          setIsTimerOpen(true);
        }}
        cloudBackup={{
          state: !isPlus ? 'locked' : currentUser ? cloud.status : 'needs_login',
          onPress: () => {
            if (!isPlus) setIsStoreOpen(true);
            else if (!currentUser) setIsAuthOpen(true);
            else void cloud.syncNow();
          },
        }}
        onOpenSessions={() => {
          playClick();
          setIsSessionsOpen(true);
        }}
        onOpenCustom={() => {
          playClick();
          if (isPlus) setIsCustomOpen(true);
          else setIsStoreOpen(true);
        }}
        customLocked={!isPlus}
        onOpenNotes={() => {
          playClick();
          setNotesBrowseOnly(true);
          setIsNotesOpen(true);
        }}
        onOpenDaily={() => {
          playClick();
          setIsDailyOpen(true);
        }}
        onOpenOnboarding={() => {
          playClick();
          setIsOnboardingOpen(true);
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
