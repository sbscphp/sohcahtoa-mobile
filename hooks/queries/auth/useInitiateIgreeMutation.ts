import { useToastStore } from '@/stores/useToastStore';
import { useMutation } from '@tanstack/react-query';
import { initiateIgree } from '../../../services/auth';
import { InitiateIgreeResponse } from '@/types/api/auth';

export const useInitiateIgreeMutation = () => {
    const showToast = useToastStore((state) => state.showToast);

    return useMutation({
        mutationFn: initiateIgree,
        onSuccess: (response: InitiateIgreeResponse) => {
            if (response.success && response.data?.message) {
                showToast(response.data.message, 'success');
            }
        },
        onError: (error: any) => {
            const message = error.response?.data?.error?.message || error.response?.data?.message || error.message || 'Failed to initiate iGree consent';
            showToast(message, 'error');
        },
    });
};
