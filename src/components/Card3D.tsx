/**
 * 3D Interactive Card Component supporting smooth Y-axis flip rotation,
 * dual face rendering, gestures, and gold accent styling.
 */
import React, { useRef, useEffect, useState, forwardRef, useImperativeHandle } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Animated,
  Platform,
  PanResponder,
  useWindowDimensions,
} from 'react-native';
import Svg, { Path, Circle, Line } from 'react-native-svg';
import { Bookmark, Timer, RefreshCw, RotateCcw, Share2, Lock } from 'lucide-react-native';
import { CardSkinId, LocaleKey, QuestionEntry, ThemeColors } from '../types';
import { I18nService } from '../services/i18n';
import { CARD_SKINS } from '../constants/packs';

export interface Card3DHandle {
  flip: () => void;
}

interface Card3DProps {
  question: QuestionEntry | null;
  totalInDeck: number;
  currentIndex: number;
  locale: LocaleKey;
  colors: ThemeColors;
  skinId?: CardSkinId;
  isFavorite: boolean;
  onToggleFavorite: () => void;
  onOpenTimer: () => void;
  onNextQuestion: () => void;
  onFlipCard?: () => void;
  onOpenStore?: () => void;
}

export const Card3D = forwardRef<Card3DHandle, Card3DProps>(({
  question,
  totalInDeck,
  currentIndex,
  locale,
  colors,
  skinId = 'classic',
  isFavorite,
  onToggleFavorite,
  onOpenTimer,
  onNextQuestion,
  onFlipCard,
  onOpenStore,
}, ref) => {
  const { width, height } = useWindowDimensions();
  const isMobile = width < 600 || height < 750;

  const skinConfig = CARD_SKINS.find((s) => s.id === skinId) || CARD_SKINS[0];
  const hasCustomSkin = skinConfig.id !== 'classic';

  // Compute dynamic front and back skin colors
  const cardBgColor = hasCustomSkin ? skinConfig.bgColor : colors.card;
  const cardBorderColor = hasCustomSkin ? skinConfig.borderColor : colors.line;
  const cardAccentColor = hasCustomSkin ? skinConfig.accentColor : colors.clay;
  const cardTextColor = hasCustomSkin ? skinConfig.textColor : colors.ink;
  const cardSubTextColor = hasCustomSkin
    ? skinConfig.subTextColor
    : colors.muted;
  const cardInnerBorderColor = hasCustomSkin ? skinConfig.accentColor : colors.gold;

  const animatedValue = useRef(new Animated.Value(0)).current;
  const isFlippedRef = useRef(false);
  const [shareToast, setShareToast] = useState(false);

  const isLocked = Boolean(question?.id.endsWith('-lock'));

  const handleShare = async () => {
    if (!question || isLocked) return;
    const shareText = `${I18nService.t(locale, 'share_prefix', '💌 在我們之間：「')}${question.text}${I18nService.t(locale, 'share_suffix', '」\n\n今晚我們來聊聊這題吧 ✨')}`;

    const shareUrl =
      Platform.OS === 'web' && typeof window !== 'undefined'
        ? window.location.origin.includes('localhost')
          ? window.location.href
          : 'https://between-us.ark-studio.app/'
        : 'https://between-us.ark-studio.app/';

    if (Platform.OS === 'web' && typeof navigator !== 'undefined') {
      if (navigator.share) {
        try {
          await navigator.share({
            title: '在我們之間 Between Us',
            text: shareText,
            url: shareUrl,
          });
          return;
        } catch {
          // Fallback to clipboard
        }
      }
      if (navigator.clipboard) {
        await navigator.clipboard.writeText(`${shareText}\n${shareUrl}`);
        setShareToast(true);
        setTimeout(() => setShareToast(false), 2500);
      }
    }
  };

  // Reset flip state when question changes
  useEffect(() => {
    if (isFlippedRef.current) {
      Animated.timing(animatedValue, {
        toValue: 0,
        duration: 350,
        useNativeDriver: true,
      }).start(() => {
        isFlippedRef.current = false;
      });
    }
  }, [question, animatedValue]);

  const flipCard = () => {
    onFlipCard?.();
    if (isFlippedRef.current) {
      Animated.spring(animatedValue, {
        toValue: 0,
        friction: 8,
        tension: 10,
        useNativeDriver: true,
      }).start(() => {
        isFlippedRef.current = false;
      });
    } else {
      Animated.spring(animatedValue, {
        toValue: 180,
        friction: 8,
        tension: 10,
        useNativeDriver: true,
      }).start(() => {
        isFlippedRef.current = true;
      });
    }
  };

  useImperativeHandle(ref, () => ({
    flip: flipCard,
  }));

  // Horizontal swipe gesture for next question
  const panResponder = useRef(
    PanResponder.create({
      onMoveShouldSetPanResponder: (_, gestureState) => {
        return Math.abs(gestureState.dx) > 25 && Math.abs(gestureState.dy) < 20;
      },
      onPanResponderRelease: (_, gestureState) => {
        if (Math.abs(gestureState.dx) > 50) {
          onNextQuestion();
        }
      },
    })
  ).current;

  // Rotation interpolations
  const frontInterpolate = animatedValue.interpolate({
    inputRange: [0, 180],
    outputRange: ['0deg', '180deg'],
  });
  const backInterpolate = animatedValue.interpolate({
    inputRange: [0, 180],
    outputRange: ['180deg', '360deg'],
  });

  const frontOpacity = animatedValue.interpolate({
    inputRange: [89, 90],
    outputRange: [1, 0],
  });
  const backOpacity = animatedValue.interpolate({
    inputRange: [89, 90],
    outputRange: [0, 1],
  });

  const padIndex = String(currentIndex + 1).padStart(3, '0');
  const frontHint = I18nService.t(locale, 'card_front_hint', '點擊翻面看提示');
  const backTitle = I18nService.t(locale, 'back_title', '在我們之間');
  const backQuote = I18nService.t(locale, 'back_quote', '慢慢說，慢慢聽。沒有標準答案。');
  const backHint = I18nService.t(locale, 'card_back_hint', '點擊翻回題目');

  return (
    <View
      style={[
        styles.cardContainer,
        { minHeight: isMobile ? 300 : (Platform.OS === 'web' ? 380 : 350) },
      ]}
      {...panResponder.panHandlers}
    >
      {/* Front Face */}
      <Animated.View
        style={[
          styles.cardFace,
          styles.cardFront,
          {
            backgroundColor: cardBgColor,
            borderColor: cardBorderColor,
            minHeight: isMobile ? 300 : (Platform.OS === 'web' ? 380 : 350),
            borderRadius: isMobile ? 22 : 28,
            transform: [{ rotateY: frontInterpolate }],
            opacity: frontOpacity,
          },
        ]}
      >
        <TouchableOpacity
          style={[styles.innerTouchable, isMobile && styles.innerTouchableMobile]}
          activeOpacity={0.96}
          onPress={flipCard}
          accessible={true}
          accessibilityRole="button"
          accessibilityLabel={`${question?.categoryLabel || ''}, ${question?.text || ''}`}
          accessibilityHint={frontHint}
        >
          {/* Inner decorative gold border */}
          <View pointerEvents="none" style={[styles.innerBorder, { borderColor: cardInnerBorderColor }]} />

          {/* Front Header */}
          <View style={styles.cardHeader}>
            <View
              style={[
                styles.categoryBadge,
                {
                  backgroundColor: hasCustomSkin
                    ? (skinConfig.isDarkSkin ? 'rgba(255,255,255,0.08)' : 'rgba(180,83,9,0.12)')
                    : colors.badgeBg,
                  borderColor: cardAccentColor,
                },
              ]}
            >
              <Text
                style={[styles.categoryText, { color: cardAccentColor }]}
                numberOfLines={1}
                ellipsizeMode="tail"
              >
                {question?.categoryLabel || ''}
              </Text>
            </View>

            <View style={styles.headerActions}>
              {!isLocked && (
                <TouchableOpacity
                  onPress={handleShare}
                  style={styles.actionBtn}
                  activeOpacity={0.7}
                  accessibilityLabel="分享題目"
                  hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}
                >
                  <Share2 size={isMobile ? 15 : 17} color={shareToast ? cardAccentColor : cardSubTextColor} />
                </TouchableOpacity>
              )}

              <TouchableOpacity
                onPress={onOpenTimer}
                style={styles.actionBtn}
                activeOpacity={0.7}
                accessibilityLabel="開啟計時器"
                hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}
              >
                <Timer size={isMobile ? 16 : 18} color={cardSubTextColor} />
              </TouchableOpacity>

              <TouchableOpacity
                onPress={onToggleFavorite}
                style={styles.actionBtn}
                activeOpacity={0.7}
                accessibilityLabel="收藏此題"
                hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}
              >
                <Bookmark
                  size={isMobile ? 16 : 18}
                  color={isFavorite ? cardAccentColor : cardSubTextColor}
                  fill={isFavorite ? cardAccentColor : 'none'}
                />
              </TouchableOpacity>
            </View>
          </View>

          {/* Share Toast Banner */}
          {shareToast && (
            <View style={[styles.shareToastBanner, { backgroundColor: colors.clay }]}>
              <Text style={styles.shareToastText}>
                {I18nService.t(locale, 'share_question_copied', '已複製題目！快分享給另一半吧 💌')}
              </Text>
            </View>
          )}

          {/* Question Text Body */}
          <View style={[styles.bodyContainer, isMobile && styles.bodyContainerMobile]}>
            {isLocked ? (
              <View style={styles.lockContent}>
                <View style={[styles.lockIconCircle, { backgroundColor: colors.badgeBg }]}>
                  <Lock size={26} color={colors.clay} />
                </View>
                <Text
                  style={[
                    styles.questionText,
                    {
                      color: cardTextColor,
                      fontSize: isMobile ? 17 : 20,
                      lineHeight: isMobile ? 26 : 30,
                      textAlign: 'center',
                      marginTop: 12,
                      marginBottom: 16,
                    },
                  ]}
                >
                  {question?.text}
                </Text>
                {onOpenStore && (
                  <TouchableOpacity
                    onPress={onOpenStore}
                    style={[styles.unlockCardBtn, { backgroundColor: cardAccentColor }]}
                    activeOpacity={0.8}
                  >
                    <Text style={styles.unlockCardBtnText}>
                      {I18nService.t(locale, 'pack_unlock_now', '前往主題商店解鎖')}
                    </Text>
                  </TouchableOpacity>
                )}
              </View>
            ) : (
              <>
                <Text style={[styles.questionNumber, { color: cardAccentColor }]}>
                  NO. {padIndex}
                </Text>
                <Text
                  style={[
                    styles.questionText,
                    {
                      color: cardTextColor,
                      fontSize: isMobile ? 19 : (Platform.OS === 'web' ? 24 : 21),
                      lineHeight: isMobile ? 29 : (Platform.OS === 'web' ? 38 : 34),
                    },
                  ]}
                >
                  {question?.text || I18nService.t(locale, 'deck_empty')}
                </Text>
              </>
            )}
          </View>

          {/* Front Footer */}
          <View style={[styles.cardFooter, { borderTopColor: cardBorderColor }]}>
            <View style={styles.footerPrompt}>
              <RefreshCw size={12} color={cardSubTextColor} />
              <Text
                style={[styles.promptText, { color: cardSubTextColor }]}
                numberOfLines={1}
                ellipsizeMode="tail"
              >
                {frontHint}
              </Text>
            </View>
            <Text style={[styles.progressText, { color: cardSubTextColor }]}>
              {currentIndex + 1} / {totalInDeck}
            </Text>
          </View>
        </TouchableOpacity>
      </Animated.View>

      {/* Back Face */}
      <Animated.View
        style={[
          styles.cardFace,
          styles.cardBack,
          {
            backgroundColor: hasCustomSkin ? skinConfig.bgColor : colors.cardBack,
            borderColor: hasCustomSkin ? skinConfig.borderColor : colors.line,
            minHeight: isMobile ? 300 : (Platform.OS === 'web' ? 380 : 350),
            borderRadius: isMobile ? 22 : 28,
            transform: [{ rotateY: backInterpolate }],
            opacity: backOpacity,
          },
        ]}
      >
        <TouchableOpacity
          style={[styles.innerTouchable, isMobile && styles.innerTouchableMobile]}
          activeOpacity={0.96}
          onPress={flipCard}
          accessible={true}
          accessibilityRole="button"
          accessibilityLabel={`${backTitle}, ${backQuote}`}
          accessibilityHint={backHint}
        >
          {/* Inner decorative gold border */}
          <View
            pointerEvents="none"
            style={[
              styles.innerBorder,
              { borderColor: hasCustomSkin ? skinConfig.accentColor : colors.gold },
            ]}
          />

          {/* Back Header */}
          <View style={styles.cardHeader}>
            <Text
              style={[
                styles.backBrandText,
                { color: hasCustomSkin ? skinConfig.accentColor : colors.muted },
              ]}
            >
              BETWEEN US
            </Text>
            <TouchableOpacity
              onPress={flipCard}
              style={styles.actionBtn}
              accessibilityLabel="翻回正面"
              hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}
            >
              <RotateCcw
                size={15}
                color={hasCustomSkin ? skinConfig.accentColor : colors.muted}
              />
            </TouchableOpacity>
          </View>

          {/* Back Graphic & Quote */}
          <View style={[styles.backBody, isMobile && styles.backBodyMobile]}>
            <View
              style={[
                styles.portalIconContainer,
                isMobile && styles.portalIconMobile,
                {
                  backgroundColor: hasCustomSkin
                    ? (skinConfig.isDarkSkin ? 'rgba(255,255,255,0.08)' : 'rgba(180,83,9,0.12)')
                    : colors.badgeBg,
                },
              ]}
            >
              <Svg width={isMobile ? 26 : 32} height={isMobile ? 26 : 32} viewBox="0 0 48 48" fill="none">
                <Path
                  d="M12 40V24a12 12 0 0 1 24 0v16"
                  stroke={cardAccentColor}
                  strokeWidth={2}
                  strokeLinecap="round"
                />
                <Path
                  d="M16 40V24a8 8 0 0 1 16 0v16"
                  stroke={cardAccentColor}
                  strokeWidth={1.5}
                />
                <Circle cx={24} cy={14} r={2.5} fill={cardAccentColor} />
                <Line x1={8} y1={40} x2={40} y2={40} stroke={cardAccentColor} strokeWidth={2} />
              </Svg>
            </View>

            <Text
              style={[
                styles.backTitle,
                {
                  color: hasCustomSkin ? skinConfig.textColor : colors.ink,
                  fontSize: isMobile ? 20 : 24,
                  marginBottom: isMobile ? 4 : 8,
                },
              ]}
            >
              {backTitle}
            </Text>
            <View
              style={[
                styles.goldDivider,
                { backgroundColor: hasCustomSkin ? skinConfig.accentColor : colors.gold },
              ]}
            />
            <Text
              style={[
                styles.backQuote,
                {
                  color: hasCustomSkin ? skinConfig.textColor : colors.muted,
                  opacity: hasCustomSkin ? 0.85 : 1,
                  fontSize: isMobile ? 13 : 14,
                  lineHeight: isMobile ? 20 : 22,
                },
              ]}
            >
              {backQuote}
            </Text>
          </View>

          {/* Back Footer */}
          <View
            style={[
              styles.cardFooter,
              {
                borderTopColor: hasCustomSkin ? skinConfig.borderColor : colors.line,
                justifyContent: 'center',
              },
            ]}
          >
            <View style={styles.footerPrompt}>
              <RotateCcw
                size={12}
                color={hasCustomSkin ? skinConfig.accentColor : colors.muted}
              />
              <Text
                style={[
                  styles.promptText,
                  { color: hasCustomSkin ? skinConfig.accentColor : colors.muted },
                ]}
                numberOfLines={1}
                ellipsizeMode="tail"
              >
                {backHint}
              </Text>
            </View>
          </View>
        </TouchableOpacity>
      </Animated.View>
    </View>
  );
});

