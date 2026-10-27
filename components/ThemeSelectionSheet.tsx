import AnimatedBottomSheet from '@/components/ui/AnimatedBottomSheet';
import { ThemeMode } from '@/constants/theme';
import { useAppTheme } from '@/context/ThemeContext';
import * as Haptics from 'expo-haptics';
import { CloseCircle, TickCircle } from 'iconsax-react-nativejs';
import { Moon, Smartphone, Sun } from 'lucide-react-native';
import React from 'react';
import { Platform, Pressable, Text, TouchableOpacity, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { moderateScale, ScaledSheet } from 'react-native-size-matters';

export interface ThemeOptionItem {
  mode: ThemeMode;
  label: string;
  description: string;
}

export const THEME_OPTIONS: ThemeOptionItem[] = [
  {
    mode: 'light',
    label: 'Light',
    description: 'Clean, bright appearance for daytime and well-lit environments',
  },
  {
    mode: 'dark',
    label: 'Dark',
    description: 'Comfortable dark palette that reduces glare in low light',
  },
  {
    mode: 'system',
    label: 'System Default',
    description: 'Automatically matches your device appearance settings',
  },
];

interface ThemeSelectionSheetProps {
  visible: boolean;
  onClose: () => void;
}

export const ThemeSelectionSheet: React.FC<ThemeSelectionSheetProps> = ({
  visible,
  onClose,
}) => {
  const insets = useSafeAreaInsets();
  const { themeMode, setThemeMode, colors, isDark } = useAppTheme();

  const handleSelectMode = (mode: ThemeMode) => {
    if (Platform.OS !== 'web') {
      Haptics.selectionAsync().catch(() => {});
    }
    setThemeMode(mode);
  };

  const renderModeIcon = (mode: ThemeMode, isSelected: boolean) => {
    const iconColor = isSelected ? colors.primary : colors.iconMuted;
    const size = moderateScale(20);
    if (mode === 'light') {
      return <Sun size={size} color={iconColor} />;
    }
    if (mode === 'dark') {
      return <Moon size={size} color={iconColor} />;
    }
    return <Smartphone size={size} color={iconColor} />;
  };

  return (
    <AnimatedBottomSheet
      visible={visible}
      onClose={onClose}
      sheetStyle={[
        styles.sheetContent,
        {
          backgroundColor: colors.surface,
          paddingBottom: insets.bottom + moderateScale(20),
        },
      ]}
    >
      <View style={styles.headerRow}>
        <View
          style={[
            styles.headerIconBadge,
            {
              backgroundColor: isDark
                ? 'rgba(255, 255, 255, 0.05)'
                : colors.primarySoft,
              borderColor: isDark ? 'rgba(255, 255, 255, 0.08)' : 'transparent',
              borderWidth: isDark ? 1 : 0,
            },
          ]}
        >
          {isDark ? (
            <Moon size={moderateScale(22)} color={colors.primaryLight} />
          ) : (
            <Sun size={moderateScale(22)} color={colors.primary} />
          )}
        </View>
        <TouchableOpacity
          onPress={onClose}
          accessibilityRole="button"
          accessibilityLabel="Close theme settings"
        >
          <CloseCircle size={moderateScale(24)} color={colors.iconMuted} variant="Bold" />
        </TouchableOpacity>
      </View>

      <Text style={[styles.title, { color: colors.text }]}>Appearance</Text>
      <Text style={[styles.subtitle, { color: colors.textMuted }]}>
        Choose how SohCahToa looks on your device
      </Text>

      <View style={styles.optionsList}>
        {THEME_OPTIONS.map((option) => {
          const isSelected = themeMode === option.mode;
          return (
            <Pressable
              key={option.mode}
              testID={`theme-option-${option.mode}`}
              onPress={() => handleSelectMode(option.mode)}
              accessibilityRole="radio"
              accessibilityState={{ selected: isSelected, checked: isSelected }}
              accessibilityLabel={`${option.label} theme`}
              style={({ pressed }) => [
                styles.optionCard,
                {
                  backgroundColor: isSelected
                    ? isDark
                      ? 'rgba(255, 104, 19, 0.12)'
                      : colors.primarySoft
                    : colors.cardAlt,
                  borderColor: isSelected
                    ? isDark
                      ? 'rgba(255, 104, 19, 0.35)'
                      : colors.primary
                    : colors.border,
                },
                pressed && { opacity: 0.85 },
              ]}
            >
              <View
                style={[
                  styles.optionIconContainer,
                  {
                    backgroundColor: isSelected
                      ? isDark
                        ? 'rgba(255, 104, 19, 0.20)'
                        : '#FFFFFF'
                      : isDark
                        ? 'rgba(255, 255, 255, 0.05)'
                        : colors.surface,
                    borderColor: isDark ? 'rgba(255, 255, 255, 0.06)' : 'transparent',
                    borderWidth: isDark ? 1 : 0,
                  },
                ]}
              >
                {renderModeIcon(option.mode, isSelected)}
              </View>

              <View style={styles.optionTextContainer}>
                <Text
                  style={[
                    styles.optionTitle,
                    { color: isSelected ? (isDark ? colors.primaryLight : colors.primary) : colors.text },
                  ]}
                >
                  {option.label}
                </Text>
                <Text style={[styles.optionDescription, { color: colors.textMuted }]}>
                  {option.description}
                </Text>
              </View>

              <View style={styles.checkContainer}>
                {isSelected ? (
                  <TickCircle size={moderateScale(22)} color={colors.primary} variant="Bold" />
                ) : (
                  <View
                    style={[
                      styles.uncheckedCircle,
                      { borderColor: colors.borderStrong },
                    ]}
                  />
                )}
              </View>
            </Pressable>
          );
        })}
      </View>
    </AnimatedBottomSheet>
  );
};

const styles = ScaledSheet.create({
  sheetContent: {
    borderRadius: '24@ms',
    paddingHorizontal: '20@s',
    paddingTop: '14@vs',
    marginBottom: '20@vs',
    marginHorizontal: '12@s',
  },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '14@vs',
  },
  headerIconBadge: {
    width: '44@ms',
    height: '44@ms',
    borderRadius: '22@ms',
    justifyContent: 'center',
    alignItems: 'center',
  },
  title: {
    fontSize: '18@ms',
    fontWeight: '700',
    marginBottom: '4@vs',
  },
  subtitle: {
    fontSize: '13@ms',
    marginBottom: '18@vs',
  },
  optionsList: {
    gap: '10@vs',
  },
  optionCard: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: '14@ms',
    borderRadius: '16@ms',
    borderWidth: 1.5,
    gap: '12@s',
  },
  optionIconContainer: {
    width: '40@ms',
    height: '40@ms',
    borderRadius: '20@ms',
    justifyContent: 'center',
    alignItems: 'center',
  },
  optionTextContainer: {
    flex: 1,
    gap: '2@vs',
  },
  optionTitle: {
    fontSize: '14@ms',
    fontWeight: '600',
  },
  optionDescription: {
    fontSize: '12@ms',
    lineHeight: '16@ms',
  },
  checkContainer: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  uncheckedCircle: {
    width: '20@ms',
    height: '20@ms',
    borderRadius: '10@ms',
    borderWidth: 1.5,
  },
});

export default ThemeSelectionSheet;
