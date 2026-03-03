import React from 'react';
import { View } from 'react-native';
import { ScaledSheet } from 'react-native-size-matters';
import { Colors } from '../constants/theme';

interface ProgressBarProps {
    progress?: number; // 0 to 1
    step?: number; // 1-based index
    totalSteps?: number;
}

const ProgressBar: React.FC<ProgressBarProps> = ({ progress, step, totalSteps = 3 }) => {
    // Determine active step. explicit 'step' takes precedence.
    // If 'step' is provided, it's 1-based.
    // If 'progress' is provided, we estimate the step.

    let currentStep = 0;

    if (step !== undefined) {
        currentStep = step;
    } else {
        // Fallback backward compatibility calculation
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
                // index is 0-based. Step is 1-based.
                // If currentStep is 1, index 0 should be active.
                // If currentStep is 2, index 0 and 1 should be active.
                const isActive = index < currentStep;

                return (
                    <React.Fragment key={index}>
                        <View
                            testID={`progress-segment-${index}`}
                            style={[
                                styles.segment,
                                { backgroundColor: isActive ? Colors.light.primary : '#E2E8F0' }
                            ]}
                        />
                        {index < totalSteps - 1 && <View style={styles.gap} />}
                    </React.Fragment>
                );
            })}
        </View>
    );
};

const styles = ScaledSheet.create({
    container: {
        width: '100%',
        paddingVertical: '16@vs',
        flexDirection: 'row',
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
