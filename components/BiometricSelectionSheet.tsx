import { Colors } from '@/constants/theme';
import { Fingerprint, ScanFaceIcon } from 'lucide-react-native';
import React from 'react';
import { Modal, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { ScaledSheet, moderateScale } from 'react-native-size-matters';
import PrimaryButton from './PrimaryButton';

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
                    <View style={styles.headerIconContainer}>
                        <View style={styles.warningIconBg}>
                            {/* ! icon or InfoCircle - using InfoCircle orange as per design vibe */}
                            <Text style={styles.exclamationMark}>!</Text>
                        </View>
                    </View>

                    <Text style={styles.title}>Choose Biometric Setup</Text>

                    <Text style={styles.description}>
                        Select desired biometrics for secure login to your account.
                    </Text>

                    <View style={styles.graphicContainer}>
                        <ScanFaceIcon size={moderateScale(48)} color="#94A3B8" />
                        <View style={styles.verticalDivider} />
                        <Fingerprint size={moderateScale(48)} color="#94A3B8" />
                    </View>

                    <View style={styles.buttonContainer}>
                        <PrimaryButton
                            title="Face Recognition"
                            onPress={onSelectFace}
                            style={styles.faceButton}
                        />

                        <TouchableOpacity
                            style={styles.fingerprintButton}
                            onPress={onSelectFingerprint}
                        >
                            <Text style={styles.fingerprintButtonText}>Fingerprint</Text>
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
