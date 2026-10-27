import { Colors, ThemeColors } from '@/constants/theme';
import { useAppTheme } from '@/context/ThemeContext';

export function useThemeColor(
  props: { light?: string; dark?: string },
  colorName: keyof ThemeColors
) {
  const { resolvedTheme } = useAppTheme();
  const colorFromProps = props[resolvedTheme];

  if (colorFromProps) {
    return colorFromProps;
  }
  return Colors[resolvedTheme][colorName];
}
