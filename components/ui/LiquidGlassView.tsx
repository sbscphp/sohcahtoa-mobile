import {
    GlassColorScheme,
    GlassContainer,
    GlassView,
    isGlassEffectAPIAvailable,
    isLiquidGlassAvailable,
} from 'expo-glass-effect';
import { useAppTheme } from '@/context/ThemeContext';
import React, { useEffect, useMemo, useState } from 'react';
import {
    AccessibilityInfo,
    Platform,
    StyleProp,
    StyleSheet,
    View,
    ViewProps,
    ViewStyle,
} from 'react-native';

export type LiquidGlassVariant = 'regular' | 'clear';

export interface LiquidGlassViewProps extends Omit<ViewProps, 'style'> {
    /**
     * Liquid Glass visual weight on iOS 26+.
     * - 'regular': Adaptive system material for bars, sheets, and primary floating controls.
     * - 'clear': Lighter, more transparent lens for secondary chips and toolbar buttons.
     * @default 'regular'
     */
    variant?: LiquidGlassVariant;
    /**
     * Optional subtle tint applied to the native UIGlassEffect on iOS 26+.
     * Defaults to a clean translucent white on 'regular' variant so glass never looks dark/muddy.
     */
    tintColor?: string;
    /**
     * Enables native iOS 26 fluid touch-scaling and specular highlight tracking on press.
     * @default false
     */
    interactive?: boolean;
    /**
     * Explicit corner radius applied to both native GlassView and fallback View.
     */
    borderRadius?: number;
    /**
     * Appearance override for the glass material ('auto' | 'light' | 'dark').
     * Defaults to 'light' to match the app's light surface palette even when iOS is in Dark Mode.
     * @default 'light'
     */
    colorScheme?: GlassColorScheme;
    /**
     * Base style. On iOS 15–25, Android, Web, and when Reduce Transparency is enabled,
     * this style is rendered as-is (preserving the exact present background, border, and shadow).
     * On iOS 26+ when Liquid Glass is active, opaque background/border/shadow properties are
     * automatically stripped so the native UIGlassEffect refraction and specular rim shine through.
     */
    style?: StyleProp<ViewStyle>;
    /**
     * Optional style overrides applied only when native Liquid Glass is active.
     */
    glassStyle?: StyleProp<ViewStyle>;
    children?: React.ReactNode;
}

export interface LiquidGlassContainerProps extends ViewProps {
    /**
     * Distance (in points) at which nearby glass views begin to blend and morph together.
     * Defaults to 12 so UIGlassContainerEffect is always initialized in native Swift.
     * @default 12
     */
    spacing?: number;
    style?: StyleProp<ViewStyle>;
    children?: React.ReactNode;
}

/**
 * Safely checks whether native iOS 26+ Liquid Glass runtime symbols and components are available.
 */
export function isNativeLiquidGlassSupported(): boolean {
    if (Platform.OS !== 'ios') {
        return false;
    }
    try {
        return Boolean(isGlassEffectAPIAvailable() && isLiquidGlassAvailable());
    } catch {
        return false;
    }
}

/**
 * Hook that returns true only when iOS 26+ Liquid Glass is supported AND
 * the user has not enabled "Reduce Transparency" in iOS Accessibility settings.
 */
export function useLiquidGlassAvailable(): boolean {
    const nativeSupported = useMemo(() => isNativeLiquidGlassSupported(), []);
    const [reduceTransparency, setReduceTransparency] = useState<boolean>(false);

    useEffect(() => {
        if (!nativeSupported) {
            return;
        }

        let mounted = true;

        AccessibilityInfo.isReduceTransparencyEnabled()
            .then((enabled) => {
                if (mounted) {
                    setReduceTransparency(Boolean(enabled));
                }
            })
            .catch(() => {});

        const subscription = AccessibilityInfo.addEventListener(
            'reduceTransparencyChanged',
            (enabled) => {
                if (mounted) {
                    setReduceTransparency(Boolean(enabled));
                }
            }
        );

        return () => {
            mounted = false;
            subscription.remove();
        };
    }, [nativeSupported]);

    return nativeSupported && !reduceTransparency;
}

/**
 * Strips static opaque backgrounds, borders, and drop shadows from a ViewStyle so they
 * do not paint over the native UIVisualEffectView (UIGlassEffect) on iOS 26+, while keeping
 * all layout, sizing, padding, margin, and corner radius properties intact.
 */
