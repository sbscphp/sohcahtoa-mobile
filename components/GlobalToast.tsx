import React from 'react';
import { useToastStore } from '../stores/useToastStore';
import Toast from './Toast';

export const GlobalToast = () => {
    const { visible, message, type, persistent, title, duration, action, position, id, hideToast } =
        useToastStore();

    return (
        <Toast
            key={id}
            visible={visible}
            message={message}
            type={type}
            onDismiss={hideToast}
            persistent={persistent}
            title={title}
            duration={duration}
            action={action}
            position={position}
        />
    );
};
