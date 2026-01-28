import { Scan } from 'iconsax-react-nativejs';
import React from 'react';
import { Modal, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { ScaledSheet, moderateScale } from 'react-native-size-matters';
import PrimaryButton from './PrimaryButton';
import { ScanFaceIcon } from 'lucide-react-native';

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
    return (
        <Modal
            animationType="slide"
            transparent={true}
            visible={visible}
            onRequestClose={onClose}
        >
            <View style={styles.overlay}>
                {/* Close on backdrop press */}
                <TouchableOpacity style={styles.backdrop} onPress={onClose} activeOpacity={1} />

                <View style={styles.sheetContent}>
                    {/* Warning/Info Icon */}
                    <View style={styles.headerIconContainer}>
                        {/* Using Warning2 or similar as "!" icon placeholder */}
                        <View style={styles.warningIconBg}>
                            <Text style={styles.warningIcon}>!</Text>
                        </View>
                    </View>

                    <Text style={styles.title}>Biometric Setup</Text>

                    <Text style={styles.description}>
                        Enable biometric authentication to securely access your account faster using your face ID.
                    </Text>

                    <View style={styles.centerIconContainer}>
                        <ScanFaceIcon size={moderateScale(48)} color="#94A3B8" /> 
                    </View>

                    <Text style={styles.consentText}>
                        By continuing, you consent to using your face ID for secure account access. You can turn this off anytime in settings.
                    </Text>

                    <View style={styles.buttonContainer}>
                        <PrimaryButton
                            title="Yes, Setup Biometrics"
                            onPress={onConfirm}
                            style={styles.confirmButton}
                        />

                        <TouchableOpacity style={styles.closeButton} onPress={onClose}>
                            <Text style={styles.closeButtonText}>No, Close</Text>
                        </TouchableOpacity>
                    </View>
                </View>
            </View>
        </Modal>
    );
};

const styles = ScaledSheet.create({
    overlay: {
        flex: 1,
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
        justifyContent: 'flex-end',
    },
    backdrop: {
        ...StyleSheet.absoluteFillObject,
    },
    sheetContent: {
        backgroundColor: '#FFFFFF',
        borderTopLeftRadius: '24@ms',
        borderTopRightRadius: '24@ms',
        padding: '24@s',
        paddingBottom: '40@vs',
    },
    headerIconContainer: {
        marginBottom: '16@vs',
        alignItems: 'flex-start',
    },
    warningIconBg: {
        width: '40@ms',
        height: '40@ms',
        borderRadius: '20@ms',
        backgroundColor: '#FFF7ED', // Light orange
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
        backgroundColor: '#F1F5F9', // Light gray standard
    },
    closeButtonText: {
        color: '#0F172A',
        fontSize: '14@ms',
        fontWeight: '500',
        paddingVertical: '10@ms',
    },
});

export default BiometricBottomSheet;
