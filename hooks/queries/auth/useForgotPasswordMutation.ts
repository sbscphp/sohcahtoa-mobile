import { useToastStore } from '@/stores/useToastStore';
import { ForgotPasswordResponse } from '@/types/api/auth';
import { useMutation } from '@tanstack/react-query';
import { forgotPassword } from '../../../services/auth';
import { useAuthStore } from '../../../stores/useAuthStore';

export const useForgotPasswordMutation = () => {
    const showToast = useToastStore((state) => state.showToast);
    const setVerificationToken = useAuthStore((state) => state.setVerificationToken);

    return useMutation({
        mutationFn: forgotPassword,
        onSuccess: (response: ForgotPasswordResponse) => {
            if (response.success && response.data) {
                if (response.data.verificationToken) {
                    setVerificationToken(response.data.verificationToken);
                }
                const otpMessage = response.data.otp ? ` (OTP: ${response.data.otp})` : '';
                showToast(`${response.data.message || 'Password reset OTP has been sent'}${otpMessage}`, 'success', true);
            }
            console.log(response);
        },
        onError: (error: any) => {
            const message = error.response?.data?.error?.message || error.message || 'An error occurred';
            showToast(message, 'error');
            console.log(error.response?.data?.error?.message);
        },
    });
};
