import { useToastStore } from '@/stores/useToastStore';
import { SendEmailOtpResponse } from '@/types/api/auth';
import { useMutation } from '@tanstack/react-query';
import { sendNigerianEmailOtp } from '../../../services/auth';

export const useSendNigerianEmailOtpMutation = () => {
    const showToast = useToastStore((state) => state.showToast);

    return useMutation({
        mutationFn: sendNigerianEmailOtp,
        onSuccess: (response: SendEmailOtpResponse) => {
            if (response.success && response.data) {
                const otpMessage = response.data.otp ? ` (OTP: ${response.data.otp})` : '';
                showToast(`${response.data.message || 'OTP sent successfully to your email'}${otpMessage}`, 'success', true);
            }
            console.log(response, "NIGERIAN");
        },
        onError: (error: any) => {
            const message = error.response?.data?.error?.message || error.message || 'Failed to send OTP';
            showToast(message, 'error');
            console.log(error.response?.data, "NIGERIAN ERROR");
        },
    });
};
