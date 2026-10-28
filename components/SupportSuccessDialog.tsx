import PrimaryButton from '@/components/PrimaryButton';
import { LiquidGlassView } from '@/components/ui/LiquidGlassView';
import React from 'react';
import { Image, Modal, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import Animated, { FadeInDown } from 'react-native-reanimated';
import { ScaledSheet } from 'react-native-size-matters';
import { useAppTheme } from '@/hooks/useAppTheme';

interface SupportSuccessDialogProps {
    visible: boolean;
    onClose: () => void;
    title?: string;
    description?: string;
    primaryButtonText?: string;
}

const SupportSuccessDialog: React.FC<SupportSuccessDialogProps> = ({
    visible,
    onClose,
    title = 'Success!',
    description = 'Your support request has been submitted successfully.',
    primaryButtonText = 'Okay',
}) => {
    const { colors, isDark } = useAppTheme();

    return (
        <Modal
            visible={visible}
            transparent={true}
            animationType="fade"
            onRequestClose={onClose}
        >
            <View style={styles.overlay}>
                <TouchableOpacity
                    style={[StyleSheet.absoluteFill, { backgroundColor: 'transparent' }]}
                    onPress={onClose}
                    activeOpacity={1}
                />
                <Animated.View
                    entering={FadeInDown.duration(200).springify().damping(24).stiffness(280)}
                    style={styles.dialogWrapper}
                >
                    <LiquidGlassView
                        variant="regular"
                        colorScheme={isDark ? 'dark' : 'light'}
                        tintColor={colors.glassTint}
                        style={styles.dialogContainer}
                    >
                        <View style={styles.iconContainer}>
                            <Image source={require('../assets/icons/success.gif')} style={styles.icon} />
                        </View>

                        <Text style={[styles.title, { color: colors.text }]}>{title}</Text>
                        <Text style={[styles.description, { color: colors.textMuted }]}>{description}</Text>

                        <View style={styles.footer}>
                            <PrimaryButton title={primaryButtonText} onPress={onClose} />
                        </View>
                    </LiquidGlassView>
                </Animated.View>
            </View>
        </Modal>
    );
};

const styles = ScaledSheet.create({
    overlay: {
        flex: 1,
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
        justifyContent: 'center',
        alignItems: 'center',
        paddingHorizontal: '20@s',
        zIndex: 999
    },
    dialogWrapper: {
        width: '100%',
    },
    dialogContainer: {
        width: '100%',
        backgroundColor: '#FFFFFF',
        borderRadius: '24@ms',
        padding: '24@ms',
        alignItems: 'center',
    },
    iconContainer: {
        marginBottom: '20@vs',
    },
    icon: {
        width: '100@ms',
        height: '100@ms',
        resizeMode: 'contain',
    },
    title: {
        fontSize: '18@ms',
        fontWeight: '700',
        color: '#0F172A',
        textAlign: 'center',
        marginBottom: '8@vs',
    },
    description: {
        fontSize: '14@ms',
        color: '#64748B',
        textAlign: 'center',
        lineHeight: '22@ms',
        marginBottom: '24@vs',
    },
    footer: {
        width: '100%',
    },
});

export default SupportSuccessDialog;
