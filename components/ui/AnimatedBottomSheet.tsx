import { LiquidGlassView } from '@/components/ui/LiquidGlassView';
import { useAppTheme } from '@/context/ThemeContext';
import { useDevicePose } from '@/hooks/useDevicePose';
import React, { useEffect } from 'react';
import {
    Modal,
    Pressable,
    StyleProp,
    StyleSheet,
    useWindowDimensions,
    View,
    ViewStyle,
} from 'react-native';
import { GestureDetector, usePanGesture } from 'react-native-gesture-handler';
import Animated, {
    Easing,
    useAnimatedStyle,
    useReducedMotion,
    useSharedValue,
    withSpring,
    withTiming,
} from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { ScaledSheet, moderateScale } from 'react-native-size-matters';
import { scheduleOnRN } from 'react-native-worklets';

export interface AnimatedBottomSheetProps {
    visible: boolean;
    onClose: () => void;
    /**
     * Style applied to the floating sheet surface.
     */
    sheetStyle?: StyleProp<ViewStyle>;
    /**
     * Whether to render a subtle drag-handle pill at the top of the sheet.
     * @default true
     */
    showHandle?: boolean;
    /**
     * Optional custom tint color for the iOS 26+ Liquid Glass sheet surface.
     */
    glassTintColor?: string;
    /**
     * Optional header component rendered inside the top swipe-down drag zone.
     * Touches and downward gestures in this area will smoothly drag the sheet down to close.
     */
    headerComponent?: React.ReactNode;
    children: React.ReactNode;
}

