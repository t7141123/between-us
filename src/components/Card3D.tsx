/**
 * 3D Interactive Card Component supporting smooth Y-axis flip rotation,
 * dual face rendering, gestures, and gold accent styling.
 */
import React, { useRef, useEffect } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Animated,
  Platform,
  PanResponder,
} from 'react-native';
import Svg, { Path, Circle, Line } from 'react-native-svg';
import { Bookmark, Timer, RefreshCw, RotateCcw } from 'lucide-react-native';
import { LocaleKey, QuestionEntry, ThemeColors } from '../types';
import { I18nService } from '../services/i18n';

interface Card3DProps {
  question: QuestionEntry | null;
  totalInDeck: number;
  currentIndex: number;
  locale: LocaleKey;
  colors: ThemeColors;
  isFavorite: boolean;
  onToggleFavorite: () => void;
  onOpenTimer: () => void;
  onNextQuestion: () => void;
  onFlipCard?: () => void;
}

export const Card3D: React.FC<Card3DProps> = ({
  question,
  totalInDeck,
  currentIndex,
  locale,
  colors,
  isFavorite,
  onToggleFavorite,
  onOpenTimer,
  onNextQuestion,
  onFlipCard,
}) => {
  const animatedValue = useRef(new Animated.Value(0)).current;
  const isFlippedRef = useRef(false);

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
    <View style={styles.cardContainer} {...panResponder.panHandlers}>
      {/* Front Face */}
      <Animated.View
        style={[
          styles.cardFace,
          styles.cardFront,
          {
            backgroundColor: colors.card,
            borderColor: colors.line,
            transform: [{ rotateY: frontInterpolate }],
            opacity: frontOpacity,
          },
        ]}
      >
        <TouchableOpacity
          style={styles.innerTouchable}
          activeOpacity={0.96}
          onPress={flipCard}
        >
          {/* Inner decorative gold border */}
          <View style={[styles.innerBorder, { borderColor: colors.gold }]} />

          {/* Front Header */}
          <View style={styles.cardHeader}>
            <View style={[styles.categoryBadge, { backgroundColor: colors.badgeBg, borderColor: colors.clay }]}>
              <Text style={[styles.categoryText, { color: colors.clay }]}>
                {question?.categoryLabel || ''}
              </Text>
            </View>

            <View style={styles.headerActions}>
              <TouchableOpacity
                onPress={onOpenTimer}
                style={styles.actionBtn}
                activeOpacity={0.7}
                accessibilityLabel="開啟計時器"
              >
                <Timer size={18} color={colors.muted} />
              </TouchableOpacity>

              <TouchableOpacity
                onPress={onToggleFavorite}
                style={styles.actionBtn}
                activeOpacity={0.7}
                accessibilityLabel="收藏此題"
              >
                <Bookmark
                  size={18}
                  color={isFavorite ? colors.clay : colors.muted}
                  fill={isFavorite ? colors.clay : 'none'}
                />
              </TouchableOpacity>
            </View>
          </View>

          {/* Question Text Body */}
          <View style={styles.bodyContainer}>
            <Text style={[styles.questionNumber, { color: colors.clay }]}>
              NO. {padIndex}
            </Text>
            <Text style={[styles.questionText, { color: colors.ink }]}>
              {question?.text || I18nService.t(locale, 'deck_empty')}
            </Text>
          </View>

          {/* Front Footer */}
          <View style={[styles.cardFooter, { borderTopColor: colors.line }]}>
            <View style={styles.footerPrompt}>
              <RefreshCw size={13} color={colors.muted} />
              <Text style={[styles.promptText, { color: colors.muted }]}>{frontHint}</Text>
            </View>
            <Text style={[styles.progressText, { color: colors.muted }]}>
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
            backgroundColor: colors.cardBack,
            borderColor: colors.line,
            transform: [{ rotateY: backInterpolate }],
            opacity: backOpacity,
          },
        ]}
      >
        <TouchableOpacity
          style={styles.innerTouchable}
          activeOpacity={0.96}
          onPress={flipCard}
        >
          {/* Inner decorative gold border */}
          <View style={[styles.innerBorder, { borderColor: colors.gold }]} />

          {/* Back Header */}
          <View style={styles.cardHeader}>
            <Text style={[styles.backBrandText, { color: colors.muted }]}>BETWEEN US</Text>
            <TouchableOpacity onPress={flipCard} style={styles.actionBtn}>
              <RotateCcw size={16} color={colors.muted} />
            </TouchableOpacity>
          </View>

          {/* Back Graphic & Quote */}
          <View style={styles.backBody}>
            <View style={[styles.portalIconContainer, { backgroundColor: colors.badgeBg }]}>
              <Svg width={32} height={32} viewBox="0 0 48 48" fill="none">
                <Path
                  d="M12 40V24a12 12 0 0 1 24 0v16"
                  stroke={colors.clay}
                  strokeWidth={2}
                  strokeLinecap="round"
                />
                <Path
                  d="M16 40V24a8 8 0 0 1 16 0v16"
                  stroke={colors.clay}
                  strokeWidth={1.5}
                />
                <Circle cx={24} cy={14} r={2.5} fill={colors.clay} />
                <Line x1={8} y1={40} x2={40} y2={40} stroke={colors.clay} strokeWidth={2} />
              </Svg>
            </View>

            <Text style={[styles.backTitle, { color: colors.ink }]}>{backTitle}</Text>
            <View style={[styles.goldDivider, { backgroundColor: colors.gold }]} />
            <Text style={[styles.backQuote, { color: colors.muted }]}>{backQuote}</Text>
          </View>

          {/* Back Footer */}
          <View style={[styles.cardFooter, { borderTopColor: colors.line, justifyContent: 'center' }]}>
            <View style={styles.footerPrompt}>
              <RotateCcw size={13} color={colors.muted} />
              <Text style={[styles.promptText, { color: colors.muted }]}>{backHint}</Text>
            </View>
          </View>
        </TouchableOpacity>
      </Animated.View>
    </View>
  );
};

