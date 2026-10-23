/**
 * Hook for managing dual color themes (light & dark).
 * Synchronizes with device system appearance and local storage.
 */
import { useState, useEffect, useCallback } from 'react';
import { useColorScheme } from 'react-native';
import { ThemeMode, ThemeColors } from '../types';
import { LIGHT_THEME, DARK_THEME } from '../constants/colors';
import { StorageService } from '../services/storage';

export function useTheme() {
  const systemScheme = useColorScheme();
  const [themeMode, setThemeMode] = useState<ThemeMode>(
    systemScheme === 'dark' ? 'dark' : 'light'
  );

  useEffect(() => {
    let mounted = true;
    StorageService.getTheme().then((savedTheme) => {
      if (!mounted) return;
      if (savedTheme) {
        setThemeMode(savedTheme);
      } else if (systemScheme) {
        setThemeMode(systemScheme === 'dark' ? 'dark' : 'light');
      }
    });
    return () => {
      mounted = false;
    };
  }, [systemScheme]);

  const toggleTheme = useCallback(() => {
    setThemeMode((prev) => {
      const next: ThemeMode = prev === 'light' ? 'dark' : 'light';
      StorageService.setTheme(next);
      return next;
    });
  }, []);

  const colors: ThemeColors = themeMode === 'dark' ? DARK_THEME : LIGHT_THEME;

  return {
    themeMode,
    isDark: themeMode === 'dark',
    colors,
    toggleTheme,
  };
}
