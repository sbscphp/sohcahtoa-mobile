import { useToastStore } from '@/stores/useToastStore';
import { useMutation } from '@tanstack/react-query';
import { validateTouristOtp } from '../../../services/auth';
import { useAuthStore } from '../../../stores/useAuthStore';
import { ValidateTouristOtpResponse } from '@/types/api/auth';

export const useValidateTouristOtpMutation = () => {
    const setUser = useAuthStore((state) => state.setUser);
    const showToast = useToastStore((state) => state.showToast);

    return useMutation({
        mutationFn: validateTouristOtp,
        onSuccess: (response: ValidateTouristOtpResponse) => {
            if (response.success && response.data) {
                setUser({
                    firstName: response.data.firstName,
                    lastName: response.data.lastName,
                    dateOfBirth: response.data.dateOfBirth,
                    nationality: response.data.nationality,
                });
                showToast(response.data.message || 'OTP Validated Successfully', 'success');
            }
            console.log(response)
        },
        onError: (error: any) => {
            const message = error.response?.data?.error?.message || error.message || 'Validate OTP Failed';
            showToast(message, 'error');
        },
    });
};
