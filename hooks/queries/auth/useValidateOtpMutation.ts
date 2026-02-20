import { useToastStore } from '@/stores/useToastStore';
import { useMutation } from '@tanstack/react-query';
import { validateOtp } from '../../../services/auth';
import { useAuthStore } from '../../../stores/useAuthStore';

export const useValidateOtpMutation = () => {
    const setUser = useAuthStore((state) => state.setUser);
    const showToast = useToastStore((state) => state.showToast);

    return useMutation({
        mutationFn: validateOtp,
        onSuccess: (response) => {
            if (response.success && response.data) {
                setUser({
                    firstName: response.data.firstName,
                    lastName: response.data.lastName,
                    dateOfBirth: response.data.dateOfBirth,
                    gender: response.data.gender,
                });
                showToast(response.data.message || 'OTP Validated Successfully', 'success');
            }

            // console.log(response, 'Response');
        },
        onError: (error: any) => {
            const message = error.response?.data?.error?.message || error.message || 'Validate OTP Failed';
            showToast(message, 'error');
            // console.log(error.response?.data.error.message, 'MessageError');
            // console.log(error, 'Error');
        },
    });
};