function toCleanGlassLayoutStyle(
    style: StyleProp<ViewStyle>,
    borderRadius?: number
): ViewStyle {
    const flattened = StyleSheet.flatten([
        style,
        borderRadius !== undefined ? { borderRadius } : undefined,
    ]);

    if (!flattened) {
        return { borderCurve: 'continuous' };
    }

    const {
        backgroundColor: _bg,
        borderWidth: _bw,
        borderTopWidth: _btw,
        borderBottomWidth: _bbw,
        borderLeftWidth: _blw,
        borderRightWidth: _brw,
        borderStartWidth: _bsw,
        borderEndWidth: _bew,
        borderColor: _bc,
        borderTopColor: _btc,
        borderBottomColor: _bbc,
        borderLeftColor: _blc,
        borderRightColor: _brc,
        borderStartColor: _bsc,
        borderEndColor: _bec,
        shadowColor: _sc,
        shadowOffset: _so,
        shadowOpacity: _sop,
        shadowRadius: _sr,
        elevation: _el,
        ...layoutStyle
    } = flattened;

    return {
        ...layoutStyle,
        borderCurve: 'continuous',
    };
}

/**
 * Reusable Liquid Glass surface.
 * - On iOS 26+ (with Reduce Transparency off): Renders native `GlassView` forced to clean
 *   light appearance (`colorScheme="light"`) with fluid refraction and continuous corners.
 * - On iOS 15–25, Android, Web, or when Reduce Transparency is on: Falls back directly to a
 *   standard `View` with the exact present style (`style`).
 */
export const LiquidGlassView: React.FC<LiquidGlassViewProps> = ({
    variant = 'regular',
    tintColor,
    interactive = false,
    borderRadius,
    colorScheme,
    style,
    glassStyle,
    children,
    ...rest
}) => {
    const canUseGlass = useLiquidGlassAvailable();
    const { colors, resolvedTheme, isDark } = useAppTheme();

    const cleanGlassStyle = useMemo(
        () => (canUseGlass ? toCleanGlassLayoutStyle(style, borderRadius) : undefined),
        [canUseGlass, style, borderRadius]
    );

    const resolvedColorScheme: GlassColorScheme = colorScheme ?? resolvedTheme;

    const resolvedTintColor =
        tintColor !== undefined
            ? tintColor
            : variant === 'regular'
              ? colors.glassTint
              : isDark
                ? 'rgba(255, 255, 255, 0.04)'
                : 'rgba(255, 255, 255, 0.40)';

    if (canUseGlass) {
        return (
            <GlassView
                glassEffectStyle={variant}
                isInteractive={interactive}
                tintColor={resolvedTintColor}
                colorScheme={resolvedColorScheme}
                style={[
                    cleanGlassStyle,
                    isDark && {
                        borderColor: 'rgba(255, 255, 255, 0.08)',
                        borderWidth: StyleSheet.hairlineWidth,
                    },
                    glassStyle,
                ]}
                {...rest}
            >
                {children}
            </GlassView>
        );
    }

    const fallbackGlassStyle: ViewStyle = {
        borderRadius,
        backgroundColor: isDark
            ? (variant === 'clear' ? 'rgba(255, 255, 255, 0.06)' : 'rgba(30, 41, 59, 0.65)')
            : (variant === 'clear' ? 'rgba(0, 0, 0, 0.03)' : 'rgba(255, 255, 255, 0.82)'),
        borderColor: isDark
            ? 'rgba(255, 255, 255, 0.08)'
            : 'rgba(255, 255, 255, 0.45)',
        borderWidth: StyleSheet.hairlineWidth,
    };

    return (
        <View
            style={[
                fallbackGlassStyle,
                style,
                borderRadius !== undefined ? { borderRadius } : undefined,
            ]}
            {...rest}
        >
            {children}
        </View>
    );
};

/**
 * Container for grouping adjacent `LiquidGlassView` elements so they smoothly
 * blend and morph together on iOS 26+ via `UIGlassContainerEffect`.
 */
export const LiquidGlassContainer: React.FC<LiquidGlassContainerProps> = ({
    spacing = 12,
    style,
    children,
    ...rest
}) => {
    const canUseGlass = useLiquidGlassAvailable();

    if (canUseGlass) {
        return (
            <GlassContainer spacing={spacing} style={style} {...rest}>
                {children}
            </GlassContainer>
        );
    }

    return (
        <View style={style} {...rest}>
            {children}
        </View>
    );
};

export default LiquidGlassView;
