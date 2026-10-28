import React from 'react';
import { Modal, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { ScaledSheet, moderateScale } from 'react-native-size-matters';
import { Warning2 } from 'iconsax-react-nativejs';
import PrimaryButton from '@/components/PrimaryButton';
import { useAppTheme } from '@/hooks/useAppTheme';

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
    const { colors, isDark } = useAppTheme();

    return (
        <Modal
            transparent
            visible={visible}
            animationType="fade"
            onRequestClose={onClose}
        >
            <View style={styles.modalOverlay}>
                <TouchableOpacity
                    style={[StyleSheet.absoluteFill, { backgroundColor: 'transparent' }]}
                    onPress={onClose}
                    activeOpacity={1}
                />
                <View style={[styles.modalContent, { backgroundColor: colors.card, borderColor: colors.border, borderWidth: isDark ? 1 : 0 }]}>
                    <View style={[styles.warningIconContainer, isDark && { backgroundColor: 'rgba(239, 68, 68, 0.15)' }]}>
                        <Warning2 size={moderateScale(24)} color="#EF4444" variant="Bold" />
                    </View>
                    <Text style={[styles.modalTitle, { color: colors.text }]}>Delete Bank Account</Text>
                    <Text style={[styles.modalMessage, { color: colors.textMuted }]}>
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
                        style={{ backgroundColor: isDark ? colors.surfaceHighlight : '#F1F5F9' }}
                        textStyle={{ color: colors.text }}
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
