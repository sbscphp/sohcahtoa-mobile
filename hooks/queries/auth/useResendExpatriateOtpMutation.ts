import { useToastStore } from '@/stores/useToastStore';
import { useMutation } from '@tanstack/react-query';
import { resendExpatriateOtp } from '../../../services/auth';
import { ResendTouristOtpResponse, SendTouristOtpPayload } from '../../../types/api/auth';

interface UseResendExpatriateOtpMutationOptions {
    onSuccess?: (data: ResendTouristOtpResponse) => void;
    onError?: (error: any) => void;
}

export const useResendExpatriateOtpMutation = (options?: UseResendExpatriateOtpMutationOptions) => {
    const showToast = useToastStore((state) => state.showToast);

    return useMutation({
        mutationFn: (payload: SendTouristOtpPayload) => resendExpatriateOtp(payload),
        onSuccess: (data: ResendTouristOtpResponse) => {
            if (data.success) {
                showToast(data.data.message || 'OTP resent successfully', 'success');
                options?.onSuccess?.(data);
            }
            console.log(data, "RESEND EXPATRIATE OTP SUCCESS");

        },
        onError: (error: any) => {
            const message = error.response?.data?.error?.message || 'Failed to resend OTP';
            showToast(message, 'error');
            options?.onError?.(error);
            // console.log(error.response?.data?.error?.message, "RESEND EXPATRIATE OTP ERROR");
        },
    });
};
