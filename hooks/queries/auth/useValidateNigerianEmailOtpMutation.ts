import { useToastStore } from '@/stores/useToastStore';
import { useMutation } from '@tanstack/react-query';
import { validateNigerianEmailOtp } from '../../../services/auth';
import { useRouter } from 'expo-router';

export const useValidateNigerianEmailOtpMutation = () => {
    const showToast = useToastStore((state) => state.showToast);
    const router = useRouter();

    return useMutation({
        mutationFn: validateNigerianEmailOtp,
        onSuccess: (response) => {
            if (response.success && response.data) {
                router.push({
                    pathname: '/(auth)/secure-account',
                });
                showToast(response.data.message || 'Email OTP Validated Successfully', 'success');
            }
            console.log(response, 'Response');
        },
        onError: (error: any) => {
            const message = error.response?.data?.error?.message || error.message || 'Validate Email OTP Failed';
            showToast(message, 'error');
            // console.log(error.response?.data.error.message, 'MessageError');
        },
    });
};
