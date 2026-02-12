import { useToastStore } from '@/stores/useToastStore';
import { useMutation } from '@tanstack/react-query';
import { verifyKyc } from '../../../services/auth';
import { useAuthStore } from '../../../stores/useAuthStore';

export const useVerifyKycMutation = () => {
    const setVerificationToken = useAuthStore((state) => state.setVerificationToken);
    const showToast = useToastStore((state) => state.showToast);

    return useMutation({
        mutationFn: verifyKyc,
        onSuccess: (response) => {
            if (response.success && response.data.verificationToken) {
                setVerificationToken(response.data.verificationToken);
                showToast(response.data.message || 'KYC Verification Successful', 'success');
            }
        },
        onError: (error: any) => {
            const message = error.response?.data?.message || error.message || 'KYC Verification Failed';
            showToast(message, 'error');
        },
    });
};
