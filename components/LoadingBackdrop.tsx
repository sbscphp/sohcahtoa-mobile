import React from 'react';
import { ActivityIndicator, Modal, Text, View } from 'react-native';
import { ScaledSheet } from 'react-native-size-matters';
import { Colors } from '../constants/theme';

interface LoadingBackdropProps {
    visible: boolean;
    message?: any;
}

const LoadingBackdrop: React.FC<LoadingBackdropProps> = ({ visible, message = 'Please wait...' }) => {
    return (
        <Modal
            transparent
            visible={visible}
            animationType="fade"
        >
            <View style={styles.container}>
                <View style={styles.content}>
                    <ActivityIndicator size="large" color={Colors.light.primary} />
                    {message && <Text style={styles.message}>{message}</Text>}
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
        backgroundColor: '#FFFFFF',
        padding: '32@ms',
        borderRadius: '16@ms',
        alignItems: 'center',
        gap: '16@vs',
        shadowColor: "#000",
        shadowOffset: {
            width: 0,
            height: 2,
        },
        shadowOpacity: 0.25,
        shadowRadius: 3.84,
        elevation: 5,
    },
    message: {
        fontSize: '14@ms',
        fontWeight: '500',
        color: '#0F172A',
        textAlign: 'center',
    },
});

export default LoadingBackdrop;
