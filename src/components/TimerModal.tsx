/**
 * TimerModal Component: 5-minute conversation timer with audio chimes and confetti.
 */
import React, { useState, useEffect, useRef } from 'react';
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

interface TimerModalProps {
  visible: boolean;
  locale: LocaleKey;
  colors: ThemeColors;
  onClose: () => void;
  onPlaySuccessSound?: () => void;
}

export const TimerModal: React.FC<TimerModalProps> = ({
  visible,
  locale,
  colors,
  onClose,
  onPlaySuccessSound,
}) => {
  const [timeLeft, setTimeLeft] = useState(300);
  const [isRunning, setIsRunning] = useState(false);
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    if (isRunning) {
      timerRef.current = setInterval(() => {
        setTimeLeft((prev) => {
          if (prev <= 1) {
            clearInterval(timerRef.current as NodeJS.Timeout);
            setIsRunning(false);
            onPlaySuccessSound?.();
            if (Platform.OS === 'web' && typeof confetti === 'function') {
              confetti({
                particleCount: 80,
                spread: 60,
                origin: { y: 0.6 },
                colors: ['#C87D65', '#D4AF37', '#78726D'],
              });
            }
            return 300;
          }
          return prev - 1;
        });
      }, 1000);
    } else if (timerRef.current) {
      clearInterval(timerRef.current);
    }
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [isRunning, onPlaySuccessSound]);

  const toggleStart = () => {
    setIsRunning((prev) => !prev);
  };

  const resetTimer = () => {
    setIsRunning(false);
    setTimeLeft(300);
  };

  const formatTime = (seconds: number) => {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
  };

  const timerTitle = I18nService.t(locale, 'timer_title', '5 分鐘計時器');
  const timerPrompt = I18nService.t(locale, 'timer_prompt', '給彼此五分鐘，一個人說，另一個人只聽。');
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
          <TouchableOpacity onPress={onClose} style={styles.closeBtn} activeOpacity={0.7}>
            <X size={18} color={colors.muted} />
          </TouchableOpacity>

          <View style={[styles.clockIconContainer, { backgroundColor: colors.badgeBg }]}>
            <Clock size={24} color={colors.clay} />
          </View>

          <Text style={[styles.title, { color: colors.ink }]}>{timerTitle}</Text>
          <Text style={[styles.prompt, { color: colors.muted }]}>{timerPrompt}</Text>

          <Text style={[styles.digits, { color: colors.clay }]}>{formatTime(timeLeft)}</Text>

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
              onPress={resetTimer}
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
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 20,
  },
  dialog: {
    width: '100%',
    maxWidth: 360,
    borderRadius: 28,
    borderWidth: 1,
    padding: 24,
    alignItems: 'center',
    shadowOffset: { width: 0, height: 16 },
    shadowOpacity: 0.15,
    shadowRadius: 30,
    elevation: 10,
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
