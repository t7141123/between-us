/**
 * TimerModal Component: 5-minute conversation timer with audio chimes and confetti.
 */
import React, { useCallback, useEffect, useRef, useState } from 'react';
import {
  View,
  Text,
  Modal,
  TouchableOpacity,
  StyleSheet,
  Platform,
} from 'react-native';
import { X, Clock, Play, Pause, RotateCcw } from 'lucide-react-native';
import confetti from 'canvas-confetti';
import { LocaleKey, ThemeColors } from '../types';
import { I18nService } from '../services/i18n';
import { afterCompletion, allowedDuration, DURATION_OPTIONS, FREE_DURATION, Turn } from '../services/timerCore';

interface TimerModalProps {
  visible: boolean;
  locale: LocaleKey;
  colors: ThemeColors;
  isPlus: boolean;
  onClose: () => void;
  onOpenStore: () => void;
  onPlaySuccessSound?: () => void;
}

export const TimerModal: React.FC<TimerModalProps> = ({
  visible,
  locale,
  colors,
  isPlus,
  onClose,
  onOpenStore,
  onPlaySuccessSound,
}) => {
  const [duration, setDuration] = useState<number>(FREE_DURATION);
  const [timeLeft, setTimeLeft] = useState<number>(FREE_DURATION);
  const [isRunning, setIsRunning] = useState(false);
  const [isCompleted, setIsCompleted] = useState(false);
  const [turnMode, setTurnMode] = useState(false);
  const [turn, setTurn] = useState<Turn>(1);
  const [sessionDone, setSessionDone] = useState(false);
  const remainingRef = useRef<number>(FREE_DURATION);

  const effectiveDuration = allowedDuration(duration, isPlus);
  const effectiveTurnMode = isPlus && turnMode;

  const handleComplete = useCallback(() => {
    setIsRunning(false);
    setIsCompleted(true);
    onPlaySuccessSound?.();
    if (Platform.OS === 'web' && typeof confetti === 'function') {
      confetti({ particleCount: 80, spread: 60, origin: { y: 0.6 }, colors: ['#C87D65', '#D4AF37', '#78726D'] });
    }
    const result = afterCompletion(effectiveTurnMode, turn);
    setTurn(result.nextTurn);
    setSessionDone(result.sessionDone);
    remainingRef.current = effectiveDuration;
    setTimeLeft(effectiveDuration);
  }, [effectiveDuration, effectiveTurnMode, turn, onPlaySuccessSound]);

  useEffect(() => {
    if (!isRunning) return;
    const id = setInterval(() => {
      remainingRef.current -= 1;
      setTimeLeft(remainingRef.current);
      if (remainingRef.current <= 0) {
        clearInterval(id);
        handleComplete();
      }
    }, 1000);
    return () => clearInterval(id);
  }, [isRunning, handleComplete]);

  const resetTo = (seconds: number) => {
    setIsRunning(false);
    setIsCompleted(false);
    setSessionDone(false);
    setTurn(1);
    remainingRef.current = seconds;
    setTimeLeft(seconds);
  };

  const toggleStart = () => {
    if (isCompleted) setIsCompleted(false);
    setIsRunning((prev) => !prev);
  };

  const pickDuration = (seconds: number) => {
    if (!isPlus) {
      onClose();
      onOpenStore();
      return;
    }
    setDuration(seconds);
    resetTo(seconds);
  };

  const toggleTurnMode = () => {
    if (!isPlus) {
      onClose();
      onOpenStore();
      return;
    }
    setTurnMode((prev) => !prev);
    resetTo(effectiveDuration);
  };

  const formatTime = (seconds: number) => {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
  };

  const minutes = Math.round(effectiveDuration / 60);
  const t = (key: string) => I18nService.t(locale, key);
  const timerTitle = effectiveDuration === FREE_DURATION
    ? I18nService.t(locale, 'timer_title', '5 分鐘計時器')
    : t('timer_title_n').replace('{min}', String(minutes));
  const timerPrompt = effectiveTurnMode
    ? t(turn === 1 ? 'timer_turn_1' : 'timer_turn_2')
    : I18nService.t(locale, 'timer_prompt', '給彼此五分鐘，一個人說，另一個人只聽。');
  const startText = I18nService.t(locale, 'timer_start', '開始');
  const pauseText = I18nService.t(locale, 'timer_pause', '暫停');
  const resetText = I18nService.t(locale, 'timer_reset', '重設');

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onClose}
    >
      <View style={styles.backdrop}>
        <View style={[styles.dialog, { backgroundColor: colors.card, borderColor: colors.line }]}>
          <TouchableOpacity accessibilityRole="button" accessibilityLabel={I18nService.t(locale, 'a11y_close')} onPress={onClose} style={styles.closeBtn} activeOpacity={0.7}>
            <X size={18} color={colors.muted} />
          </TouchableOpacity>

          <View style={[styles.clockIconContainer, { backgroundColor: colors.badgeBg }]}>
            <Clock size={24} color={colors.clay} />
          </View>

          <Text style={[styles.title, { color: colors.ink }]}>{timerTitle}</Text>
          <Text style={[styles.prompt, { color: colors.muted }]}>{timerPrompt}</Text>

          <View style={styles.chipRow}>
            {DURATION_OPTIONS.map((sec) => {
              const active = effectiveDuration === sec;
              return (
                <TouchableOpacity
                  key={sec}
                  accessibilityRole="button"
                  accessibilityState={{ selected: active }}
                  onPress={() => pickDuration(sec)}
                  style={[styles.chip, { borderColor: active ? colors.clay : colors.line, backgroundColor: active ? colors.clay : 'transparent' }]}
                >
                  <Text style={{ color: active ? '#FFFFFF' : colors.ink, fontSize: 12.5, fontWeight: '600' }}>
                    {`${isPlus || sec === FREE_DURATION ? '' : '🔒 '}${sec / 60}'`}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </View>

          <TouchableOpacity accessibilityRole="switch" accessibilityState={{ checked: effectiveTurnMode }} onPress={toggleTurnMode} style={styles.turnRow}>
            <Text style={{ color: effectiveTurnMode ? colors.clay : colors.muted, fontSize: 12.5, fontWeight: '600' }}>
              {`${isPlus ? '' : '🔒 '}${effectiveTurnMode ? '◉' : '○'}  ${t('timer_turn_mode')}`}
            </Text>
          </TouchableOpacity>

          <Text style={[styles.digits, { color: colors.clay }]}>{formatTime(timeLeft)}</Text>

          {isCompleted && (
            <View style={[styles.completedBadge, { backgroundColor: colors.badgeBg, borderColor: colors.clay }]}>
              <Text style={[styles.completedText, { color: colors.clay }]}>
                ✨ {sessionDone ? t('timer_all_done') : I18nService.t(locale, 'timer_end', '時間到')}
              </Text>
            </View>
          )}

          <View style={styles.actionsRow}>
            <TouchableOpacity
              onPress={toggleStart}
              style={[styles.primaryBtn, { backgroundColor: colors.clay }]}
              activeOpacity={0.8}
            >
              {isRunning ? (
                <Pause size={15} color="#FFFFFF" style={{ marginRight: 6 }} />
              ) : (
                <Play size={15} color="#FFFFFF" style={{ marginRight: 6 }} />
              )}
              <Text style={styles.primaryBtnText}>{isRunning ? pauseText : startText}</Text>
            </TouchableOpacity>

            <TouchableOpacity
              onPress={() => resetTo(effectiveDuration)}
              style={[styles.secondaryBtn, { borderColor: colors.line, backgroundColor: colors.card }]}
              activeOpacity={0.8}
            >
              <RotateCcw size={14} color={colors.muted} style={{ marginRight: 6 }} />
              <Text style={[styles.secondaryBtnText, { color: colors.ink }]}>{resetText}</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.74)',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 20,
    ...Platform.select({
      web: {
        backdropFilter: 'blur(20px)',
        WebkitBackdropFilter: 'blur(20px)',
      } as any,
    }),
  },
  dialog: {
    width: '100%',
    maxWidth: 360,
    borderRadius: 28,
    borderWidth: 1,
    padding: 24,
    alignItems: 'center',
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 16 },
        shadowOpacity: 0.35,
        shadowRadius: 30,
      },
      android: { elevation: 12 },
      web: {
        boxShadow: '0 20px 60px rgba(0, 0, 0, 0.6), 0 0 1px rgba(255, 255, 255, 0.1)',
      },
    }),
  },
  closeBtn: {
    position: 'absolute',
    top: 16,
    right: 16,
    padding: 6,
  },
  clockIconContainer: {
    width: 48,
    height: 48,
    borderRadius: 24,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 12,
  },
  title: {
    fontSize: 22,
    fontWeight: '500',
    fontFamily: Platform.OS === 'ios' ? 'Georgia' : 'serif',
    marginBottom: 4,
  },
  prompt: {
    fontSize: 12,
    textAlign: 'center',
    lineHeight: 18,
    marginBottom: 20,
    paddingHorizontal: 12,
  },
  digits: {
    fontSize: 54,
    fontWeight: '600',
    fontFamily: Platform.OS === 'ios' ? 'Georgia' : 'serif',
    letterSpacing: 2,
    marginBottom: 24,
  },
  completedBadge: {
    paddingHorizontal: 14,
    paddingVertical: 6,
    borderRadius: 14,
    borderWidth: 1,
    marginBottom: 16,
  },
  completedText: {
    fontSize: 12,
    fontWeight: '600',
    letterSpacing: 0.5,
  },
  chipRow: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 10,
  },
  chip: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 999,
    borderWidth: 1,
  },
  turnRow: {
    paddingVertical: 6,
    marginBottom: 6,
  },
  actionsRow: {
    flexDirection: 'row',
    gap: 12,
  },
  primaryBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 22,
    paddingVertical: 10,
    borderRadius: 22,
  },
  primaryBtnText: {
    color: '#FFFFFF',
    fontSize: 13,
    fontWeight: '600',
  },
  secondaryBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 18,
    paddingVertical: 10,
    borderRadius: 22,
    borderWidth: 1,
  },
  secondaryBtnText: {
    fontSize: 13,
    fontWeight: '500',
  },
});
