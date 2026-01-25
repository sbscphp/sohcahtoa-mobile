/**
 * Below are the colors that are used in the app. The colors are defined in the light and dark mode.
 * There are many other ways to style your app. For example, [Nativewind](https://www.nativewind.dev/), [Tamagui](https://tamagui.dev/), [unistyles](https://reactnativeunistyles.vercel.app), etc.
 */

import { Platform } from 'react-native';

const palette = {
  primary: '#FF6B2C',
  primaryLight: '#FF8A5C',
  primaryDark: '#E55A1F',
  secondary: '#FF6B2C',
  secondaryLight: '#FF8A5C',
  secondaryDark: '#E55A1F',
  background: '#FAFAFA',
  backgroundDark: '#0F172A',
  surface: '#FFFFFF',
  surfaceDark: '#1E293B', // Slate-800 for dark surface
};

export const Colors = {
  light: {
    text: '#111827', // Gray-900
    background: palette.background,
    surface: palette.surface,
    primary: palette.primary,
    secondary: palette.secondary,
    tint: palette.primary,
    icon: '#6B7280', // Gray-500
    tabIconDefault: '#9CA3AF', // Gray-400
    tabIconSelected: palette.primary,
    border: '#E5E7EB', // Gray-200
  },
  dark: {
    text: '#F9FAFB', // Gray-50
    background: palette.backgroundDark,
    surface: palette.surfaceDark,
    primary: palette.primary,
    secondary: palette.secondary,
    tint: palette.primaryLight,
    icon: '#9CA3AF',
    tabIconDefault: '#6B7280',
    tabIconSelected: palette.primaryLight,
    border: '#334155', // Slate-700
  },
};

export const Fonts = Platform.select({
  ios: {
    /** iOS `UIFontDescriptorSystemDesignDefault` */
    sans: 'system-ui',
    /** iOS `UIFontDescriptorSystemDesignSerif` */
    serif: 'ui-serif',
    /** iOS `UIFontDescriptorSystemDesignRounded` */
    rounded: 'ui-rounded',
    /** iOS `UIFontDescriptorSystemDesignMonospaced` */
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
