import { useToastStore } from '@/stores/useToastStore';
import { useMutation } from '@tanstack/react-query';
import { verifyBvn } from '../../../services/auth';
import { useAuthStore } from '../../../stores/useAuthStore';

export const useVerifyBvnMutation = () => {
    const setVerificationToken = useAuthStore((state) => state.setVerificationToken);
    const showToast = useToastStore((state) => state.showToast);

    return useMutation({
        mutationFn: verifyBvn,
        onSuccess: (response) => {
            if (response.success && response.data.verificationToken) {
                setVerificationToken(response.data.verificationToken);
                showToast(response.data.message || 'BVN Verified Successfully', 'success');
            }
            console.log(response, "response");
        },
        onError: (error: any) => {
            const message = error.response?.data?.message || error.message || 'BVN Verification Failed';
            showToast(message, 'error');
            console.log(error, "error");
        },
    });
};
