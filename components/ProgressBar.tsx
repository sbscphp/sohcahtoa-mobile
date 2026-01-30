import React from 'react';
import { View } from 'react-native';
import { ScaledSheet } from 'react-native-size-matters';
import { Colors } from '../constants/theme';

interface ProgressBarProps {
    progress: number; // 0 to 1
    totalSteps?: number;
}

const ProgressBar: React.FC<ProgressBarProps> = ({ progress, totalSteps = 3 }) => {
    // Determine which step is "active" by finding the threshold closest to progress
    let activeIndex = 0;
    let minDiff = Number.MAX_VALUE;

    for (let i = 0; i < totalSteps; i++) {
        const threshold = (i + 1) / totalSteps;
        const diff = Math.abs(progress - threshold);
        if (diff < minDiff) {
            minDiff = diff;
            activeIndex = i;
        }
    }

    return (
        <View style={styles.container}>
            {Array.from({ length: totalSteps }).map((_, index) => {
                const isActive = index === activeIndex;

                return (
                    <React.Fragment key={index}>
                        <View
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
