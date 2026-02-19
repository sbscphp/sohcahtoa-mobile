import { useToastStore } from '@/stores/useToastStore';
import { useMutation } from '@tanstack/react-query';
import { sendTouristOtp } from '../../../services/auth';
import { useAuthStore } from '../../../stores/useAuthStore';

export const useSendTouristOtpMutation = () => {
    const setUser = useAuthStore((state) => state.setUser);
    const setVerificationToken = useAuthStore((state) => state.setVerificationToken);
    const showToast = useToastStore((state) => state.showToast);

    return useMutation({
        mutationFn: sendTouristOtp,
        onSuccess: (response) => {
            if (response.success && response.data) {
                if ((response.data as any).verificationToken) {
                    setVerificationToken((response.data as any).verificationToken);
                }
                setUser({
                    firstName: response.data.firstName,
                    lastName: response.data.lastName,
                    dateOfBirth: response.data.dateOfBirth,
                    nationality: response.data.nationality,
                });
                showToast(response.data.message || 'OTP Sent Successfully', 'success');
            }
            // console.log(response, "response");
        },
        onError: (error: any) => {
            const message = error.response?.data?.error?.message || error.message || 'Send OTP Failed';
            showToast(message, 'error');
        },
    });
};
