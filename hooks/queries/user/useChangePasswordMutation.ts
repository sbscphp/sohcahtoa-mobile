import { useToastStore } from '@/stores/useToastStore';
import { useMutation } from '@tanstack/react-query';
import { changePassword } from '../../../services/users';

export const useChangePasswordMutation = () => {
    const showToast = useToastStore((state) => state.showToast);

    return useMutation({
        mutationFn: changePassword,
        onSuccess: (response: any) => {
            if (response.success) {
                showToast(response.data?.message || 'Password changed successfully', 'success');
            }
        },
        onError: (error: any) => {
            const message = error.response?.data?.error?.message || error.message || 'Password change failed';
            showToast(message, 'error');
        },
    });
};
