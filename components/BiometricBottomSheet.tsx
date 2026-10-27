import AnimatedBottomSheet from '@/components/ui/AnimatedBottomSheet';
import { Colors } from '@/constants/theme';
import { InfoCircle } from 'iconsax-react-nativejs';
import { ScanFaceIcon } from 'lucide-react-native';
import React from 'react';
import { Text, TouchableOpacity, View } from 'react-native';
import { ScaledSheet, moderateScale } from 'react-native-size-matters';
import PrimaryButton from './PrimaryButton';
import { useAppTheme } from '@/hooks/useAppTheme';

interface BiometricBottomSheetProps {
    visible: boolean;
    onClose: () => void;
    onConfirm: () => void;
}

const BiometricBottomSheet: React.FC<BiometricBottomSheetProps> = ({
    visible,
    onClose,
    onConfirm,
}) => {
    const { colors, isDark } = useAppTheme();

    return (
        <AnimatedBottomSheet
            visible={visible}
            onClose={onClose}
            sheetStyle={[styles.sheetContent, { backgroundColor: colors.card, borderColor: colors.border, borderWidth: isDark ? 1 : 0 }]}
        >
            <View style={styles.headerIconContainer}>
                <View style={[styles.warningIconBg, { backgroundColor: isDark ? 'rgba(255, 107, 44, 0.15)' : 'rgba(241, 241, 241, 1)' }]}>
                    <InfoCircle size={moderateScale(24)} color={colors.primary} variant="Bold" />
                </View>
            </View>

            <Text style={[styles.title, { color: colors.text }]}>Biometric Setup</Text>

            <Text style={[styles.description, { color: colors.textMuted }]}>
                Enable biometric authentication to securely access your account faster using your face ID.
            </Text>

            <View style={styles.centerIconContainer}>
                <ScanFaceIcon size={moderateScale(48)} color={colors.icon} />
            </View>

            <Text style={[styles.consentText, { color: colors.textMuted }]}>
                By continuing, you consent to using your face ID for secure account access. You can turn this off anytime in settings.
            </Text>

            <View style={styles.buttonContainer}>
                <PrimaryButton
                    title="Yes, Setup Biometrics"
                    onPress={onConfirm}
                    style={styles.confirmButton}
                />

                <TouchableOpacity style={[styles.closeButton, { backgroundColor: isDark ? colors.surfaceHighlight : '#F1F5F9' }]} onPress={onClose}>
                    <Text style={[styles.closeButtonText, { color: colors.text }]}>No, Close</Text>
                </TouchableOpacity>
            </View>
        </AnimatedBottomSheet>
    );
};

const styles = ScaledSheet.create({
    sheetContent: {
        backgroundColor: '#FFFFFF',
        borderRadius: '28@ms',
        padding: '24@s',
        paddingTop: '12@vs',
        paddingBottom: '32@vs',
        marginBottom: '28@vs',
        marginHorizontal: '12@s',
    },
    headerIconContainer: {
        marginBottom: '16@vs',
        alignItems: 'flex-start',
    },
    warningIconBg: {
        width: '40@ms',
        height: '40@ms',
        borderRadius: '20@ms',
        backgroundColor: 'rgba(241, 241, 241, 1)',
        justifyContent: 'center',
        alignItems: 'center',
    },
    warningIcon: {
        fontSize: '20@ms',
        fontWeight: '700',
        color: '#F97316', // Orange
    },
    title: {
        fontSize: '18@ms',
        fontWeight: '700',
        color: '#0F172A',
        marginBottom: '8@vs',
    },
    description: {
        fontSize: '14@ms',
        color: '#64748B',
        lineHeight: '20@ms',
        marginBottom: '32@vs',
    },
    centerIconContainer: {
        alignItems: 'center',
        marginBottom: '24@vs',
    },
    consentText: {
        fontSize: '13@ms',
        color: '#64748B',
        textAlign: 'center',
        marginBottom: '32@vs',
        lineHeight: '18@ms',
    },
    buttonContainer: {
        gap: '12@vs',
    },
    confirmButton: {
        width: '100%',
    },
    closeButton: {
        width: '100%',
        height: '40@vs',
        borderRadius: '28@ms',
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: '#F1F5F9', 
    },
    closeButtonText: {
        color: '#0F172A',
        fontSize: '14@ms',
        fontWeight: '500',
        paddingVertical: '10@ms',
    },
});

export default BiometricBottomSheet;
