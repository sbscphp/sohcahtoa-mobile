import { Platform } from 'react-native';

export type ThemeMode = 'light' | 'dark' | 'system';
export type ResolvedTheme = 'light' | 'dark';

const palette = {
  primary: '#FF6B2C',
  primaryHex: '#FF6B2C',
  primaryLight: '#FF8A5C',
  primaryDark: '#E55A1F',
  secondary: '#FF6B2C',
  secondaryLight: '#FF8A5C',
  secondaryDark: '#E55A1F',
  backgroundLight: '#FFFFFF',
  backgroundSecondaryLight: '#F8FAFC',
  backgroundDark: '#000000',
  backgroundSecondaryDark: '#0A0A0A',
  surfaceLight: '#FFFFFF',
  surfaceDark: '#121212',
};

export interface ThemeColors {
  text: string;
  textSecondary: string;
  textMuted: string;
  textInverse: string;
  placeholder: string;
  background: string;
  backgroundSecondary: string;
  surface: string;
  surfaceElevated: string;
  surfaceMuted: string;
  surfaceHighlight: string;
  label: string;
  handleBar: string;
  white: string;
  card: string;
  cardAlt: string;
  primary: string;
  primaryLight: string;
  primaryDark: string;
  primarySoft: string;
  primaryBorder: string;
  secondary: string;
  tint: string;
  icon: string;
  iconMuted: string;
  tabIconDefault: string;
  tabIconSelected: string;
  tabBarBackground: string;
  tabBarBorder: string;
  border: string;
  borderStrong: string;
  divider: string;
  inputBackground: string;
  inputDisabledBackground: string;
  inputBorder: string;
  inputDisabledBorder: string;
  buttonDisabledBackground: string;
  buttonSecondaryBackground: string;
  buttonSecondaryText: string;
  success: string;
  successSoft: string;
  warning: string;
  warningSoft: string;
  error: string;
  errorSoft: string;
  info: string;
  infoSoft: string;
  overlay: string;
  glassTint: string;
  skeleton: string;
  shadow: string;
}