const styles = StyleSheet.create({
  cardContainer: {
    width: '100%',
    maxWidth: 540,
    minHeight: Platform.OS === 'web' ? 380 : 350,
    alignSelf: 'center',
    marginVertical: 12,
  },
  cardFace: {
    width: '100%',
    minHeight: Platform.OS === 'web' ? 380 : 350,
    borderRadius: 28,
    borderWidth: 1,
    shadowOffset: { width: 0, height: 12 },
    shadowOpacity: 0.1,
    shadowRadius: 24,
    elevation: 8,
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
    padding: Platform.OS === 'web' ? 28 : 22,
    justifyContent: 'space-between',
  },
  innerBorder: {
    position: 'absolute',
    top: 10,
    left: 10,
    right: 10,
    bottom: 10,
    borderWidth: 1,
    borderRadius: 20,
    pointerEvents: 'none',
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    zIndex: 2,
  },
  categoryBadge: {
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 14,
    borderWidth: 1,
  },
  categoryText: {
    fontSize: 11,
    fontWeight: '600',
    letterSpacing: 0.8,
  },
  headerActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  actionBtn: {
    padding: 6,
  },
  bodyContainer: {
    marginVertical: 24,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 12,
  },
  questionNumber: {
    fontSize: 11,
    letterSpacing: 3,
    fontWeight: '600',
    marginBottom: 12,
  },
  questionText: {
    fontSize: Platform.OS === 'web' ? 25 : 21,
    lineHeight: Platform.OS === 'web' ? 42 : 34,
    textAlign: 'center',
    fontWeight: '400',
    fontFamily: Platform.OS === 'ios' ? 'Georgia' : 'serif',
  },
  cardFooter: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingTop: 12,
    borderTopWidth: 1,
    zIndex: 2,
  },
  footerPrompt: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  promptText: {
    fontSize: 11,
    fontWeight: '500',
  },
  progressText: {
    fontSize: 11,
    fontWeight: '500',
    letterSpacing: 1,
  },
  backBrandText: {
    fontSize: 10,
    fontWeight: '600',
    letterSpacing: 2,
  },
  backBody: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 18,
  },
  portalIconContainer: {
    width: 56,
    height: 56,
    borderRadius: 28,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
  },
  backTitle: {
    fontSize: 24,
    fontWeight: '400',
    fontFamily: Platform.OS === 'ios' ? 'Georgia' : 'serif',
    marginBottom: 8,
  },
  goldDivider: {
    width: 36,
    height: 1,
    marginBottom: 12,
  },
  backQuote: {
    fontSize: 14,
    lineHeight: 22,
    textAlign: 'center',
    maxWidth: 280,
  },
});
