/**
 * Hook for cross-platform haptic feedback.
 * Works natively on iOS and Android, degrades safely on Web.
 */
import { useCallback } from 'react';
import { Platform } from 'react-native';
import * as Haptics from 'expo-haptics';

export function useHaptics() {
  const triggerImpact = useCallback((style = Haptics.ImpactFeedbackStyle.Medium) => {
    if (Platform.OS === 'web') return;
    try {
      Haptics.impactAsync(style);
    } catch {
      // Haptics unsupported on device
    }
  }, []);

  const triggerSelection = useCallback(() => {
    if (Platform.OS === 'web') return;
    try {
      Haptics.selectionAsync();
    } catch {
      // Haptics unsupported
    }
  }, []);

  const triggerNotification = useCallback(
    (type = Haptics.NotificationFeedbackType.Success) => {
      if (Platform.OS === 'web') return;
      try {
        Haptics.notificationAsync(type);
      } catch {
        // Haptics unsupported
      }
    },
    []
  );

  return {
    triggerImpact,
    triggerSelection,
    triggerNotification,
  };
}
