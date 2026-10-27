import {
  Colors,
  getThemeColors,
  ResolvedTheme,
  ThemeColors,
  ThemeMode,
} from '@/constants/theme';
import { useThemeStore } from '@/stores/useThemeStore';
import { DarkTheme, DefaultTheme, Theme as NavigationTheme } from '@react-navigation/native';
import * as SystemUI from 'expo-system-ui';
import React, { createContext, useContext, useEffect, useMemo, useState } from 'react';
import { Appearance, ColorSchemeName, useColorScheme as useRNColorScheme } from 'react-native';

export interface AppThemeContextValue {
  themeMode: ThemeMode;
  resolvedTheme: ResolvedTheme;
  isDark: boolean;
  colors: ThemeColors;
  setThemeMode: (mode: ThemeMode) => void;
  navigationTheme: NavigationTheme;
}

const ThemeContext = createContext<AppThemeContextValue | null>(null);

export function buildNavigationTheme(resolvedTheme: ResolvedTheme, colors: ThemeColors): NavigationTheme {
  const base = resolvedTheme === 'dark' ? DarkTheme : DefaultTheme;
  return {
    ...base,
    dark: resolvedTheme === 'dark',
    colors: {
      ...base.colors,
      primary: colors.primary,
      background: colors.background,
      card: colors.surface,
      text: colors.text,
      border: colors.border,
      notification: colors.secondary,
    },
  };
}

export function resolveThemeMode(
  themeMode: ThemeMode,
  systemScheme: ColorSchemeName | undefined | null
): ResolvedTheme {
  if (themeMode === 'light') return 'light';
  if (themeMode === 'dark') return 'dark';
  return systemScheme === 'dark' ? 'dark' : 'light';
}

export const AppThemeProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const themeMode = useThemeStore((state) => state.themeMode);
  const setThemeMode = useThemeStore((state) => state.setThemeMode);
  const rnColorScheme = useRNColorScheme();
  const [systemScheme, setSystemScheme] = useState<ColorSchemeName>(() => {
    return rnColorScheme ?? Appearance.getColorScheme() ?? 'light';
  });

  useEffect(() => {
    if (rnColorScheme !== undefined && rnColorScheme !== null) {
      setSystemScheme(rnColorScheme);
    }
  }, [rnColorScheme]);

  useEffect(() => {
    const subscription = Appearance.addChangeListener(({ colorScheme }) => {
      setSystemScheme(colorScheme ?? 'light');
    });
    return () => {
      subscription.remove();
    };
  }, []);

  const resolvedTheme = useMemo<ResolvedTheme>(
    () => resolveThemeMode(themeMode, systemScheme),
    [themeMode, systemScheme]
  );

  const isDark = resolvedTheme === 'dark';
  const colors = useMemo<ThemeColors>(() => getThemeColors(resolvedTheme), [resolvedTheme]);
  const navigationTheme = useMemo<NavigationTheme>(
    () => buildNavigationTheme(resolvedTheme, colors),
    [resolvedTheme, colors]
  );

  useEffect(() => {
    try {
      SystemUI.setBackgroundColorAsync(colors.background).catch(() => {});
    } catch {
      // Ignore in test or unsupported environments
    }
  }, [colors.background]);

  const value = useMemo<AppThemeContextValue>(
    () => ({
      themeMode,
      resolvedTheme,
      isDark,
      colors,
      setThemeMode,
      navigationTheme,
    }),
    [themeMode, resolvedTheme, isDark, colors, setThemeMode, navigationTheme]
  );

  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
};

export function useAppTheme(): AppThemeContextValue {
  const context = useContext(ThemeContext);
  const storeThemeMode = useThemeStore((state) => state.themeMode);
  const storeSetThemeMode = useThemeStore((state) => state.setThemeMode);
  const rnColorScheme = useRNColorScheme();

  return useMemo(() => {
    if (context) {
      return context;
    }
    const systemScheme = rnColorScheme ?? Appearance.getColorScheme() ?? 'light';
    const resolvedTheme = resolveThemeMode(storeThemeMode, systemScheme);
    const colors = Colors[resolvedTheme];
    return {
      themeMode: storeThemeMode,
      resolvedTheme,
      isDark: resolvedTheme === 'dark',
      colors,
      setThemeMode: storeSetThemeMode,
      navigationTheme: buildNavigationTheme(resolvedTheme, colors),
    };
  }, [context, storeThemeMode, storeSetThemeMode, rnColorScheme]);
}