Card3D.displayName = 'Card3D';

const styles = StyleSheet.create({
  cardContainer: {
    width: '100%',
    maxWidth: 540,
    alignSelf: 'center',
    marginVertical: 8,
  },
  cardFace: {
    width: '100%',
    borderWidth: 1,
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.08,
    shadowRadius: 20,
    elevation: 6,
    overflow: 'hidden',
  },
  cardFront: {
    backfaceVisibility: 'hidden',
  },
  cardBack: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backfaceVisibility: 'hidden',
  },
  innerTouchable: {
    flex: 1,
    padding: Platform.OS === 'web' ? 24 : 20,
    justifyContent: 'space-between',
  },
  innerTouchableMobile: {
    padding: 18,
  },
  innerBorder: {
    position: 'absolute',
    top: 8,
    left: 8,
    right: 8,
    bottom: 8,
    borderWidth: 1,
    borderRadius: 18,
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    zIndex: 2,
    gap: 8,
  },
  categoryBadge: {
    paddingHorizontal: 10,
    paddingVertical: 3,
    borderRadius: 12,
    borderWidth: 1,
    flexShrink: 1,
  },
  categoryText: {
    fontSize: 11,
    fontWeight: '600',
    letterSpacing: 0.5,
  },
  headerActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    flexShrink: 0,
  },
  actionBtn: {
    padding: 5,
  },
  bodyContainer: {
    marginVertical: 18,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 10,
  },
  bodyContainerMobile: {
    marginVertical: 10,
    paddingHorizontal: 6,
  },
  questionNumber: {
    fontSize: 11,
    letterSpacing: 3,
    fontWeight: '600',
    marginBottom: 8,
  },
  questionText: {
    textAlign: 'center',
    fontWeight: '400',
    fontFamily: Platform.OS === 'ios' ? 'Georgia' : 'serif',
  },
  shareToastBanner: {
    position: 'absolute',
    top: 54,
    left: 20,
    right: 20,
    zIndex: 10,
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 6,
    elevation: 3,
  },
  shareToastText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '600',
  },
  lockContent: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 8,
  },
  lockIconCircle: {
    width: 52,
    height: 52,
    borderRadius: 26,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 6,
  },
  unlockCardBtn: {
    paddingHorizontal: 18,
    paddingVertical: 9,
    borderRadius: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.12,
    shadowRadius: 4,
    elevation: 2,
  },
  unlockCardBtnText: {
    color: '#FFFFFF',
    fontSize: 13,
    fontWeight: '700',
    letterSpacing: 0.5,
  },
  cardFooter: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingTop: 10,
    borderTopWidth: 1,
    zIndex: 2,
    gap: 8,
  },
  footerPrompt: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    flexShrink: 1,
  },
  promptText: {
    fontSize: 11,
    fontWeight: '500',
    flexShrink: 1,
  },
  progressText: {
    fontSize: 11,
    fontWeight: '500',
    letterSpacing: 1,
    flexShrink: 0,
  },
  backBrandText: {
    fontSize: 10,
    fontWeight: '600',
    letterSpacing: 2,
  },
  backBody: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 14,
  },
  backBodyMobile: {
    paddingVertical: 8,
  },
  portalIconContainer: {
    width: 52,
    height: 52,
    borderRadius: 26,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 12,
  },
  portalIconMobile: {
    width: 44,
    height: 44,
    borderRadius: 22,
    marginBottom: 8,
  },
  backTitle: {
    fontWeight: '400',
    fontFamily: Platform.OS === 'ios' ? 'Georgia' : 'serif',
  },
  goldDivider: {
    width: 32,
    height: 1,
    marginBottom: 10,
  },
  backQuote: {
    textAlign: 'center',
    maxWidth: 280,
  },
});
