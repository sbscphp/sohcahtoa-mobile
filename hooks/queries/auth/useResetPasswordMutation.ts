import { useToastStore } from '@/stores/useToastStore';
import { useMutation } from '@tanstack/react-query';
import { resetPassword } from '../../../services/auth';

export const useResetPasswordMutation = () => {
    const showToast = useToastStore((state) => state.showToast);

    return useMutation({
        mutationFn: resetPassword,
        onSuccess: (response: any) => {
            if (response.success) {
                showToast(response.data.message || 'Password reset successful', 'success');
            }
            console.log(response);
        },
        onError: (error: any) => {
            const message = error.response?.data?.error?.message || error.message || 'Password reset failed';
            showToast(message, 'error');
            console.log(error.response?.data?.error?.message);
        },
    });
};
