import { useToastStore } from '@/stores/useToastStore';
import { ValidateForgotPasswordOtpResponse } from '@/types/api/auth';
import { useMutation } from '@tanstack/react-query';
import { validateForgotPasswordOtp } from '../../../services/auth';
import { useAuthStore } from '../../../stores/useAuthStore';

export const useValidateForgotPasswordOtpMutation = () => {
    const showToast = useToastStore((state) => state.showToast);
    const setVerificationToken = useAuthStore((state) => state.setVerificationToken);

    return useMutation({
        mutationFn: validateForgotPasswordOtp,
        onSuccess: (response: ValidateForgotPasswordOtpResponse) => {
            if (response.success && response.data) {
                if (response.data.verificationToken) {
                    setVerificationToken(response.data.verificationToken);
                }
                showToast(response.data.message || 'OTP validated successfully', 'success');
            }
            console.log(response);
        },
        onError: (error: any) => {
            const message = error.response?.data?.error?.message || error.message || 'OTP validation failed';
            showToast(message, 'error');
            console.log(error.response?.data?.error?.message);
        },
    });
};
