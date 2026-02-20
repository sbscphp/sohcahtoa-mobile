import React from 'react';
import { ActivityIndicator, Modal,View } from 'react-native';
import { ScaledSheet } from 'react-native-size-matters';
import { Colors } from '../constants/theme';

interface LoadingBackdropProps {
    visible: boolean;
}

const LoadingBackdrop: React.FC<LoadingBackdropProps> = ({ visible }) => {
    return (
        <Modal
            transparent
            visible={visible}
            animationType="fade"
        >
            <View style={styles.container}>
                <View style={styles.content}>
                    <ActivityIndicator size="large" color={Colors.light.primary} />
                </View>
            </View>
        </Modal>
    );
};

const styles = ScaledSheet.create({
    container: {
        flex: 1,
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
        justifyContent: 'center',
        alignItems: 'center',
    },
    content: {
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
        padding: '32@ms',
        borderRadius: '16@ms',
        alignItems: 'center',
        gap: '16@vs',
    },
    message: {
        fontSize: '14@ms',
        fontWeight: '500',
        color: '#0F172A',
        textAlign: 'center',
    },
});

export default LoadingBackdrop;
