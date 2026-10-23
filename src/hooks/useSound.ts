/**
 * Cross-platform audio synthesizer and mute controller.
 * Utilizes Web Audio API on Web and safe tones without requiring external audio assets.
 */
import { useState, useEffect, useCallback, useRef } from 'react';
import { Platform } from 'react-native';
import { StorageService } from '../services/storage';

export function useSound() {
  const [muted, setMutedState] = useState(false);
  const audioCtxRef = useRef<AudioContext | null>(null);

  useEffect(() => {
    let mounted = true;
    StorageService.getMuted(false).then((savedMuted) => {
      if (mounted) {
        setMutedState(savedMuted);
      }
    });
    return () => {
      mounted = false;
    };
  }, []);

  const toggleMute = useCallback(() => {
    setMutedState((prev) => {
      const next = !prev;
      StorageService.setMuted(next);
      return next;
    });
  }, []);

  const getAudioContext = useCallback(() => {
    if (Platform.OS !== 'web') return null;
    if (typeof window === 'undefined') return null;

    if (!audioCtxRef.current) {
      const AudioCtxClass =
        window.AudioContext ||
        (window as unknown as { webkitAudioContext: typeof AudioContext })
          .webkitAudioContext;
      if (AudioCtxClass) {
        audioCtxRef.current = new AudioCtxClass();
      }
    }
    if (audioCtxRef.current && audioCtxRef.current.state === 'suspended') {
      audioCtxRef.current.resume();
    }
    return audioCtxRef.current;
  }, []);

  const playTone = useCallback(
    (freq: number, dur: number, type: OscillatorType = 'sine', gainVal = 0.08) => {
      if (muted || Platform.OS !== 'web') return;
      try {
        const ctx = getAudioContext();
        if (!ctx) return;
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        const t = ctx.currentTime;
        osc.type = type;
        osc.frequency.setValueAtTime(freq, t);
        gain.gain.setValueAtTime(gainVal, t);
        gain.gain.exponentialRampToValueAtTime(0.0001, t + dur);
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.start(t);
        osc.stop(t + dur);
      } catch {
        // Autoplay restriction or hardware error
      }
    },
    [muted, getAudioContext]
  );

  const playFlip = useCallback(() => {
    playTone(680, 0.08, 'sine', 0.06);
  }, [playTone]);

  const playClick = useCallback(() => {
    playTone(540, 0.05, 'sine', 0.04);
  }, [playTone]);

  const playSuccess = useCallback(() => {
    if (muted) return;
    [523, 659, 784, 1047].forEach((f, i) => {
      setTimeout(() => playTone(f, 0.25, 'triangle', 0.07), i * 140);
    });
  }, [muted, playTone]);

  return {
    muted,
    toggleMute,
    playFlip,
    playClick,
    playSuccess,
  };
}
