import { useToastStore } from '@/stores/useToastStore';
import { useMutation } from '@tanstack/react-query';
import { submitIgreeCallback } from '../../../services/auth';
import { IgreeCallbackResponse } from '@/types/api/auth';

export const useIgreeCallbackMutation = () => {
    const showToast = useToastStore((state) => state.showToast);

    return useMutation({
        mutationFn: submitIgreeCallback,
        onSuccess: (response: IgreeCallbackResponse) => {
            if (response.success && response.message) {
                showToast(response.message, 'success');
            }
        },
        onError: (error: any) => {
            const message = error.response?.data?.error?.message || error.response?.data?.message || error.message || 'Consent callback submission failed';
            showToast(message, 'error');
        },
    });
};
