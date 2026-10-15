import React from 'react';
import { Modal, Text, View } from 'react-native';
import { ScaledSheet, moderateScale } from 'react-native-size-matters';
import { Warning2 } from 'iconsax-react-nativejs';
import PrimaryButton from '@/components/PrimaryButton';

interface DeleteAccountModalProps {
    visible: boolean;
    onClose: () => void;
    onConfirm: () => void;
}

export default function DeleteAccountModal({
    visible,
    onClose,
    onConfirm,
}: DeleteAccountModalProps) {
    return (
        <Modal
            transparent
            visible={visible}
            animationType="fade"
            onRequestClose={onClose}
        >
            <View style={styles.modalOverlay}>
                <View style={styles.modalContent}>
                    <View style={styles.warningIconContainer}>
                        <Warning2 size={moderateScale(24)} color="#EF4444" variant="Bold" />
                    </View>
                    <Text style={styles.modalTitle}>Delete Bank Account</Text>
                    <Text style={styles.modalMessage}>
                        Are you sure you want to remove this bank account? This action cannot be undone.
                    </Text>
                    <PrimaryButton
                        title="Yes, Delete"
                        onPress={onConfirm}
                        style={{ backgroundColor: '#EF4444', marginBottom: moderateScale(12) }}
                    />
                    <PrimaryButton
                        title="No, Cancel"
                        onPress={onClose}
                        style={{ backgroundColor: '#F1F5F9' }}
                        textStyle={{ color: '#0F172A' }}
                    />
                </View>
            </View>
        </Modal>
    );
}

const styles = ScaledSheet.create({
    modalOverlay: {
        flex: 1,
        backgroundColor: 'rgba(15, 23, 42, 0.4)',
        justifyContent: 'center',
        alignItems: 'center',
        padding: '24@ms',
    },
    modalContent: {
        width: '100%',
        backgroundColor: '#FFFFFF',
        borderRadius: '24@ms',
        padding: '24@ms',
        alignItems: 'center',
    },
    warningIconContainer: {
        width: '48@ms',
        height: '48@ms',
        borderRadius: '24@ms',
        backgroundColor: '#FEF2F2',
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: '16@vs',
    },
    modalTitle: {
        fontSize: '18@ms',
        fontWeight: '700',
        color: '#0F172A',
        marginBottom: '8@vs',
        textAlign: 'center',
    },
    modalMessage: {
        fontSize: '14@ms',
        color: '#64748B',
        textAlign: 'center',
        lineHeight: '20@ms',
        marginBottom: '24@vs',
    },
});
