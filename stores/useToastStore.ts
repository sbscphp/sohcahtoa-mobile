import { create } from 'zustand';

type ToastType = 'success' | 'error' | 'warning';

interface ToastState {
    visible: boolean;
    message: string;
    type: ToastType;
    persistent: boolean;
    showToast: (message: string, type?: ToastType, persistent?: boolean) => void;
    hideToast: () => void;
}

export const useToastStore = create<ToastState>((set) => ({
    visible: false,
    message: '',
    type: 'success',
    persistent: false,
    showToast: (message, type = 'success', persistent = false) => set({ visible: true, message, type, persistent }),
    hideToast: () => set({ visible: false }),
}));
