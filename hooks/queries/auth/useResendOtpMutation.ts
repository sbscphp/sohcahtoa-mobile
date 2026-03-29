import { useToastStore } from '@/stores/useToastStore';
import { useMutation } from '@tanstack/react-query';
import { resendOtp } from '../../../services/auth';
import { ResendOtpPayload, ResendOtpResponse } from '../../../types/api/auth';

interface UseResendOtpMutationOptions {
    onSuccess?: (data: ResendOtpResponse) => void;
    onError?: (error: any) => void;
}

export const useResendOtpMutation = (options?: UseResendOtpMutationOptions) => {
    const showToast = useToastStore((state) => state.showToast);

    return useMutation({
        mutationFn: (payload: ResendOtpPayload) => resendOtp(payload),
        onSuccess: (data: ResendOtpResponse) => {
            if (data.success) {
                const otpMessage = data.data.otp ? ` (OTP: ${data.data.otp})` : '';
                showToast(`${data.data.message || 'OTP resent successfully'}${otpMessage}`, 'success', true);
                options?.onSuccess?.(data);
            }
            console.log(data, "RESEND OTP SUCCESS");

        },
        onError: (error: any) => {
            const message = error.response?.data?.error?.message || 'Failed to resend OTP';
            showToast(message, 'error');
            options?.onError?.(error);
            // console.log(error.response?.data?.error?.message, "RESEND OTP ERROR");
        },
    });
};