export const AnimatedBottomSheet: React.FC<AnimatedBottomSheetProps> = ({
    visible,
    onClose,
    sheetStyle,
    showHandle = true,
    glassTintColor,
    headerComponent,
    children,
}) => {
    const { width, height } = useWindowDimensions();
    const insets = useSafeAreaInsets();
    const { isOpenDisplay, isLandscape } = useDevicePose();
    const { colors, resolvedTheme, isDark } = useAppTheme();
    const resolvedTint = glassTintColor ?? colors.glassTint;
    const reducedMotion = useReducedMotion();

    // Reanimated shared values for smooth entrance, exit, and swipe-down physics
    const translateY = useSharedValue(500);
    const backdropOpacity = useSharedValue(0);
    const isClosingRef = React.useRef(false);

    useEffect(() => {
        if (visible) {
            isClosingRef.current = false;
        }
    }, [visible]);

    const triggerClose = React.useCallback(() => {
        if (isClosingRef.current) return;
        isClosingRef.current = true;
        onClose();
    }, [onClose]);

    const handleDismissAnimation = () => {
        'worklet';
        backdropOpacity.value = withTiming(0, { duration: 140 });
        translateY.value = withTiming(
            height,
            { duration: 180, easing: Easing.out(Easing.quad) },
            () => {
                'worklet';
                scheduleOnRN(triggerClose);
            }
        );
    };

    const handleClose = () => {
        if (reducedMotion) {
            triggerClose();
        } else {
            backdropOpacity.value = withTiming(0, { duration: 140 });
            translateY.value = withTiming(
                height,
                { duration: 160, easing: Easing.in(Easing.quad) },
                () => {
                    'worklet';
                    scheduleOnRN(triggerClose);
                }
            );
            setTimeout(() => {
                triggerClose();
            }, 170);
        }
    };

    // Pan gesture for interactive swipe-down-to-close
    const panGesture = usePanGesture({
        activeOffsetY: [-5, 5],
        onUpdate: (event) => {
            'worklet';
            if (event.translationY > 0) {
                translateY.value = event.translationY;
                const progress = Math.min(1, event.translationY / 300);
                backdropOpacity.value = 1 - progress * 0.7;
            } else {
                // Elastic rubber-band resistance when pulling upward
                translateY.value = event.translationY * 0.12;
            }
        },
        onDeactivate: (event) => {
            'worklet';
            const shouldDismiss = event.translationY > 60 || event.velocityY > 450;
            if (shouldDismiss) {
                handleDismissAnimation();
            } else {
                // Snap back to open position
                translateY.value = withSpring(0, {
                    damping: 24,
                    stiffness: 280,
                    mass: 0.7,
                });
                backdropOpacity.value = withTiming(1, { duration: 140 });
            }
        },
    });

    // Animate entrance when visible changes
    useEffect(() => {
        if (visible) {
            if (reducedMotion) {
                translateY.value = 0;
                backdropOpacity.value = 1;
            } else {
                translateY.value = 400;
                backdropOpacity.value = 0;
                translateY.value = withSpring(0, {
                    damping: 24,
                    stiffness: 260,
                    mass: 0.8,
                });
                backdropOpacity.value = withTiming(1, { duration: 200 });
            }
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [visible, reducedMotion]);

    const animatedSheetStyle = useAnimatedStyle(() => ({
        transform: [{ translateY: translateY.value }],
    }));

    const animatedBackdropStyle = useAnimatedStyle(() => ({
        opacity: backdropOpacity.value,
    }));

    // Layout configuration for Unfolded (Landscape / Sidebar) vs Folded / Compact
    const isSidebarLayout = isLandscape && isOpenDisplay;
    const sidebarWidth = isSidebarLayout ? Math.max(insets.left, moderateScale(280)) : insets.left;
    const availableContentWidth = Math.max(320, width - sidebarWidth - insets.right);

    let sheetWrapperStyle: ViewStyle;
    if (isSidebarLayout) {
        // Centered over the active detail content area to the right of the sidebar
        const targetSheetWidth = Math.min(520, availableContentWidth - moderateScale(32));
        const sheetLeftOffset = sidebarWidth + (availableContentWidth - targetSheetWidth) / 2;
        sheetWrapperStyle = {
            width: targetSheetWidth,
            marginLeft: sheetLeftOffset,
            alignSelf: 'flex-start',
            alignItems: 'stretch',
            paddingBottom: Math.max(insets.bottom, moderateScale(16)),
        };
    } else if (isOpenDisplay) {
        // Wide unfolded display in portrait
        const targetSheetWidth = Math.min(540, width - insets.left - insets.right - moderateScale(32));
        sheetWrapperStyle = {
            width: targetSheetWidth,
            alignSelf: 'center',
            alignItems: 'stretch',
            paddingBottom: Math.max(insets.bottom, moderateScale(16)),
        };
    } else {
        // Compact / Folded iPhone or standard phone layout
        sheetWrapperStyle = {
            width: '100%',
            maxWidth: 600,
            alignSelf: 'center',
            alignItems: 'stretch',
            paddingLeft: insets.left + moderateScale(10),
            paddingRight: insets.right + moderateScale(10),
            paddingBottom: insets.bottom,
        };
    }

    return (
        <Modal
            visible={visible}
            transparent
            animationType="none"
            statusBarTranslucent
            onRequestClose={handleClose}
        >
            <View style={styles.overlay} pointerEvents="box-none">
                <Pressable
                    style={[styles.backdropTouch, { backgroundColor: 'transparent' }]}
                    onPress={handleClose}
                    accessibilityRole="button"
                    accessibilityLabel="Close sheet"
                >
                    <Animated.View
                        style={[
                            StyleSheet.absoluteFill,
                            { backgroundColor: colors.overlay },
                            animatedBackdropStyle,
                        ]}
                        pointerEvents="none"
                    />
                </Pressable>

                <Animated.View
                    pointerEvents="box-none"
                    style={[styles.sheetWrapper, sheetWrapperStyle, animatedSheetStyle]}
                >
                    <LiquidGlassView
                        variant="regular"
                        colorScheme={resolvedTheme}
                        tintColor={resolvedTint}
                        style={[
                            styles.defaultSheet,
                            sheetStyle,
                            {
                                width: '100%',
                                backgroundColor: colors.surface,
                                borderColor: colors.border,
                                borderWidth: isDark ? 1 : 0,
                            },
                        ]}
                    >
                        {/* Interactive Swipe-Down Drag Handle & Header Zone */}
                        <GestureDetector gesture={panGesture}>
                            <Animated.View style={styles.topDragZone}>
                                {showHandle && (
                                    <View style={styles.handleWrapper}>
                                        <View
                                            style={[
                                                styles.handlePill,
                                                {
                                                    backgroundColor: isDark
                                                        ? 'rgba(148, 163, 184, 0.55)'
                                                        : 'rgba(148, 163, 184, 0.45)',
                                                },
                                            ]}
                                        />
                                    </View>
                                )}
                                {headerComponent}
                            </Animated.View>
                        </GestureDetector>

                        {children}
                    </LiquidGlassView>
                </Animated.View>
            </View>
        </Modal>
    );
};

const styles = ScaledSheet.create({
    overlay: {
        flex: 1,
        justifyContent: 'flex-end',
    },
    backdropTouch: {
        ...StyleSheet.absoluteFill,
        backgroundColor: 'transparent',
    },
    sheetWrapper: {
        width: '100%',
    },
    defaultSheet: {
        width: '100%',
        backgroundColor: '#FFFFFF',
        borderRadius: '28@ms',
        paddingHorizontal: '16@s',
        paddingTop: '6@vs',
        paddingBottom: '24@vs',
        marginBottom: '16@vs',
    },
    topDragZone: {
        width: '100%',
    },
    handleWrapper: {
        alignItems: 'center',
        justifyContent: 'center',
        paddingTop: '4@vs',
        paddingBottom: '10@vs',
        width: '100%',
        minHeight: '28@vs',
    },
    handlePill: {
        width: '42@s',
        height: '4.5@vs',
        borderRadius: '2.5@ms',
        backgroundColor: 'rgba(148, 163, 184, 0.45)',
    },
});

export default AnimatedBottomSheet;
