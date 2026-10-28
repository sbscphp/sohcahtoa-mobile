import { useAppTheme } from '@/context/ThemeContext';
import { useFocusEffect } from 'expo-router';
import React, { useCallback } from 'react';
import { StyleProp, StyleSheet, ViewProps, ViewStyle } from 'react-native';
import Animated, {
    Easing,
    useAnimatedStyle,
    useReducedMotion,
    useSharedValue,
    withSpring,
    withTiming,
} from 'react-native-reanimated';

export interface AnimatedTabScreenProps extends ViewProps {
    style?: StyleProp<ViewStyle>;
    children: React.ReactNode;
}

/**
 * Wraps a tab screen so that every time the tab gains focus, its content performs
 * a smooth 120fps UI-thread entrance transition (subtle fade + vertical lift),
 * while respecting system "Reduce Motion" accessibility settings.
 */
export const AnimatedTabScreen: React.FC<AnimatedTabScreenProps> = ({
    style,
    children,
    ...rest
}) => {
    const { colors } = useAppTheme();
    const reducedMotion = useReducedMotion();
    const opacity = useSharedValue(1);
    const translateY = useSharedValue(0);

    useFocusEffect(
        useCallback(() => {
            if (reducedMotion) {
                opacity.value = 1;
                translateY.value = 0;
                return;
            }

            opacity.value = 0.88;
            translateY.value = 6;

            opacity.value = withTiming(1, {
                duration: 210,
                easing: Easing.out(Easing.cubic),
            });
            translateY.value = withSpring(0, {
                damping: 24,
                stiffness: 260,
            });
        }, [opacity, reducedMotion, translateY])
    );

    const animatedStyle = useAnimatedStyle(() => ({
        opacity: opacity.value,
        transform: [{ translateY: translateY.value }],
    }));

    return (
        <Animated.View
            style={[styles.container, style, { backgroundColor: colors.background }, animatedStyle]}
            {...rest}
        >
            {children}
        </Animated.View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
});

export default AnimatedTabScreen;
