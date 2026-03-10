import PrimaryButton from '@/components/PrimaryButton';
import React from 'react';
import { Image, Modal, Text, View } from 'react-native';
import { ScaledSheet } from 'react-native-size-matters';

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
    return (
        <Modal
            visible={visible}
            transparent={true}
            animationType="fade"
            onRequestClose={onClose}
        >
            <View style={styles.overlay}>
                <View style={styles.dialogContainer}>
                    <View style={styles.iconContainer}>
                        <Image source={require('../assets/icons/success.gif')} style={styles.icon} />
                    </View>

                    <Text style={styles.title}>{title}</Text>
                    <Text style={styles.description}>{description}</Text>

                    <View style={styles.footer}>
                        <PrimaryButton title={primaryButtonText} onPress={onClose} />
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
        justifyContent: 'center',
        alignItems: 'center',
        paddingHorizontal: '20@s',
        zIndex: 999
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
