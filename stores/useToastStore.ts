import { create } from 'zustand';

export type ToastType = 'success' | 'error' | 'warning';

export interface ToastAction {
    label: string;
    onPress: () => void;
}

export interface ToastOptions {
    type?: ToastType;
    persistent?: boolean;
    title?: string;
    duration?: number;
    action?: ToastAction;
    position?: 'bottom' | 'top';
}

export interface ToastState {
    visible: boolean;
    message: string;
    type: ToastType;
    persistent: boolean;
    title?: string;
    duration?: number;
    action?: ToastAction;
    position: 'bottom' | 'top';
    id: number;
    showToast: (
        message: string,
        typeOrOptions?: ToastType | ToastOptions,
        persistent?: boolean,
        title?: string,
        duration?: number,
        action?: ToastAction
    ) => void;
    hideToast: () => void;
}

export const useToastStore = create<ToastState>((set) => ({
    visible: false,
    message: '',
    type: 'success',
    persistent: false,
    title: undefined,
    duration: undefined,
    action: undefined,
    position: 'top',
    id: 0,
    showToast: (message, typeOrOptions = 'success', persistent = false, title, duration, action) => {
        if (typeof typeOrOptions === 'object' && typeOrOptions !== null) {
            set({
                visible: true,
                message,
                type: typeOrOptions.type || 'success',
                persistent: typeOrOptions.persistent ?? false,
                title: typeOrOptions.title,
                duration: typeOrOptions.duration,
                action: typeOrOptions.action,
                position: typeOrOptions.position || 'top',
                id: Date.now(),
            });
            return;
        }

        set({
            visible: true,
            message,
            type: typeOrOptions,
            persistent,
            title,
            duration,
            action,
            position: 'top',
            id: Date.now(),
        });
    },
    hideToast: () => set({ visible: false }),
}));
