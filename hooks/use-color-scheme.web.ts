import { ResolvedTheme } from '@/constants/theme';
import { resolveThemeMode } from '@/context/ThemeContext';
import { useThemeStore } from '@/stores/useThemeStore';
import { useEffect, useState } from 'react';
import { useColorScheme as useRNColorScheme } from 'react-native';

export function useColorScheme(): ResolvedTheme {
  const [hasHydrated, setHasHydrated] = useState(false);
  const themeMode = useThemeStore((state) => state.themeMode);
  const rnColorScheme = useRNColorScheme();

  useEffect(() => {
    setHasHydrated(true);
  }, []);

  if (!hasHydrated) {
    return themeMode === 'dark' ? 'dark' : 'light';
  }

  return resolveThemeMode(themeMode, rnColorScheme);
}
