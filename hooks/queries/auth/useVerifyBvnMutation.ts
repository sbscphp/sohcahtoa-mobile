import { useToastStore } from '@/stores/useToastStore';
import { useMutation } from '@tanstack/react-query';
import { verifyBvn } from '../../../services/auth';
import { useAuthStore } from '../../../stores/useAuthStore';
import { VerifyBvnResponse } from '@/types/api/auth';

export const useVerifyBvnMutation = () => {
    const setVerificationToken = useAuthStore((state) => state.setVerificationToken);
    const showToast = useToastStore((state) => state.showToast);

    return useMutation({
        mutationFn: verifyBvn,
        onSuccess: (response: VerifyBvnResponse) => {
            if (response.success && response.data.verificationToken) {
                setVerificationToken(response.data.verificationToken);
                const otpMessage = (response.data as any).otp ? ` (OTP: ${(response.data as any).otp})` : '';
                showToast(`${response.data.message || 'BVN Verified Successfully'}${otpMessage}`, 'success', true);
            }
            console.log(response, "response");
        },
        onError: (error: any) => {
            const message = error.response?.data?.error?.message || error.message || 'BVN Verification Failed';
            showToast(message, 'error');
            console.log(error, "error");
        },
    });
};
