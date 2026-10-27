import { LiquidGlassView } from '@/components/ui/LiquidGlassView';
import { useAppTheme } from '@/context/ThemeContext';
import React from 'react';
import {
    Modal,
    Pressable,
    StyleProp,
    StyleSheet,
    View,
    ViewStyle,
} from 'react-native';
import { ScaledSheet } from 'react-native-size-matters';

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
    children: React.ReactNode;
}

export const AnimatedBottomSheet: React.FC<AnimatedBottomSheetProps> = ({
    visible,
    onClose,
    sheetStyle,
    showHandle = true,
    glassTintColor,
    children,
}) => {
    const { colors, resolvedTheme, isDark } = useAppTheme();
    const resolvedTint = glassTintColor ?? colors.glassTint;

    return (
        <Modal
            visible={visible}
            transparent
            animationType="none"
            statusBarTranslucent
            onRequestClose={onClose}
        >
            <View style={styles.overlay}>
                <View style={[styles.backdropTint, { backgroundColor: colors.overlay }]} />
                <Pressable
                    style={styles.backdropTouch}
                    onPress={onClose}
                    accessibilityRole="button"
                    accessibilityLabel="Close sheet"
                />

                <View style={styles.sheetWrapper}>
                    <LiquidGlassView
                        variant="regular"
                        colorScheme={resolvedTheme}
                        tintColor={resolvedTint}
                        style={[
                            styles.defaultSheet,
                            sheetStyle,
                            {
                                backgroundColor: colors.surface,
                                borderColor: colors.border,
                                borderWidth: isDark ? 1 : 0,
                            },
                        ]}
                    >
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
                        {children}
                    </LiquidGlassView>
                </View>
            </View>
        </Modal>
    );
};

const styles = ScaledSheet.create({
    overlay: {
        flex: 1,
        justifyContent: 'flex-end',
    },
    backdropTint: {
        ...StyleSheet.absoluteFillObject,
        backgroundColor: 'rgba(15, 23, 42, 0.45)',
    },
    backdropTouch: {
        ...StyleSheet.absoluteFillObject,
    },
    sheetWrapper: {
        width: '100%',
    },
    defaultSheet: {
        backgroundColor: '#FFFFFF',
        borderRadius: '30@ms',
        paddingHorizontal: '20@s',
        paddingTop: '12@vs',
        paddingBottom: '28@vs',
        marginBottom: '28@vs',
        marginHorizontal: '12@s',
    },
    handleWrapper: {
        alignItems: 'center',
        paddingTop: '2@vs',
        paddingBottom: '10@vs',
    },
    handlePill: {
        width: '36@s',
        height: '4@vs',
        borderRadius: '2@ms',
        backgroundColor: 'rgba(148, 163, 184, 0.45)',
    },
});

export default AnimatedBottomSheet;
