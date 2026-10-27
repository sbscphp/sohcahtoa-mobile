import { ResolvedTheme } from '@/constants/theme';
import { resolveThemeMode } from '@/context/ThemeContext';
import { useThemeStore } from '@/stores/useThemeStore';
import { Appearance, useColorScheme as useRNColorScheme } from 'react-native';

export function useColorScheme(): ResolvedTheme {
  const themeMode = useThemeStore((state) => state.themeMode);
  const rnColorScheme = useRNColorScheme();
  const systemScheme = rnColorScheme ?? Appearance.getColorScheme() ?? 'light';
  return resolveThemeMode(themeMode, systemScheme);
}
