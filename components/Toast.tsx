import * as Haptics from 'expo-haptics';
import { AlertCircle, Check, X } from 'lucide-react-native';
import React, { useEffect, useMemo, useRef } from 'react';
import { Pressable, Text, View } from 'react-native';
import { Gesture, GestureDetector } from 'react-native-gesture-handler';
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

export interface ToastAction {
    label: string;
    onPress: () => void;
}

export interface ToastProps {
    visible: boolean;
    message: string;
    onDismiss?: () => void;
    type?: 'success' | 'error' | 'warning';
    persistent?: boolean;
    title?: string;
    duration?: number;
    action?: ToastAction;
    position?: 'bottom' | 'top';
}

const TOAST_THEMES = {
    success: {
        icon: Check,
        badgeBg: '#10B981',
        iconColor: '#FFFFFF',
        defaultTitle: 'Success',
        hapticType: Haptics.NotificationFeedbackType.Success,
    },
    error: {
        icon: X,
        badgeBg: '#EF4444',
        iconColor: '#FFFFFF',
        defaultTitle: 'Error',
        hapticType: Haptics.NotificationFeedbackType.Error,
    },
    warning: {
        icon: AlertCircle,
        badgeBg: '#F59E0B',
        iconColor: '#FFFFFF',
        defaultTitle: 'Notice',
        hapticType: Haptics.NotificationFeedbackType.Warning,
    },
};

const Toast: React.FC<ToastProps> = ({
    visible,
    message,
    onDismiss,
    type = 'success',
    persistent = false,
    title,
    duration = 3500,
    action,
    position = 'top',
}) => {
    const insets = useSafeAreaInsets();
    const reducedMotion = useReducedMotion();
    const isBottom = position === 'bottom';
    const initialTranslate = isBottom ? 80 : -80;

    const translateY = useSharedValue(initialTranslate);
    const scale = useSharedValue(0.96);
    const opacity = useSharedValue(0);
    const hasTriggeredHaptic = useRef(false);

    const activeTheme = TOAST_THEMES[type] || TOAST_THEMES.success;
    const resolvedTitle = title || activeTheme.defaultTitle;
    const IconComponent = activeTheme.icon;

    const dismissToast = useMemo(() => {
        return () => {
            if (reducedMotion) {
                onDismiss?.();
                return;
            }
            opacity.value = withTiming(0, { duration: 160 });
            scale.value = withTiming(0.94, { duration: 160 });
            translateY.value = withTiming(
                initialTranslate,
                { duration: 180, easing: Easing.in(Easing.quad) },
                (finished) => {
                    if (finished && onDismiss) {
                        scheduleOnRN(onDismiss);
                    }
                }
            );
        };
    }, [initialTranslate, onDismiss, opacity, reducedMotion, scale, translateY]);

    useEffect(() => {
        if (visible) {
            if (!hasTriggeredHaptic.current) {
                hasTriggeredHaptic.current = true;
                try {
                    const promise = Haptics.notificationAsync(activeTheme.hapticType);
                    if (promise && typeof promise.catch === 'function') {
                        promise.catch(() => {});
                    }
                } catch {
                    // Ignore haptic failures
                }
            }

            if (reducedMotion) {
                translateY.value = 0;
                scale.value = 1;
                opacity.value = 1;
            } else {
                translateY.value = withSpring(0, {
                    damping: 18,
                    stiffness: 240,
                    mass: 0.7,
                });
                scale.value = withSpring(1, {
                    damping: 18,
                    stiffness: 250,
                });
                opacity.value = withTiming(1, { duration: 170 });
            }

            if (!persistent && onDismiss) {
                const timer = setTimeout(() => {
                    dismissToast();
                }, duration);
                return () => clearTimeout(timer);
            }
        } else {
            hasTriggeredHaptic.current = false;
            translateY.value = initialTranslate;
            scale.value = 0.96;
            opacity.value = 0;
        }
    }, [
        visible,
        persistent,
        onDismiss,
        duration,
        activeTheme.hapticType,
        reducedMotion,
        translateY,
        scale,
        opacity,
        dismissToast,
        initialTranslate,
    ]);

    const panGesture = useMemo(
        () =>
            Gesture.Pan()
                .activeOffsetY([-6, 6])
                .onUpdate((event) => {
                    if (isBottom) {
                        if (event.translationY > 0) {
                            // Dragging down towards dismissal
                            translateY.value = event.translationY;
                            const factor = Math.max(0.88, 1 - event.translationY / 400);
                            scale.value = factor;
                        } else {
                            // Elastic upward resistance
                            translateY.value = event.translationY * 0.12;
                        }
                    } else {
                        if (event.translationY < 0) {
                            // Dragging up towards dismissal
                            translateY.value = event.translationY;
                            const factor = Math.max(0.88, 1 + event.translationY / 400);
                            scale.value = factor;
                        } else {
                            // Elastic downward resistance
                            translateY.value = event.translationY * 0.12;
                        }
                    }
                })
                .onEnd((event) => {
                    const shouldDismiss = isBottom
                        ? event.translationY > 24 || event.velocityY > 280
                        : event.translationY < -24 || event.velocityY < -280;

                    if (shouldDismiss) {
                        opacity.value = withTiming(0, { duration: 140 });
                        scale.value = withTiming(0.92, { duration: 140 });
                        translateY.value = withTiming(
                            initialTranslate,
                            { duration: 160, easing: Easing.in(Easing.quad) },
                            (finished) => {
                                if (finished && onDismiss) {
                                    scheduleOnRN(onDismiss);
                                }
                            }
                        );
                    } else {
                        translateY.value = withSpring(0, {
                            damping: 18,
                            stiffness: 250,
                        });
                        scale.value = withSpring(1, {
                            damping: 18,
                            stiffness: 250,
                        });
                    }
                }),
        [initialTranslate, isBottom, onDismiss, opacity, scale, translateY]
    );

    const animatedStyle = useAnimatedStyle(() => ({
        transform: [
            { translateY: translateY.value },
            { scale: scale.value },
        ],
        opacity: opacity.value,
    }));

    if (!visible) return null;

    const verticalOffsetStyle = isBottom
        ? { bottom: Math.max(insets.bottom, 16) + moderateScale(16) }
        : { top: Math.max(insets.top, 16) + moderateScale(8) };

    const handleActionPress = () => {
        if (action?.onPress) {
            action.onPress();
        }
        dismissToast();
    };

    return (
        <View
            pointerEvents="box-none"
            style={[styles.overlay, verticalOffsetStyle]}
            testID="toast-overlay"
        >
            <GestureDetector gesture={panGesture}>
                <Animated.View style={[styles.capsuleWrapper, animatedStyle]}>
                    <Pressable
                        onPress={dismissToast}
                        style={({ pressed }) => [
                            styles.capsuleCard,
                            pressed && { opacity: 0.94, transform: [{ scale: 0.994 }] },
                        ]}
                        accessibilityRole="alert"
                        accessibilityLiveRegion="polite"
                        testID="toast-card"
                    >
                        {/* Status Icon Badge: Compact Filled Circle with Crisp White Glyph */}
                        <View
                            style={[
                                styles.iconBadge,
                                {
                                    backgroundColor: activeTheme.badgeBg,
                                },
                            ]}
                        >
                            <IconComponent
                                size={moderateScale(13.5)}
                                color={activeTheme.iconColor}
                                strokeWidth={2.8}
                            />
                        </View>

                        {/* Title and Message */}
                        <View style={styles.textContainer}>
                            <Text style={styles.titleText} numberOfLines={1}>
                                {resolvedTitle}
                            </Text>
                            <Text style={styles.messageText} numberOfLines={2}>
                                {message}
                            </Text>
                        </View>

                        {/* Optional Inline Action Button */}
                        {action ? (
                            <Pressable
                                onPress={handleActionPress}
                                style={({ pressed }) => [
                                    styles.actionButton,
                                    pressed && { opacity: 0.75, backgroundColor: 'rgba(56, 189, 248, 0.16)' },
                                ]}
                                accessibilityRole="button"
                                accessibilityLabel={action.label}
                                testID="toast-action-button"
                            >
                                <Text style={styles.actionText}>{action.label}</Text>
                            </Pressable>
                        ) : null}
                    </Pressable>
                </Animated.View>
            </GestureDetector>
        </View>
    );
};

