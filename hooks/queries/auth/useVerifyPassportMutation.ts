import { useToastStore } from '@/stores/useToastStore';
import { useMutation } from '@tanstack/react-query';
import { verifyPassport } from '../../../services/auth';
import { useAuthStore } from '../../../stores/useAuthStore';

export const useVerifyPassportMutation = () => {
    const setVerificationToken = useAuthStore((state) => state.setVerificationToken);
    const showToast = useToastStore((state) => state.showToast);

    return useMutation({
        mutationFn: verifyPassport,
        onSuccess: (response) => {
            if (response.success && response.data.verificationToken) {
                setVerificationToken(response.data.verificationToken);
                showToast(response.data.message || 'Passport Verified Successfully', 'success');
            }
            console.log(response, 'Response');
        },
        onError: (error: any) => {
            const message = error.response?.data?.error?.message || error.message || 'Passport Verification Failed';
            showToast(message, 'error');
        },
    });
};
