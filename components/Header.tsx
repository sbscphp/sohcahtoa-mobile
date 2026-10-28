import { LiquidGlassView, useLiquidGlassAvailable } from '@/components/ui/LiquidGlassView';
import { useAppTheme } from '@/context/ThemeContext';
import { useResponsiveHeaderHeight, useDevicePose } from '@/hooks/useDevicePose';
import { useRouter } from 'expo-router';
import { ArrowCircleLeft2 } from 'iconsax-react-nativejs';
import React, { ReactNode } from 'react';
import { Pressable, Text, View } from 'react-native';
import { ScaledSheet, moderateScale } from 'react-native-size-matters';

interface HeaderProps {
    title: string;
    rightIcon?: ReactNode;
    onRightPress?: () => void;
    onBackPress?: () => void;
    showBackButton?: boolean;
}

const Header: React.FC<HeaderProps> = ({ title, rightIcon, onRightPress, onBackPress, showBackButton = true }) => {
    const router = useRouter();
    const canUseGlass = useLiquidGlassAvailable();
    const { colors } = useAppTheme();
    const headerMinHeight = useResponsiveHeaderHeight(56, 68);
    const { isIPhoneDuo, insets } = useDevicePose();

    const rightOffset = isIPhoneDuo
        ? (insets.right > 0 ? Math.min(insets.right, moderateScale(48)) : moderateScale(42))
        : insets.right;

    return (
        <View style={[styles.header, { minHeight: headerMinHeight, backgroundColor: colors.background, borderBottomColor: colors.divider }]}>
            {showBackButton ? (
                <LiquidGlassView
                    variant="clear"
                    interactive
                    borderRadius={moderateScale(18)}
                >
                    <Pressable
                        onPress={onBackPress || (() => router.back())}
                        style={({ pressed }) => [
                            styles.btn,
                            !canUseGlass && pressed && { opacity: 0.7 },
                        ]}
                        accessible={true}
                        accessibilityLabel="Go back"
                        accessibilityRole="button"
                    >
                        <ArrowCircleLeft2 size={moderateScale(28)} color={colors.iconMuted} />
                    </Pressable>
                </LiquidGlassView>
            ) : (
                <View style={{ width: moderateScale(36) }} />
            )}

            <Text style={[styles.headerTitle, { color: colors.text }]} numberOfLines={1}>{title}</Text>

            <View style={[styles.rightContainer, rightIcon && { marginRight: rightOffset }]}>
                {rightIcon ? (
                    <LiquidGlassView
                        variant="clear"
                        interactive
                        borderRadius={moderateScale(18)}
                    >
                        <Pressable
                            onPress={onRightPress}
                            style={({ pressed }) => [
                                styles.btn,
                                !canUseGlass && pressed && { opacity: 0.7 },
                            ]}
                            accessibilityRole="button"
                        >
                            {rightIcon}
                        </Pressable>
                    </LiquidGlassView>
                ) : (
                    <View style={{ width: moderateScale(24) }} />
                )}
            </View>
        </View>
    );
};

const styles = ScaledSheet.create({
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: '14@s',
        paddingVertical: '16@vs',
        minHeight: '56@vs',
        backgroundColor: '#FFFFFF',
        borderBottomWidth: 1,
        borderBottomColor: '#F1F5F9',
    },
    btn: {
        padding: '4@ms',
    },
    headerTitle: {
        fontSize: '14@ms',
        fontWeight: '600',
        color: 'rgba(50, 49, 49, 1)',
    },
    rightContainer: {
        minWidth: '32@s',
        alignItems: 'flex-end',
    }
});

export default Header;
