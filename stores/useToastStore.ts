import { create } from 'zustand';

type ToastType = 'success' | 'error' | 'warning';

interface ToastState {
    visible: boolean;
    message: string;
    type: ToastType;
    showToast: (message: string, type?: ToastType) => void;
    hideToast: () => void;
}

export const useToastStore = create<ToastState>((set) => ({
    visible: false,
    message: '',
    type: 'success',
    showToast: (message, type = 'success') => set({ visible: true, message, type }),
    hideToast: () => set({ visible: false }),
}));
