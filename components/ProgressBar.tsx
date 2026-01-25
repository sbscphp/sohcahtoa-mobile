import React from 'react';
import { View } from 'react-native';
import { ScaledSheet } from 'react-native-size-matters';
import { Colors } from '../constants/theme';

interface ProgressBarProps {
    progress: number; // 0 to 1
}

const ProgressBar: React.FC<ProgressBarProps> = ({ progress }) => {
    return (
        <View style={styles.container}>
            <View
                style={[
                    styles.segment,
                    { backgroundColor: progress >= 0.5 ? Colors.light.primary : '#E2E8F0' }
                ]}
            />
            <View style={styles.gap} />
            <View
                style={[
                    styles.segment,
                    { backgroundColor: progress >= 1.0 ? Colors.light.primary : '#E2E8F0' }
                ]}
            />
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
