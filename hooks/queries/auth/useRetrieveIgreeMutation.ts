import { useToastStore } from '@/stores/useToastStore';
import { useMutation } from '@tanstack/react-query';
import { retrieveIgree } from '../../../services/auth';
import { useAuthStore } from '../../../stores/useAuthStore';
import { RetrieveIgreeResponse } from '@/types/api/auth';

export const useRetrieveIgreeMutation = () => {
    const setVerificationToken = useAuthStore((state) => state.setVerificationToken);
    const showToast = useToastStore((state) => state.showToast);

    return useMutation({
        mutationFn: retrieveIgree,
        onSuccess: (response: RetrieveIgreeResponse) => {
            if (response.success && response.data?.status === 'COMPLETED' && response.data?.verificationToken) {
                setVerificationToken(response.data.verificationToken);
                if (response.data?.message) {
                    showToast(response.data.message, 'success');
                }
            }
        },
        onError: (error: any) => {
            const message = error.response?.data?.error?.message || error.response?.data?.message || error.message || 'Failed to retrieve KYC details';
            showToast(message, 'error');
        },
    });
};
