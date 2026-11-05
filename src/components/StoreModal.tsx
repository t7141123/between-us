/**
 * StoreModal: Curated expansion packs, bespoke card skins, and supporter perks.
 * Fully compliant with iOS/Android guidelines; supports both light and dark themes.
 */
import React, { useState } from 'react';
import {
  Modal,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { CARD_SKINS, CardSkinConfig, EXPANSION_PACKS } from '../constants/packs';
import { AuthService, AuthUser } from '../services/auth';
import { I18nService } from '../services/i18n';
import { IapService } from '../services/iap';
import { PaymentService, StoreItemKey } from '../services/payment';
import { PLUS_FEATURE_KEYS } from '../constants/entitlements';
import { CardSkinId, LocaleKey, ThemeColors, ThemeMode } from '../types';

interface StoreModalProps {
  visible: boolean;
  locale: LocaleKey;
  onClose: () => void;
  theme: ThemeMode;
  colors: ThemeColors;
  unlockedPacks: string[];
  unlockedSkins?: CardSkinId[];
  selectedSkin: CardSkinId;
  isSupporter: boolean;
  isPlus: boolean;
  onSetPlus: (isPlus: boolean) => void;
  currentUser?: AuthUser | null;
  onSelectSkin: (skinId: CardSkinId) => void;
  onUnlockSkin?: (skinId: CardSkinId) => void;
  onUnlockPack: (packId: string) => void;
  onSetSupporter: (isSupporter: boolean) => void;
  onLoadPackSample?: (packId: string) => void;
  onOpenAuth?: () => void;
  onLogout?: () => void;
}

type TabKey = 'plus' | 'packs' | 'skins' | 'support';

interface PendingCheckout {
  itemKey: StoreItemKey;
  title: string;
  amountText: string;
  type: 'pack' | 'skin' | 'bundle_skins' | 'supporter' | 'plus';
  targetId?: string;
}

export const StoreModal: React.FC<StoreModalProps> = ({
  visible,
  locale,
  onClose,
  theme,
  colors,
  unlockedPacks,
  unlockedSkins = ['classic'],
  selectedSkin,
  isSupporter,
  isPlus,
  onSetPlus,
  currentUser,
  onSelectSkin,
  onUnlockSkin,
  onUnlockPack,
  onSetSupporter,
  onLoadPackSample,
  onOpenAuth,
  onLogout,
}) => {
  const [activeTab, setActiveTab] = useState<TabKey>(isPlus ? 'packs' : 'plus');
  const [redeemFeedback, setRedeemFeedback] = useState<string | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [storePrices, setStorePrices] = useState<Record<string, string>>({});
  const [pendingCheckout, setPendingCheckout] = useState<PendingCheckout | null>(null);
  const [queuedCheckout, setQueuedCheckout] = useState<PendingCheckout | null>(null);

  const isDark = theme === 'dark';

  // On iOS show the price StoreKit reports (correct currency/tax for the user's storefront).
  React.useEffect(() => {
    if (visible && Platform.OS === 'ios') {
      IapService.loadPrices().then(setStorePrices);
    }
  }, [visible]);
  const priceFor = (itemKey: string, fallback: string) => storePrices[itemKey] ?? fallback;

  // Resume checkout automatically if user just logged in while having a queued purchase
  React.useEffect(() => {
    if (currentUser && queuedCheckout) {
      const target = queuedCheckout;
      // Intentional: resume the queued purchase once the user has signed in.
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setQueuedCheckout(null);

      // Check if already unlocked in cloud
      if (target.type === 'pack' && target.targetId && unlockedPacks.includes(target.targetId)) {
        setRedeemFeedback(I18nService.t(locale, 'item_already_owned', '您的帳號已擁有此擴充包，已自動解鎖！'));
        setTimeout(() => setRedeemFeedback(null), 3500);
        return;
      }
      if (target.type === 'skin' && target.targetId && unlockedSkins.includes(target.targetId as CardSkinId)) {
        setRedeemFeedback(I18nService.t(locale, 'item_already_owned', '您的帳號已擁有此主題，已自動解鎖！'));
        setTimeout(() => setRedeemFeedback(null), 3500);
        return;
      }
      if (target.type === 'plus' && isPlus) {
        setRedeemFeedback(I18nService.t(locale, 'plus_owned_msg'));
        setTimeout(() => setRedeemFeedback(null), 3500);
        return;
      }
      if (target.type === 'supporter' && isSupporter) {
        setRedeemFeedback(I18nService.t(locale, 'item_already_owned', '您已是金色支持者，感謝您的陪伴！'));
        setTimeout(() => setRedeemFeedback(null), 3500);
        return;
      }

      setPendingCheckout(target);
    }
  }, [currentUser, queuedCheckout, unlockedPacks, unlockedSkins, isSupporter, isPlus, locale]);

  const guardAuthForCheckout = (checkout: PendingCheckout): boolean => {
    if (!currentUser) {
      setQueuedCheckout(checkout);
      onOpenAuth?.();
      return false;
    }
    return true;
  };

  const requestPlusCheckout = () => {
    const checkout: PendingCheckout = {
      itemKey: 'plus',
      title: I18nService.t(locale, 'plus_title'),
      amountText: priceFor('plus', 'NT$ 290'),
      type: 'plus',
    };
    if (guardAuthForCheckout(checkout)) {
      setPendingCheckout(checkout);
    }
  };

  const requestPackCheckout = (pack: typeof EXPANSION_PACKS[0]) => {
    const itemKey: StoreItemKey =
      pack.id === 'marriage'
        ? 'pack_marriage'
        : pack.id === 'parenting'
        ? 'pack_parenting'
        : 'pack_sensual';
    const checkout: PendingCheckout = {
      itemKey,
      title: I18nService.t(locale, pack.titleKey),
      amountText: priceFor(itemKey, pack.priceText),
      type: 'pack',
      targetId: pack.id,
    };
    if (guardAuthForCheckout(checkout)) {
      setPendingCheckout(checkout);
    }
  };

  const requestSkinCheckout = (skin: CardSkinConfig) => {
    const itemKey: StoreItemKey =
      skin.id === 'noir_gold'
        ? 'skin_noir_gold'
        : skin.id === 'rose_wine' || skin.id === 'caramel'
        ? 'skin_rose_wine'
        : 'skin_forest_sage';
    const checkout: PendingCheckout = {
      itemKey,
      title: `${I18nService.t(locale, skin.nameKey)} (${I18nService.t(locale, 'tab_skins')})`,
      amountText: priceFor(itemKey, 'NT$ 30'),
      type: 'skin',
      targetId: skin.id,
    };
    if (guardAuthForCheckout(checkout)) {
      setPendingCheckout(checkout);
    }
  };

  const requestBundleSkinsCheckout = () => {
    const checkout: PendingCheckout = {
      itemKey: 'bundle_skins',
      title: I18nService.t(locale, 'skin_unlock_bundle'),
      amountText: priceFor('bundle_skins', 'NT$ 60'),
      type: 'bundle_skins',
    };
    if (guardAuthForCheckout(checkout)) {
      setPendingCheckout(checkout);
    }
  };

  const requestTipCheckout = (itemKey: 'tip_coffee' | 'tip_afternoon') => {
    const isCoffee = itemKey === 'tip_coffee';
    const checkout: PendingCheckout = {
      itemKey,
      title: I18nService.t(locale, itemKey),
      amountText: priceFor(itemKey, isCoffee ? 'NT$ 60' : 'NT$ 120'),
      type: 'supporter',
    };
    if (guardAuthForCheckout(checkout)) {
      setPendingCheckout(checkout);
    }
  };

  const handleRestorePurchases = async () => {
    setIsProcessing(true);
    setRedeemFeedback(I18nService.t(locale, 'restoring_purchases', '正在向商店恢復已購買項目…'));
    try {
      if (Platform.OS !== 'web' && IapService.isAvailable() && currentUser) {
        const restored = await IapService.restore();
        if (restored.status === 'error') {
          setRedeemFeedback(I18nService.t(locale, restored.error));
          return;
        }
      }
      if (currentUser) {
        const cloud = await AuthService.syncCloudEntitlements(currentUser.id);
        if (cloud) {
          cloud.unlockedPacks.forEach((p) => onUnlockPack(p));
          cloud.unlockedSkins?.forEach((sk) => onUnlockSkin?.(sk));
          if (cloud.isSupporter) onSetSupporter(true);
          if (cloud.isPlus && !isPlus) onSetPlus(true);
        }
      }
      setRedeemFeedback(I18nService.t(locale, 'restore_completed', '已完成購買項目恢復與同步'));
    } catch {
      setRedeemFeedback(I18nService.t(locale, 'restore_failed', '恢復購買失敗，請確認網路連線'));
    } finally {
      setIsProcessing(false);
      setTimeout(() => setRedeemFeedback(null), 3000);
    }
  };

  const handleConfirmCheckout = async () => {
    if (!pendingCheckout) return;
    const checkout = pendingCheckout;
    setPendingCheckout(null);

    if (Platform.OS === 'web') {
      setIsProcessing(true);
      setRedeemFeedback(I18nService.t(locale, 'checkout_loading'));
      try {
        const res = await PaymentService.startEcpayCheckout(checkout.itemKey, currentUser?.id);
        if (!res.success) {
          setRedeemFeedback(I18nService.t(locale, res.error || 'err_checkout'));
        }
      } finally {
        setIsProcessing(false);
      }
    } else {
      // Native In-App Purchase (StoreKit / Play Billing)
      setIsProcessing(true);
      try {
        const result = await IapService.purchase(checkout.itemKey);
        if (result.status === 'success') {
          const cloud = await AuthService.syncCloudEntitlements(currentUser?.id);
          if (cloud) {
            cloud.unlockedPacks.forEach((p) => onUnlockPack(p));
            cloud.unlockedSkins?.forEach((sk) => onUnlockSkin?.(sk));
            if (cloud.isSupporter) onSetSupporter(true);
            if (cloud.isPlus && !isPlus) onSetPlus(true);
          if (cloud.isPlus && !isPlus) onSetPlus(true);
          }
          setRedeemFeedback(I18nService.t(locale, 'redeem_success'));
        } else if (result.status === 'unavailable') {
          setRedeemFeedback(I18nService.t(locale, 'native_iap_notice'));
        } else if (result.status === 'error') {
          setRedeemFeedback(I18nService.t(locale, result.error));
        }
      } finally {
        setIsProcessing(false);
        setTimeout(() => setRedeemFeedback(null), 5000);
      }
    }
  };

  return (
    <Modal
      visible={visible}
      animationType="fade"
      transparent
      onRequestClose={onClose}
    >
      <View style={styles.overlay}>
        <Pressable style={styles.backdrop} onPress={onClose} />
        <View
          style={[
            styles.container,
            {
              backgroundColor: isDark ? '#1C1917' : '#FAF6F0',
              borderColor: isDark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.08)',
            },
          ]}
        >
          {/* Header */}
          <View style={styles.header}>
            <View>
              <View style={styles.titleRow}>
                <Text style={[styles.title, { color: colors.ink }]}>
                  {I18nService.t(locale, 'store_title')}
                </Text>
                {isSupporter && (
                  <View style={styles.supporterBadge}>
                    <Text style={styles.supporterBadgeText}>✦ Supporter</Text>
                  </View>
                )}
              </View>
              <Text style={[styles.subtitle, { color: colors.muted }]}>
                {I18nService.t(locale, 'store_subtitle')}
              </Text>
            </View>
            <Pressable
              onPress={onClose}
              hitSlop={12}
              style={[
                styles.closeBtn,
                { backgroundColor: isDark ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.05)' },
              ]}
            >
              <Text style={[styles.closeBtnText, { color: colors.ink }]}>✕</Text>
            </Pressable>
          </View>

          {/* Tabs */}
          <View
            style={[
              styles.tabRow,
              { borderBottomColor: isDark ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.06)' },
            ]}
          >
            {(['plus', 'packs', 'skins', 'support'] as TabKey[]).map((tab) => {
              const active = activeTab === tab;
              return (
                <Pressable
                  key={tab}
                  onPress={() => setActiveTab(tab)}
                  style={[
                    styles.tabButton,
                    active && [
                      styles.tabButtonActive,
                      { borderBottomColor: colors.clay },
                    ],
                  ]}
                >
                  <Text
                    style={[
                      styles.tabText,
                      { color: active ? colors.clay : colors.muted },
                      active && styles.tabTextActive,
                    ]}
                  >
                    {tab === 'plus' && 'Plus'}
                    {tab === 'packs' && I18nService.t(locale, 'tab_packs')}
                    {tab === 'skins' && I18nService.t(locale, 'tab_skins')}
                    {tab === 'support' && I18nService.t(locale, 'tab_support')}
                  </Text>
                </Pressable>
              );
            })}
          </View>

          {/* Feedback banner */}
          {redeemFeedback && (
            <View
              style={[
                styles.feedbackBanner,
                {
                  backgroundColor: isDark ? 'rgba(196, 112, 79, 0.2)' : '#F5EBE1',
                  borderColor: colors.clay,
                },
              ]}
            >
              <Text style={[styles.feedbackText, { color: colors.clay }]}>
                {redeemFeedback}
              </Text>
            </View>
          )}

          {/* Content Area */}
          <ScrollView
            style={styles.scrollArea}
            contentContainerStyle={styles.scrollContent}
            showsVerticalScrollIndicator={false}
          >
            {/* Tab: Plus (one-time unlock of everything) */}
            {activeTab === 'plus' && (
              <View>
                <View
                  style={[
                    styles.thankBox,
                    {
                      backgroundColor: isDark ? '#292524' : '#FFFFFF',
                      borderColor: isPlus ? colors.clay : isDark ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.06)',
                    },
                  ]}
                >
                  <Text style={[styles.thankTitle, { color: colors.ink }]}>
                    {isPlus ? I18nService.t(locale, 'plus_owned_title') : I18nService.t(locale, 'plus_title')}
                  </Text>
                  <Text style={[styles.thankDesc, { color: colors.muted }]}>
                    {isPlus ? I18nService.t(locale, 'plus_owned_msg') : I18nService.t(locale, 'plus_subtitle')}
                  </Text>
                  <View style={{ marginTop: 14, gap: 8 }}>
                    {PLUS_FEATURE_KEYS.map((key) => (
                      <Text key={key} style={[styles.thankDesc, { color: colors.ink }]}>
                        {'✦  '}
                        {I18nService.t(locale, key)}
                      </Text>
                    ))}
                  </View>
                </View>
                {!isPlus && (
                  <Pressable
                    accessibilityRole="button"
                    onPress={requestPlusCheckout}
                    style={[styles.unlockBtn, { backgroundColor: colors.clay, alignSelf: 'stretch', marginTop: 14 }]}
                  >
                    <Text style={styles.unlockBtnText}>
                      {`${I18nService.t(locale, 'plus_buy')} · ${priceFor('plus', 'NT$ 290')}`}
                    </Text>
                  </Pressable>
                )}
                {!isPlus && (
                  <Text style={[styles.thankDesc, { color: colors.muted, textAlign: 'center', marginTop: 10 }]}>
                    {I18nService.t(locale, 'plus_one_time')}
                  </Text>
                )}
              </View>
            )}

            {/* Tab: Expansion Packs */}
            {activeTab === 'packs' && (
              <View>
                {EXPANSION_PACKS.map((pack) => {
                  const isUnlocked = unlockedPacks.includes(pack.id);
                  return (
                    <View
                      key={pack.id}
                      style={[
                        styles.packCard,
                        {
                          backgroundColor: isDark ? '#292524' : '#FFFFFF',
                          borderColor: isUnlocked
                            ? colors.clay
                            : isDark
                            ? 'rgba(255,255,255,0.08)'
                            : 'rgba(0,0,0,0.06)',
                        },
                      ]}
                    >
                      <View style={styles.packHeaderRow}>
                        <View style={{ flex: 1 }}>
                          <View style={styles.packTitleRow}>
                            <Text style={[styles.packTitle, { color: colors.ink }]}>
                              {I18nService.t(locale, pack.titleKey)}
                            </Text>
                            {pack.badgeKey && (
                              <View
                                style={[
                                  styles.packBadge,
                                  { backgroundColor: isDark ? 'rgba(196, 112, 79, 0.25)' : '#FCE7D8' },
                                ]}
                              >
                                <Text style={[styles.packBadgeText, { color: colors.clay }]}>
                                  {I18nService.t(locale, pack.badgeKey)}
                                </Text>
                              </View>
                            )}
                          </View>
                          <Text style={[styles.packCount, { color: colors.muted }]}>
                            {pack.totalCount} {I18nService.t(locale, 'pack_count_suffix', '道私密話題')}
                          </Text>
                        </View>
                        <Text style={[styles.packPrice, { color: colors.clay }]}>
                          {isUnlocked ? I18nService.t(locale, 'unlocked') : priceFor(`pack_${pack.id}`, pack.priceText)}
                        </Text>
                      </View>

                      <Text style={[styles.packDesc, { color: colors.muted }]}>
                        {I18nService.t(locale, pack.descKey)}
                      </Text>

                      <View style={styles.packActionRow}>
                        {!isUnlocked && (
                          <Pressable
                            onPress={() => {
                              onLoadPackSample?.(pack.id);
                              onClose();
                            }}
                            style={[
                              styles.sampleBtn,
                              {
                                borderColor: isDark ? 'rgba(255,255,255,0.2)' : 'rgba(0,0,0,0.15)',
                              },
                            ]}
                          >
                            <Text style={[styles.sampleBtnText, { color: colors.ink }]}>
                              {I18nService.t(locale, 'free_trial')}
                            </Text>
                          </Pressable>
                        )}

                        <Pressable
                          onPress={() => {
                            if (!isUnlocked) {
                              requestPackCheckout(pack);
                            } else {
                              onLoadPackSample?.(pack.id);
                              onClose();
                            }
                          }}
                          style={[
                            styles.unlockBtn,
                            { backgroundColor: isUnlocked ? colors.clayHover : colors.clay },
                          ]}
                        >
                          <Text style={styles.unlockBtnText}>
                            {isUnlocked
                              ? I18nService.t(locale, 'store_load_pack', '載入題庫')
                              : I18nService.t(locale, 'unlock_now')}
                          </Text>
                        </Pressable>
                      </View>
                    </View>
                  );
                })}
              </View>
            )}

            {/* Tab: Card Skins */}
            {activeTab === 'skins' && (
              <View>
                {/* Supporter VIP Privilege Banner */}
                {isSupporter ? (
                  <View
                    style={[
                      styles.supporterSkinBanner,
                      {
                        backgroundColor: isDark ? 'rgba(217,119,6,0.18)' : '#FEF3C7',
                        borderColor: isDark ? '#D97706' : '#F59E0B',
                      },
                    ]}
                  >
                    <Text
                      style={[
                        styles.supporterSkinBannerText,
                        { color: isDark ? '#FDE68A' : '#92400E' },
                      ]}
                    >
                      {I18nService.t(locale, 'supporter_free_skins')}
                    </Text>
                  </View>
                ) : (
                  /* Bundle Discount Purchase for Non-Supporters */
                  <Pressable
                    onPress={requestBundleSkinsCheckout}
                    disabled={isProcessing}
                    style={({ pressed }) => [
                      styles.bundleSkinBanner,
                      {
                        backgroundColor: isDark ? '#1C1917' : '#FFFFFF',
                        borderColor: isDark ? '#F59E0B' : '#D97706',
                        opacity: pressed ? 0.85 : 1,
                      },
                    ]}
                  >
                    <View style={{ flex: 1 }}>
                      <Text
                        style={[
                          styles.bundleSkinBannerTitle,
                          { color: isDark ? '#FDE68A' : '#78350F' },
                        ]}
                      >
                        {I18nService.t(locale, 'skin_unlock_bundle')}
                      </Text>
                      <Text
                        style={[
                          styles.bundleSkinBannerSub,
                          { color: isDark ? '#A8A29E' : '#78716C' },
                        ]}
                      >
                        {I18nService.t(locale, 'skin_bundle_sub', '曜石黑金、薄暮玫瑰、靜謐深林一次珍藏')}
                      </Text>
                    </View>
                    <View style={styles.bundleSkinPriceBadge}>
                      <Text style={styles.bundleSkinPriceText}>{priceFor('bundle_skins', 'NT$ 60')}</Text>
                    </View>
                  </Pressable>
                )}

                <View style={styles.skinGrid}>
                  {CARD_SKINS.map((skin) => {
                    const isSelected = selectedSkin === skin.id;
                    const isUnlocked =
                      skin.id === 'classic' ||
                      isSupporter ||
                      unlockedSkins.includes(skin.id);

                    return (
                      <Pressable
                        key={skin.id}
                        onPress={() => {
                          if (isUnlocked) {
                            onSelectSkin(skin.id);
                          } else {
                            requestSkinCheckout(skin);
                          }
                        }}
                        style={[
                          styles.skinCard,
                          {
                            backgroundColor: skin.bgColor,
                            borderColor: isSelected
                              ? skin.accentColor
                              : isDark
                              ? 'rgba(255,255,255,0.1)'
                              : 'rgba(0,0,0,0.08)',
                            borderWidth: isSelected ? 2 : 1,
                          },
                        ]}
                      >
                        <View style={styles.skinCardHeader}>
                          <Text style={[styles.skinName, { color: skin.textColor }]}>
                            {I18nService.t(locale, skin.nameKey)}
                          </Text>
                          {isSelected ? (
                            <View
                              style={[
                                styles.skinActiveBadge,
                                { backgroundColor: skin.accentColor },
                              ]}
                            >
                              <Text style={styles.skinActiveBadgeText}>✓</Text>
                            </View>
                          ) : !isUnlocked ? (
                            <View
                              style={[
                                styles.skinLockedBadge,
                                {
                                  backgroundColor: skin.isDarkSkin
                                    ? 'rgba(0,0,0,0.5)'
                                    : 'rgba(180,83,9,0.18)',
                                },
                              ]}
                            >
                              <Text
                                style={[
                                  styles.skinLockedBadgeText,
                                  { color: skin.isDarkSkin ? '#FFFFFF' : '#78350F' },
                                ]}
                              >
                                🔒
                              </Text>
                            </View>
                          ) : null}
                        </View>
                        <Text
                          style={[
                            styles.skinDesc,
                            { color: skin.subTextColor },
                          ]}
                        >
                          {I18nService.t(locale, skin.descKey)}
                        </Text>
                        <View
                          style={[
                            styles.skinSelectBtn,
                            {
                              backgroundColor: isSelected
                                ? skin.accentColor
                                : !isUnlocked
                                ? (skin.isDarkSkin ? 'rgba(255,255,255,0.16)' : skin.accentColor)
                                : 'rgba(0,0,0,0.15)',
                            },
                          ]}
                        >
                          <Text
                            style={[
                              styles.skinSelectBtnText,
                              {
                                color: isSelected
                                  ? '#FFFFFF'
                                  : !isUnlocked
                                  ? (skin.isDarkSkin ? '#FDE68A' : '#FFFFFF')
                                  : skin.textColor,
                                fontWeight: !isUnlocked ? '700' : '600',
                              },
                            ]}
                          >
                            {isSelected
                              ? I18nService.t(locale, 'skin_selected')
                              : isUnlocked
                              ? I18nService.t(locale, 'skin_use')
                              : I18nService.t(locale, 'skin_unlock_price')}
                          </Text>
                        </View>
                      </Pressable>
                    );
                  })}
                </View>
              </View>
            )}

            {/* Tab: Support & Tip Jar */}
            {activeTab === 'support' && (
              <View>
                <View
                  style={[
                    styles.thankBox,
                    {
                      backgroundColor: isDark ? '#292524' : '#FFFFFF',
                      borderColor: isDark ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.06)',
                    },
                  ]}
                >
                  <Text style={[styles.thankTitle, { color: colors.ink }]}>
                    {I18nService.t(locale, 'support_thank_title')}
                  </Text>
                  <Text style={[styles.thankDesc, { color: colors.muted }]}>
                    {I18nService.t(locale, 'support_thank_desc')}
                  </Text>
                </View>

                <View style={styles.tipRow}>
                  <Pressable
                    onPress={() => requestTipCheckout('tip_coffee')}
                    style={[
                      styles.tipButton,
                      { backgroundColor: isDark ? '#292524' : '#FFFFFF', borderColor: colors.clay },
                    ]}
                  >
                    <Text style={styles.tipIcon}>☕</Text>
                    <Text style={[styles.tipBtnText, { color: colors.ink }]}>
                      {I18nService.t(locale, 'tip_coffee')}
                    </Text>
                  </Pressable>

                  <Pressable
                    onPress={() => requestTipCheckout('tip_afternoon')}
                    style={[
                      styles.tipButton,
                      { backgroundColor: isDark ? '#292524' : '#FFFFFF', borderColor: colors.clay },
                    ]}
                  >
                    <Text style={styles.tipIcon}>🍰</Text>
                    <Text style={[styles.tipBtnText, { color: colors.ink }]}>
                      {I18nService.t(locale, 'tip_afternoon')}
                    </Text>
                  </Pressable>
                </View>
              </View>
            )}

            {/* Cross-device Cloud Sync Card & Native Restore Purchases */}
            <View
              style={[
                styles.syncBanner,
                {
                  backgroundColor: isDark ? 'rgba(255,255,255,0.03)' : 'rgba(0,0,0,0.02)',
                  borderColor: isDark ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.06)',
                },
              ]}
            >
              <View style={styles.syncBannerContent}>
                <Text style={styles.syncBannerIcon}>☁️</Text>
                <View style={{ flex: 1 }}>
                  <Text style={[styles.syncBannerTitle, { color: colors.ink }]}>
                    {currentUser
                      ? `${I18nService.t(locale, 'logged_in_as')}: ${currentUser.email}`
                      : I18nService.t(locale, 'auth_modal_title')}
                  </Text>
                  <Text style={[styles.syncBannerSubtitle, { color: colors.muted }]}>
                    {currentUser
                      ? `(${currentUser.provider.toUpperCase()})`
                      : I18nService.t(locale, 'sync_card_hint')}
                  </Text>
                </View>
              </View>
              <View style={{ flexDirection: 'row', gap: 8 }}>
                {Platform.OS !== 'web' && (
                  <Pressable
                    onPress={handleRestorePurchases}
                    disabled={isProcessing}
                    style={[
                      styles.syncBannerBtn,
                      {
                        borderColor: colors.line,
                        backgroundColor: isDark ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.05)',
                      },
                    ]}
                  >
                    <Text style={[styles.syncBannerBtnText, { color: colors.ink }]}>
                      {I18nService.t(locale, 'restore_purchases_btn', '恢復購買')}
                    </Text>
                  </Pressable>
                )}
                <Pressable
                  onPress={currentUser ? onLogout : onOpenAuth}
                  style={[
                    styles.syncBannerBtn,
                    {
                      borderColor: colors.clay,
                      backgroundColor: currentUser ? 'transparent' : colors.clay,
                    },
                  ]}
                >
                  <Text
                    style={[
                      styles.syncBannerBtnText,
                      { color: currentUser ? colors.clay : '#FFFFFF' },
                    ]}
                  >
                    {currentUser
                      ? I18nService.t(locale, 'btn_logout')
                      : I18nService.t(locale, 'btn_open_sync')}
                  </Text>
                </Pressable>
              </View>
            </View>
          </ScrollView>
        </View>

        {/* Checkout Confirmation Dialog */}
        {pendingCheckout && (
          <View style={styles.confirmOverlay}>
            <Pressable
              style={styles.confirmBackdrop}
              onPress={() => !isProcessing && setPendingCheckout(null)}
            />
            <View
              style={[
                styles.confirmCard,
                {
                  backgroundColor: isDark ? '#292524' : '#FFFFFF',
                  borderColor: isDark ? 'rgba(255,255,255,0.15)' : 'rgba(0,0,0,0.08)',
                },
              ]}
            >
              <View style={styles.confirmIconCircle}>
                <Text style={styles.confirmIconText}>💳</Text>
              </View>

              <Text style={[styles.confirmTitle, { color: colors.ink }]}>
                {I18nService.t(locale, 'checkout_confirm_title')}
              </Text>

              <Text style={[styles.confirmDesc, { color: colors.muted }]}>
                {Platform.OS === 'web'
                  ? I18nService.t(locale, 'checkout_confirm_desc')
                  : I18nService.t(locale, 'checkout_confirm_desc_native')}
              </Text>

              {/* Item Details Box */}
              <View
                style={[
                  styles.confirmItemBox,
                  {
                    backgroundColor: isDark ? '#1C1917' : '#FAF6F0',
                    borderColor: isDark ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.06)',
                  },
                ]}
              >
                <View style={styles.confirmItemRow}>
                  <Text style={[styles.confirmItemLabel, { color: colors.muted }]}>
                    {I18nService.t(locale, 'checkout_confirm_item')}
                  </Text>
                  <Text
                    style={[styles.confirmItemValue, { color: colors.ink }]}
                    numberOfLines={1}
                  >
                    {pendingCheckout.title}
                  </Text>
                </View>
                <View style={styles.confirmItemRow}>
                  <Text style={[styles.confirmItemLabel, { color: colors.muted }]}>
                    {I18nService.t(locale, 'checkout_confirm_amount')}
                  </Text>
                  <Text style={[styles.confirmItemPrice, { color: colors.clay }]}>
                    {pendingCheckout.amountText}
                  </Text>
                </View>
              </View>

              {/* Actions */}
              <View style={styles.confirmActionsRow}>
                <Pressable
                  onPress={() => setPendingCheckout(null)}
                  disabled={isProcessing}
                  style={[
                    styles.confirmCancelBtn,
                    {
                      borderColor: isDark ? 'rgba(255,255,255,0.2)' : 'rgba(0,0,0,0.15)',
                    },
                  ]}
                >
                  <Text style={[styles.confirmCancelBtnText, { color: colors.ink }]}>
                    {I18nService.t(locale, 'checkout_confirm_cancel_btn')}
                  </Text>
                </Pressable>

                <Pressable
                  onPress={handleConfirmCheckout}
                  disabled={isProcessing}
                  style={[styles.confirmPayBtn, { backgroundColor: colors.clay }]}
                >
                  <Text style={styles.confirmPayBtnText}>
                    {I18nService.t(locale, 'checkout_confirm_pay_btn')}
                  </Text>
                </Pressable>
              </View>
            </View>
          </View>
        )}
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.75)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 16,
    ...Platform.select({
      web: {
        backdropFilter: 'blur(20px)',
        WebkitBackdropFilter: 'blur(20px)',
      } as any,
    }),
  },
  backdrop: {
    ...StyleSheet.absoluteFill,
  },
  container: {
    width: '100%',
    maxWidth: 500,
    maxHeight: '85%',
    borderRadius: 20,
    borderWidth: 1,
    overflow: 'hidden',
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 12 },
        shadowOpacity: 0.35,
        shadowRadius: 24,
      },
      android: { elevation: 12 },
      web: {
        boxShadow: '0 20px 60px rgba(0, 0, 0, 0.6), 0 0 1px rgba(255, 255, 255, 0.1)',
      },
    }),
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 14,
  },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  title: {
    fontSize: 20,
    fontWeight: '700',
    letterSpacing: 0.5,
  },
  subtitle: {
    fontSize: 13,
    marginTop: 4,
  },
  supporterBadge: {
    backgroundColor: '#F59E0B',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 10,
  },
  supporterBadgeText: {
    color: '#FFFFFF',
    fontSize: 11,
    fontWeight: '700',
  },
  closeBtn: {
    width: 32,
    height: 32,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
  },
  closeBtnText: {
    fontSize: 15,
    fontWeight: '600',
  },
  tabRow: {
    flexDirection: 'row',
    borderBottomWidth: 1,
    paddingHorizontal: 16,
  },
  tabButton: {
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderBottomWidth: 2,
    borderBottomColor: 'transparent',
  },
  tabButtonActive: {
    borderBottomWidth: 2,
  },
  tabText: {
    fontSize: 14,
    fontWeight: '500',
  },
  tabTextActive: {
    fontWeight: '700',
  },
  feedbackBanner: {
    marginHorizontal: 16,
    marginTop: 12,
    padding: 10,
    borderRadius: 8,
    borderWidth: 1,
  },
  feedbackText: {
    fontSize: 13,
    textAlign: 'center',
    fontWeight: '600',
  },
  scrollArea: {
    flex: 1,
  },
  scrollContent: {
    padding: 18,
    paddingBottom: 28,
  },
  packCard: {
    borderRadius: 16,
    borderWidth: 1.5,
    padding: 18,
    marginBottom: 16,
  },
  packHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 8,
  },
  packTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  packTitle: {
    fontSize: 17,
    fontWeight: '700',
  },
  packBadge: {
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 6,
  },
  packBadgeText: {
    fontSize: 11,
    fontWeight: '600',
  },
  packCount: {
    fontSize: 12,
    marginTop: 4,
  },
  packPrice: {
    fontSize: 16,
    fontWeight: '700',
  },
  packDesc: {
    fontSize: 13,
    lineHeight: 19,
    marginBottom: 16,
  },
  packActionRow: {
    flexDirection: 'row',
    gap: 10,
    justifyContent: 'flex-end',
  },
  sampleBtn: {
    paddingHorizontal: 14,
    paddingVertical: 9,
    borderRadius: 8,
    borderWidth: 1,
  },
  sampleBtnText: {
    fontSize: 13,
    fontWeight: '600',
  },
  unlockBtn: {
    paddingHorizontal: 18,
    paddingVertical: 9,
    borderRadius: 8,
  },
  unlockBtnText: {
    color: '#FFFFFF',
    fontSize: 13,
    fontWeight: '700',
  },
  skinGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  skinCard: {
    width: '48%',
    borderRadius: 14,
    padding: 14,
    marginBottom: 4,
  },
  skinCardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 6,
  },
  skinName: {
    fontSize: 15,
    fontWeight: '700',
  },
  skinActiveBadge: {
    width: 20,
    height: 20,
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
  },
  skinActiveBadgeText: {
    color: '#FFFFFF',
    fontSize: 11,
    fontWeight: '700',
  },
  skinDesc: {
    fontSize: 11,
    lineHeight: 15,
    marginBottom: 12,
    minHeight: 30,
  },
  skinSelectBtn: {
    borderRadius: 6,
    paddingVertical: 6,
    alignItems: 'center',
  },
  skinSelectBtnText: {
    fontSize: 12,
    fontWeight: '600',
  },
  thankBox: {
    padding: 16,
    borderRadius: 14,
    borderWidth: 1,
    marginBottom: 16,
  },
  thankTitle: {
    fontSize: 16,
    fontWeight: '700',
    marginBottom: 8,
  },
  thankDesc: {
    fontSize: 13,
    lineHeight: 20,
  },
  tipRow: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 18,
  },
  tipButton: {
    flex: 1,
    paddingVertical: 14,
    borderRadius: 12,
    borderWidth: 1.5,
    alignItems: 'center',
    gap: 6,
  },
  tipIcon: {
    fontSize: 22,
  },
  tipBtnText: {
    fontSize: 13,
    fontWeight: '700',
  },
  promoBox: {
    padding: 16,
    borderRadius: 14,
    borderWidth: 1,
  },
  promoTitle: {
    fontSize: 14,
    fontWeight: '700',
    marginBottom: 10,
  },
  promoInputRow: {
    flexDirection: 'row',
    gap: 8,
  },
  promoInput: {
    flex: 1,
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 8,
    fontSize: 13,
  },
  redeemBtn: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
    justifyContent: 'center',
  },
  redeemBtnText: {
    color: '#FFFFFF',
    fontSize: 13,
    fontWeight: '700',
  },
  syncBanner: {
    marginTop: 18,
    marginBottom: 8,
    padding: 14,
    borderRadius: 14,
    borderWidth: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 12,
  },
  syncBannerContent: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  syncBannerIcon: {
    fontSize: 20,
  },
  syncBannerTitle: {
    fontSize: 13,
    fontWeight: '700',
  },
  syncBannerSubtitle: {
    fontSize: 11,
    marginTop: 2,
  },
  syncBannerBtn: {
    paddingHorizontal: 12,
    paddingVertical: 7,
    borderRadius: 8,
    borderWidth: 1,
  },
  syncBannerBtnText: {
    fontSize: 12,
    fontWeight: '700',
  },
  supporterSkinBanner: {
    padding: 12,
    borderRadius: 12,
    borderWidth: 1,
    marginBottom: 14,
    alignItems: 'center',
    justifyContent: 'center',
  },
  supporterSkinBannerText: {
    fontSize: 13,
    fontWeight: '700',
    textAlign: 'center',
  },
  bundleSkinBanner: {
    padding: 14,
    borderRadius: 14,
    borderWidth: 1.5,
    marginBottom: 14,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 12,
  },
  bundleSkinBannerTitle: {
    fontSize: 14,
    fontWeight: '800',
  },
  bundleSkinBannerSub: {
    fontSize: 11,
    marginTop: 2,
  },
  bundleSkinPriceBadge: {
    backgroundColor: '#D97706',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 999,
  },
  bundleSkinPriceText: {
    color: '#FFFFFF',
    fontSize: 13,
    fontWeight: '800',
  },
  skinLockedBadge: {
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 6,
    backgroundColor: 'rgba(0,0,0,0.4)',
  },
  skinLockedBadgeText: {
    fontSize: 11,
  },
  confirmOverlay: {
    ...StyleSheet.absoluteFill,
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 1000,
  },
  confirmBackdrop: {
    ...StyleSheet.absoluteFill,
    backgroundColor: 'rgba(0, 0, 0, 0.78)',
    ...Platform.select({
      web: {
        backdropFilter: 'blur(24px)',
        WebkitBackdropFilter: 'blur(24px)',
      } as any,
    }),
  },
  confirmCard: {
    width: '90%',
    maxWidth: 380,
    borderRadius: 20,
    borderWidth: 1,
    padding: 24,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.28,
    shadowRadius: 20,
    elevation: 10,
  },
  confirmIconCircle: {
    width: 52,
    height: 52,
    borderRadius: 26,
    backgroundColor: 'rgba(196, 112, 79, 0.15)',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 12,
  },
  confirmIconText: {
    fontSize: 26,
  },
  confirmTitle: {
    fontSize: 18,
    fontWeight: '800',
    textAlign: 'center',
    marginBottom: 8,
  },
  confirmDesc: {
    fontSize: 13,
    lineHeight: 19,
    textAlign: 'center',
    marginBottom: 16,
    paddingHorizontal: 4,
  },
  confirmItemBox: {
    width: '100%',
    borderRadius: 12,
    borderWidth: 1,
    padding: 12,
    marginBottom: 18,
    gap: 8,
  },
  confirmItemRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  confirmItemLabel: {
    fontSize: 12,
    fontWeight: '500',
  },
  confirmItemValue: {
    fontSize: 13,
    fontWeight: '700',
    maxWidth: '65%',
  },
  confirmItemPrice: {
    fontSize: 15,
    fontWeight: '800',
  },
  confirmActionsRow: {
    flexDirection: 'row',
    width: '100%',
    gap: 10,
  },
  confirmCancelBtn: {
    flex: 1,
    height: 44,
    borderRadius: 12,
    borderWidth: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  confirmCancelBtnText: {
    fontSize: 13,
    fontWeight: '600',
  },
  confirmPayBtn: {
    flex: 1.4,
    height: 44,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  confirmPayBtnText: {
    color: '#FFFFFF',
    fontSize: 13,
    fontWeight: '700',
  },
});
