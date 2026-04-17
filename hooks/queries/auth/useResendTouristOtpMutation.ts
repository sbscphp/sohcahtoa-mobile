import { useToastStore } from '@/stores/useToastStore';
import { useMutation } from '@tanstack/react-query';
import { resendTouristOtp } from '../../../services/auth';
import { ResendTouristOtpResponse, SendTouristOtpPayload } from '../../../types/api/auth';

interface UseResendTouristOtpMutationOptions {
    onSuccess?: (data: ResendTouristOtpResponse) => void;
    onError?: (error: any) => void;
}

export const useResendTouristOtpMutation = (options?: UseResendTouristOtpMutationOptions) => {
    const showToast = useToastStore((state) => state.showToast);

    return useMutation({
        mutationFn: (payload: SendTouristOtpPayload) => resendTouristOtp(payload),
        onSuccess: (data: ResendTouristOtpResponse) => {
            if (data.success) {
                const otpMessage = data.data.otp ? ` (OTP: ${data.data.otp})` : '';
                showToast(`${data.data.message || 'OTP resent successfully'}${otpMessage}`, 'success', true);
                options?.onSuccess?.(data);
            }
            console.log(data, "RESEND TOURIST OTP SUCCESS");

        },
        onError: (error: any) => {
            const message = error.response?.data?.error?.message || 'Failed to resend OTP';
            showToast(message, 'error');
            options?.onError?.(error);
            // console.log(error.response?.data?.error?.message, "RESEND TOURIST OTP ERROR");
        },
    });
};
