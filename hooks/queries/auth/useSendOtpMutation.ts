import { useToastStore } from '@/stores/useToastStore';
import { useMutation } from '@tanstack/react-query';
import { sendOtp } from '../../../services/auth';
import { useAuthStore } from '../../../stores/useAuthStore';

export const useSendOtpMutation = () => {
    const setUser = useAuthStore((state) => state.setUser);
    const showToast = useToastStore((state) => state.showToast);

    return useMutation({
        mutationFn: sendOtp,
        onSuccess: (response) => {
            if (response.success && response.data) {
                setUser({
                    firstName: response.data.firstName,
                    lastName: response.data.lastName,
                    dateOfBirth: response.data.dateOfBirth,
                    gender: response.data.gender,
                });
                showToast(response.data.message || 'OTP Sent Successfully', 'success');
            }
            console.log(response, "response");
        },
        onError: (error: any) => {
            const message = error.response?.data?.message || error.message || 'Send OTP Failed';
            showToast(message, 'error');
            console.log(error, "error");
        },
    });
};
