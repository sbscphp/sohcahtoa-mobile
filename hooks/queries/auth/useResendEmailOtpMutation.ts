import { useToastStore } from '@/stores/useToastStore';
import { useMutation } from '@tanstack/react-query';
import { resendEmailOtp } from '../../../services/auth';
import { ResendEmailOtpPayload, ResendEmailOtpResponse } from '../../../types/api/auth';

interface UseResendEmailOtpMutationOptions {
    onSuccess?: (data: ResendEmailOtpResponse) => void;
    onError?: (error: any) => void;
}

export const useResendEmailOtpMutation = (options?: UseResendEmailOtpMutationOptions) => {
    const showToast = useToastStore((state) => state.showToast);

    return useMutation({
        mutationFn: (payload: ResendEmailOtpPayload) => resendEmailOtp(payload),
        onSuccess: (data) => {
            if (data.success) {
                showToast(data.data.message || 'Email OTP resent successfully', 'success');
                options?.onSuccess?.(data);
            }
            // console.log(data, "RESEND EMAIL OTP SUCCESS");

        },
        onError: (error: any) => {
            const message = error.response?.data?.error?.message || 'Failed to resend Email OTP';
            showToast(message, 'error');
            options?.onError?.(error);
            // console.log(error.response?.data?.error?.message, "RESEND EMAIL OTP ERROR");
        },
    });
};
