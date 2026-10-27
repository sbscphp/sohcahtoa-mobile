import AnimatedBottomSheet from '@/components/ui/AnimatedBottomSheet';
import { Colors } from '@/constants/theme';
import { Fingerprint, ScanFaceIcon } from 'lucide-react-native';
import React from 'react';
import { Text, TouchableOpacity, View } from 'react-native';
import { ScaledSheet, moderateScale } from 'react-native-size-matters';
import PrimaryButton from './PrimaryButton';
import { useAppTheme } from '@/hooks/useAppTheme';

interface BiometricSelectionSheetProps {
    visible: boolean;
    onClose: () => void;
    onSelectFace: () => void;
    onSelectFingerprint: () => void;
}

const BiometricSelectionSheet: React.FC<BiometricSelectionSheetProps> = ({
    visible,
    onClose,
    onSelectFace,
    onSelectFingerprint,
}) => {
    const { colors, isDark } = useAppTheme();

    return (
        <AnimatedBottomSheet
            visible={visible}
            onClose={onClose}
            sheetStyle={[styles.sheetContent, { backgroundColor: colors.card, borderColor: colors.border, borderWidth: isDark ? 1 : 0 }]}
        >
            <View style={styles.headerIconContainer}>
                <View style={[styles.warningIconBg, { backgroundColor: isDark ? 'rgba(255, 107, 44, 0.15)' : '#FFF7ED' }]}>
                    <Text style={[styles.exclamationMark, { color: colors.primary }]}>!</Text>
                </View>
            </View>

            <Text style={[styles.title, { color: colors.text }]}>Choose Biometric Setup</Text>

            <Text style={[styles.description, { color: colors.textMuted }]}>
                Select desired biometrics for secure login to your account.
            </Text>

            <View style={styles.graphicContainer}>
                <ScanFaceIcon size={moderateScale(48)} color={colors.icon} />
                <View style={[styles.verticalDivider, { backgroundColor: colors.primary }]} />
                <Fingerprint size={moderateScale(48)} color={colors.icon} />
            </View>

            <View style={styles.buttonContainer}>
                <PrimaryButton
                    title="Face Recognition"
                    onPress={onSelectFace}
                    style={styles.faceButton}
                />

                <TouchableOpacity
                    style={[styles.fingerprintButton, { backgroundColor: isDark ? colors.surfaceHighlight : '#F1F5F9' }]}
                    onPress={onSelectFingerprint}
                >
                    <Text style={[styles.fingerprintButtonText, { color: colors.text }]}>Fingerprint</Text>
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
        backgroundColor: '#FFF7ED', // Light Orange bg
        justifyContent: 'center',
        alignItems: 'center',
    },
    exclamationMark: {
        fontSize: '20@ms',
        fontWeight: '800',
        color: '#FF6B2C', // Primary Color
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
    graphicContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        gap: '24@s',
        marginBottom: '32@vs',
    },
    verticalDivider: {
        width: '1@s',
        height: '48@vs',
        backgroundColor: Colors.light.primary, // Orange divider as seen in design
    },
    buttonContainer: {
        gap: '12@vs',
    },
    faceButton: {
        width: '100%',
    },
    fingerprintButton: {
        width: '100%',
        height: '48@vs',
        borderRadius: '28@ms',
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: '#F1F5F9', // Light gray 
    },
    fingerprintButtonText: {
        color: '#0F172A',
        fontSize: '14@ms',
        fontWeight: '500',
    },
});

export default BiometricSelectionSheet;