export const Colors: Record<ResolvedTheme, ThemeColors> = {
  light: {
    text: '#0F172A',
    textSecondary: '#475569',
    textMuted: '#64748B',
    textInverse: '#FFFFFF',
    placeholder: '#94A3B8',
    background: palette.backgroundLight,
    backgroundSecondary: palette.backgroundSecondaryLight,
    surface: palette.surfaceLight,
    surfaceElevated: '#FFFFFF',
    surfaceMuted: '#F1F5F9',
    surfaceHighlight: '#F1F5F9',
    label: '#0F172A',
    handleBar: '#CBD5E1',
    white: '#FFFFFF',
    card: '#FFFFFF',
    cardAlt: '#F8FAFC',
    primary: palette.primary,
    primaryLight: palette.primaryLight,
    primaryDark: palette.primaryDark,
    primarySoft: '#FFF7ED',
    primaryBorder: '#FFEDD5',
    secondary: palette.secondary,
    tint: palette.primary,
    icon: '#1E293B',
    iconMuted: '#64748B',
    tabIconDefault: '#94A3B8',
    tabIconSelected: palette.primary,
    tabBarBackground: '#FFFFFF',
    tabBarBorder: '#E2E8F0',
    border: '#E2E8F0',
    borderStrong: 'rgba(143, 139, 139, 1)',
    divider: '#F1F5F9',
    inputBackground: 'transparent',
    inputDisabledBackground: '#F1F5F9',
    inputBorder: 'rgba(143, 139, 139, 1)',
    inputDisabledBorder: 'rgba(204, 202, 202, 1)',
    buttonDisabledBackground: '#FFCCB4',
    buttonSecondaryBackground: '#F1F5F9',
    buttonSecondaryText: '#0F172A',
    success: '#16A34A',
    successSoft: '#DCFCE7',
    warning: '#D97706',
    warningSoft: '#FEF3C7',
    error: '#EF4444',
    errorSoft: '#FEE2E2',
    info: '#2563EB',
    infoSoft: '#DBEAFE',
    overlay: 'rgba(15, 23, 42, 0.45)',
    glassTint: 'rgba(255, 255, 255, 0.85)',
    skeleton: '#E2E8F0',
    shadow: 'rgba(15, 23, 42, 0.08)',
  },
  dark: {
    text: '#FFFFFF',
    textSecondary: '#A1A1AA',
    textMuted: '#71717A',
    textInverse: '#09090B',
    placeholder: '#52525B',
    background: palette.backgroundDark,
    backgroundSecondary: palette.backgroundSecondaryDark,
    surface: palette.surfaceDark,
    surfaceElevated: '#1C1C1E',
    surfaceMuted: '#161616',
    surfaceHighlight: 'rgba(255, 255, 255, 0.08)',
    label: '#D4D4D8',
    handleBar: 'rgba(255, 255, 255, 0.24)',
    white: '#FFFFFF',
    card: '#121212',
    cardAlt: '#181818',
    primary: palette.primary,
    primaryLight: palette.primaryLight,
    primaryDark: palette.primaryDark,
    primarySoft: 'rgba(255, 107, 44, 0.16)',
    primaryBorder: 'rgba(255, 107, 44, 0.35)',
    secondary: palette.secondary,
    tint: palette.primary,
    icon: '#F4F4F5',
    iconMuted: '#71717A',
    tabIconDefault: '#71717A',
    tabIconSelected: palette.primary,
    tabBarBackground: '#0A0A0A',
    tabBarBorder: 'rgba(255, 255, 255, 0.08)',
    border: 'rgba(255, 255, 255, 0.08)',
    borderStrong: 'rgba(255, 255, 255, 0.16)',
    divider: 'rgba(255, 255, 255, 0.06)',
    inputBackground: '#161616',
    inputDisabledBackground: '#0D0D0D',
    inputBorder: 'rgba(255, 255, 255, 0.12)',
    inputDisabledBorder: 'rgba(255, 255, 255, 0.05)',
    buttonDisabledBackground: 'rgba(255, 107, 44, 0.25)',
    buttonSecondaryBackground: 'rgba(255, 255, 255, 0.08)',
    buttonSecondaryText: '#F4F4F5',
    success: '#4ADE80',
    successSoft: 'rgba(34, 197, 94, 0.14)',
    warning: '#FBBF24',
    warningSoft: 'rgba(245, 158, 11, 0.14)',
    error: '#F87171',
    errorSoft: 'rgba(239, 68, 68, 0.14)',
    info: '#60A5FA',
    infoSoft: 'rgba(59, 130, 246, 0.14)',
    overlay: 'rgba(0, 0, 0, 0.72)',
    glassTint: 'rgba(18, 18, 18, 0.75)',
    skeleton: 'rgba(255, 255, 255, 0.06)',
    shadow: 'rgba(0, 0, 0, 0.45)',
  },
};

export function getThemeColors(theme: ResolvedTheme): ThemeColors {
  return Colors[theme] ?? Colors.light;
}

export const Fonts = Platform.select({
  ios: {
    sans: 'system-ui',
    serif: 'ui-serif',
    rounded: 'ui-rounded',
    mono: 'ui-monospace',
  },
  default: {
    sans: 'normal',
    serif: 'serif',
    rounded: 'normal',
    mono: 'monospace',
  },
  web: {
    sans: "system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif",
    serif: "Georgia, 'Times New Roman', serif",
    rounded: "'SF Pro Rounded', 'Hiragino Maru Gothic ProN', Meiryo, 'MS PGothic', sans-serif",
    mono: "SFMono-Regular, Menlo, Monaco, Consolas, 'Liberation Mono', 'Courier New', monospace",
  },
});
