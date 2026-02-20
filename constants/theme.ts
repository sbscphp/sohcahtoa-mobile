import { Platform } from 'react-native';

const palette = {
  primary: 'rgba(255, 104, 19, 1)',
  primaryLight: '#FF8A5C',
  primaryDark: '#E55A1F',
  secondary: '#FF6B2C',
  secondaryLight: '#FF8A5C',
  secondaryDark: '#E55A1F',
  background: '#FAFAFA',
  backgroundDark: '#0F172A',
  surface: '#FFFFFF',
  surfaceDark: '#1E293B',
};

export const Colors = {
  light: {
    text: '#111827',
    background: palette.background,
    surface: palette.surface,
    primary: palette.primary,
    secondary: palette.secondary,
    tint: palette.primary,
    icon: '#6B7280',
    tabIconDefault: '#9CA3AF',
    tabIconSelected: palette.primary,
    border: '#E5E7EB',
  },
  dark: {
    text: '#F9FAFB',
    background: palette.backgroundDark,
    surface: palette.surfaceDark,
    primary: palette.primary,
    secondary: palette.secondary,
    tint: palette.primaryLight,
    icon: '#9CA3AF',
    tabIconDefault: '#6B7280',
    tabIconSelected: palette.primaryLight,
    border: '#334155',
  },
};

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
