import { useToastStore } from '@/stores/useToastStore';
import { useMutation } from '@tanstack/react-query';
import { logoutUser } from '../../../services/auth';
import { useAuthStore } from '../../../stores/useAuthStore';
import { LogoutResponse } from '@/types/api/auth';

export const useLogoutMutation = () => {
    const logout = useAuthStore((state) => state.logout);
    const refreshToken = useAuthStore((state) => state.refreshToken);
    const showToast = useToastStore((state) => state.showToast);

    return useMutation({
        mutationFn: () => logoutUser({ refreshToken: refreshToken || '' }),
        onSuccess: (response: LogoutResponse) => {
            if (response.success) {
                logout();
                showToast(response.data.message || 'Logged out successfully', 'success');
            }
        },
        onError: (error: any) => {
            const message = error.response?.data?.error?.message || error.message || 'Logout Failed';
            showToast(message, 'error');
        },
    });
};
