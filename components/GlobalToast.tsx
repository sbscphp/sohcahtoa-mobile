import React from 'react';
import { useToastStore } from '../stores/useToastStore';
import Toast from './Toast';

export const GlobalToast = () => {
    const { visible, message, type, hideToast } = useToastStore();

    return (
        <Toast
            visible={visible}
            message={message}
            type={type}
            onDismiss={hideToast}
        />
    );
};
