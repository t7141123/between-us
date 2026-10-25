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
  TextInput,
  View,
} from 'react-native';
import { CARD_SKINS, CardSkinConfig, EXPANSION_PACKS } from '../constants/packs';
import { AuthUser } from '../services/auth';
import { I18nService } from '../services/i18n';
import { PaymentService, StoreItemKey } from '../services/payment';
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
  currentUser?: AuthUser | null;
  onSelectSkin: (skinId: CardSkinId) => void;
  onUnlockSkin?: (skinId: CardSkinId) => void;
  onUnlockPack: (packId: string) => void;
  onSetSupporter: (isSupporter: boolean) => void;
  onLoadPackSample?: (packId: string) => void;
  onOpenAuth?: () => void;
  onLogout?: () => void;
}

type TabKey = 'packs' | 'skins' | 'support';

interface PendingCheckout {
  itemKey: StoreItemKey;
  title: string;
  amountText: string;
  type: 'pack' | 'skin' | 'bundle_skins' | 'supporter';
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
  currentUser,
  onSelectSkin,
  onUnlockSkin,
  onUnlockPack,
  onSetSupporter,
  onLoadPackSample,
  onOpenAuth,
  onLogout,
}) => {
  const [activeTab, setActiveTab] = useState<TabKey>('packs');
  const [promoCode, setPromoCode] = useState('');
  const [redeemFeedback, setRedeemFeedback] = useState<string | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [pendingCheckout, setPendingCheckout] = useState<PendingCheckout | null>(null);

  const isDark = theme === 'dark';

  const handleRedeem = () => {
    const code = promoCode.trim().toUpperCase();
    if (code === 'LOVE2026' || code === 'VIP2026' || code === 'SENSUAL') {
      onUnlockPack('sensual');
      setRedeemFeedback(I18nService.t(locale, 'redeem_success'));
      setPromoCode('');
    } else if (code === 'MARRIAGE' || code === 'IDO' || code === 'WEDDING') {
      onUnlockPack('marriage');
      setRedeemFeedback(I18nService.t(locale, 'redeem_success'));
      setPromoCode('');
    } else if (code === 'BABY' || code === 'PARENT' || code === 'NEWBORN') {
      onUnlockPack('parenting');
      setRedeemFeedback(I18nService.t(locale, 'redeem_success'));
      setPromoCode('');
    } else if (code === 'SKIN' || code === 'GOLD' || code === 'NOIR') {
      onUnlockSkin?.('noir_gold');
      onUnlockSkin?.('midnight');
      onUnlockSkin?.('caramel');
      setRedeemFeedback(I18nService.t(locale, 'redeem_success'));
      setPromoCode('');
    } else if (code === 'COFFEE' || code === 'SUPPORTER') {
      onSetSupporter(true);
      setRedeemFeedback(I18nService.t(locale, 'redeem_success'));
      setPromoCode('');
    } else {
      setRedeemFeedback(I18nService.t(locale, 'redeem_invalid'));
    }
    setTimeout(() => {
      setRedeemFeedback(null);
    }, 4000);
  };

  const requestPackCheckout = (pack: typeof EXPANSION_PACKS[0]) => {
    const itemKey: StoreItemKey =
      pack.id === 'marriage'
        ? 'pack_marriage'
        : pack.id === 'parenting'
        ? 'pack_parenting'
        : 'pack_sensual';
    setPendingCheckout({
      itemKey,
      title: I18nService.t(locale, pack.titleKey),
      amountText: pack.priceText,
      type: 'pack',
      targetId: pack.id,
    });
  };

  const requestSkinCheckout = (skin: CardSkinConfig) => {
    const itemKey: StoreItemKey =
      skin.id === 'noir_gold'
        ? 'skin_noir_gold'
        : skin.id === 'midnight'
        ? 'skin_midnight'
        : 'skin_caramel';
    setPendingCheckout({
      itemKey,
      title: `${I18nService.t(locale, skin.nameKey)} (${I18nService.t(locale, 'tab_skins')})`,
      amountText: 'NT$ 45',
      type: 'skin',
      targetId: skin.id,
    });
  };

  const requestBundleSkinsCheckout = () => {
    setPendingCheckout({
      itemKey: 'bundle_skins',
      title: I18nService.t(locale, 'skin_unlock_bundle'),
      amountText: 'NT$ 90',
      type: 'bundle_skins',
    });
  };

  const requestTipCheckout = (itemKey: 'tip_coffee' | 'tip_afternoon') => {
    const isCoffee = itemKey === 'tip_coffee';
    setPendingCheckout({
      itemKey,
      title: I18nService.t(locale, itemKey),
      amountText: isCoffee ? 'NT$ 60' : 'NT$ 120',
      type: 'supporter',
    });
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
          setRedeemFeedback(res.error || '啟動綠界支付失敗');
        }
      } finally {
        setIsProcessing(false);
      }
    } else {
      if (checkout.type === 'pack' && checkout.targetId) {
        onUnlockPack(checkout.targetId);
      } else if (checkout.type === 'skin' && checkout.targetId) {
        onUnlockSkin?.(checkout.targetId as CardSkinId);
        onSelectSkin(checkout.targetId as CardSkinId);
      } else if (checkout.type === 'bundle_skins') {
        onUnlockSkin?.('noir_gold');
        onUnlockSkin?.('midnight');
        onUnlockSkin?.('caramel');
      } else if (checkout.type === 'supporter') {
        onSetSupporter(true);
      }
      setRedeemFeedback(I18nService.t(locale, 'redeem_success'));
      setTimeout(() => setRedeemFeedback(null), 3000);
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
            {(['packs', 'skins', 'support'] as TabKey[]).map((tab) => {
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
                            {pack.totalCount} 道私密話題
                          </Text>
                        </View>
                        <Text style={[styles.packPrice, { color: colors.clay }]}>
                          {isUnlocked ? I18nService.t(locale, 'unlocked') : pack.priceText}
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
                            {isUnlocked ? '載入題庫' : I18nService.t(locale, 'unlock_now')}
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
                        曜石黑金、午夜星空、暖陽焦糖一次珍藏
                      </Text>
                    </View>
                    <View style={styles.bundleSkinPriceBadge}>
                      <Text style={styles.bundleSkinPriceText}>NT$ 90</Text>
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

                {/* Promo Code Box */}
                <View
                  style={[
                    styles.promoBox,
                    {
                      backgroundColor: isDark ? '#292524' : '#FFFFFF',
                      borderColor: isDark ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.06)',
                    },
                  ]}
                >
                  <Text style={[styles.promoTitle, { color: colors.ink }]}>
                    {I18nService.t(locale, 'redeem_code')}
                  </Text>
                  <View style={styles.promoInputRow}>
                    <TextInput
                      value={promoCode}
                      onChangeText={setPromoCode}
                      placeholder={I18nService.t(locale, 'redeem_placeholder')}
                      placeholderTextColor={colors.muted}
                      autoCapitalize="characters"
                      style={[
                        styles.promoInput,
                        {
                          color: colors.ink,
                          borderColor: isDark ? 'rgba(255,255,255,0.15)' : 'rgba(0,0,0,0.12)',
                          backgroundColor: isDark ? '#1C1917' : '#FAF6F0',
                        },
                      ]}
                    />
                    <Pressable
                      onPress={handleRedeem}
                      style={[styles.redeemBtn, { backgroundColor: colors.clay }]}
                    >
                      <Text style={styles.redeemBtnText}>
                        {I18nService.t(locale, 'redeem_btn')}
                      </Text>
                    </Pressable>
                  </View>
                </View>
              </View>
            )}

            {/* Cross-device Cloud Sync Card */}
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
                {I18nService.t(locale, 'checkout_confirm_desc')}
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
    backgroundColor: 'rgba(0, 0, 0, 0.65)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 16,
  },
  backdrop: {
    ...StyleSheet.absoluteFillObject,
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
        shadowOffset: { width: 0, height: 8 },
        shadowOpacity: 0.25,
        shadowRadius: 16,
      },
      android: { elevation: 8 },
      web: { boxShadow: '0 8px 32px rgba(0,0,0,0.2)' },
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
    ...StyleSheet.absoluteFillObject,
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 1000,
  },
  confirmBackdrop: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0, 0, 0, 0.65)',
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
