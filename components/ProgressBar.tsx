import { useAppTheme } from '@/context/ThemeContext';
import React, { useEffect } from 'react';
import { View } from 'react-native';
import Animated, {
    Easing,
    interpolate,
    interpolateColor,
    useAnimatedStyle,
    useReducedMotion,
    useSharedValue,
    withTiming,
} from 'react-native-reanimated';
import { ScaledSheet } from 'react-native-size-matters';

interface ProgressBarProps {
    progress?: number; // 0 to 1
    step?: number; // 1-based index
    totalSteps?: number;
}

interface ProgressSegmentProps {
    index: number;
    isActive: boolean;
}

const ProgressSegment: React.FC<ProgressSegmentProps> = ({ index, isActive }) => {
    const { colors } = useAppTheme();
    const reducedMotion = useReducedMotion();
    const progress = useSharedValue(isActive ? 1 : 0);

    const activeColor = colors.primary;
    const inactiveColor = colors.border;

    useEffect(() => {
        if (reducedMotion) {
            progress.value = isActive ? 1 : 0;
            return;
        }
        progress.value = withTiming(isActive ? 1 : 0, {
            duration: 260,
            easing: Easing.out(Easing.cubic),
        });
    }, [isActive, progress, reducedMotion]);

    const animatedStyle = useAnimatedStyle(() => ({
        backgroundColor: interpolateColor(
            progress.value,
            [0, 1],
            [inactiveColor, activeColor]
        ),
        transform: [
            {
                scaleY: interpolate(progress.value, [0, 0.5, 1], [1, 1.2, 1]),
            },
        ],
    }));

    return (
        <Animated.View
            testID={`progress-segment-${index}`}
            style={[
                styles.segment,
                { backgroundColor: isActive ? activeColor : inactiveColor },
                animatedStyle,
            ]}
        />
    );
};

const ProgressBar: React.FC<ProgressBarProps> = ({ progress, step, totalSteps = 3 }) => {
    let currentStep = 0;

    if (step !== undefined) {
        currentStep = step;
    } else {
        let minDiff = Number.MAX_VALUE;
        for (let i = 0; i < totalSteps; i++) {
            const threshold = (i + 1) / totalSteps;
            const diff = Math.abs((progress ?? 0) - threshold);
            if (diff < minDiff) {
                minDiff = diff;
                currentStep = i + 1;
            }
        }
    }

    return (
        <View style={styles.container}>
            {Array.from({ length: totalSteps }).map((_, index) => {
                const isActive = index < currentStep;

                return (
                    <React.Fragment key={index}>
                        <ProgressSegment index={index} isActive={isActive} />
                        {index < totalSteps - 1 && <View style={styles.gap} />}
                    </React.Fragment>
                );
            })}
        </View>
    );
};

const styles = ScaledSheet.create({
    container: {
        flexDirection: 'row',
        alignItems: 'center',
        width: '100%',
        marginVertical: '10@vs',
    },
    segment: {
        flex: 1,
        height: '4@vs',
        borderRadius: '2@ms',
    },
    gap: {
        width: '8@s',
    },
});

export default ProgressBar;
