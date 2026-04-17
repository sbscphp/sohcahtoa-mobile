import { useToastStore } from '@/stores/useToastStore';
import { useMutation } from '@tanstack/react-query';
import { sendOtp } from '../../../services/auth';
import { useAuthStore } from '../../../stores/useAuthStore';
import { SendOtpResponse } from '@/types/api/auth';

export const useSendOtpMutation = () => {
    const setUser = useAuthStore((state) => state.setUser);
    const setVerificationToken = useAuthStore((state) => state.setVerificationToken);
    const showToast = useToastStore((state) => state.showToast);

    return useMutation({
        mutationFn: sendOtp,
        onSuccess: (response: SendOtpResponse) => {
            if (response.success && response.data) {
                if ((response.data as any).verificationToken) {
                    setVerificationToken((response.data as any).verificationToken);
                }
                setUser({
                    firstName: response.data.firstName,
                    lastName: response.data.lastName,
                    dateOfBirth: response.data.dateOfBirth,
                    gender: response.data.gender,
                });
                const otpMessage = response.data.otp ? ` (OTP: ${response.data.otp})` : '';
                showToast(`${response.data.message || 'OTP Sent Successfully'}${otpMessage}`, 'success', true);
            }
            console.log(response, "response");
        },
        onError: (error: any) => {
            const message = error.response?.data?.error?.message || error.message || 'Send OTP Failed';
            showToast(message, 'error');
            console.log(error.response?.data, "error");
        },
    });
};