const styles = ScaledSheet.create({
    overlay: {
        position: 'absolute',
        left: 0,
        right: 0,
        zIndex: 9999,
        alignItems: 'center',
    },
    capsuleWrapper: {
        width: '100%',
        alignItems: 'center',
        paddingHorizontal: '12@s',
    },
    capsuleCard: {
        width: '100%',
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#1E2024',
        borderRadius: '12@ms',
        borderWidth: 1,
        borderColor: 'rgba(255, 255, 255, 0.14)',
        paddingVertical: '6@vs',
        paddingLeft: '10@s',
        paddingRight: '12@s',
        minHeight: '42@vs',
        // Elevated floating shadow
        shadowColor: '#000000',
        shadowOffset: { width: 0, height: 6 },
        shadowOpacity: 0.32,
        shadowRadius: 16,
        elevation: 8,
    },
    iconBadge: {
        width: '24@ms',
        height: '24@ms',
        borderRadius: '12@ms',
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: '8@s',
    },
    textContainer: {
        flex: 1,
        justifyContent: 'center',
        paddingRight: '4@s',
    },
    titleText: {
        fontSize: '12@ms',
        fontWeight: '700',
        color: '#FFFFFF',
        marginBottom: '0@vs',
        letterSpacing: -0.2,
        lineHeight: '15@ms',
    },
    messageText: {
        fontSize: '11@ms',
        fontWeight: '400',
        color: '#CBD5E1',
        lineHeight: '14@ms',
    },
    actionButton: {
        paddingHorizontal: '9@s',
        paddingVertical: '4@vs',
        borderRadius: '6@ms',
        backgroundColor: 'rgba(56, 189, 248, 0.12)',
        marginLeft: '6@s',
        justifyContent: 'center',
        alignItems: 'center',
    },
    actionText: {
        fontSize: '12@ms',
        fontWeight: '700',
        color: '#38BDF8',
        letterSpacing: -0.1,
    },
});

export default Toast;
