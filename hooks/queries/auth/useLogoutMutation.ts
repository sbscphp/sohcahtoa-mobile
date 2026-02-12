import { useToastStore } from '@/stores/useToastStore';
import { useMutation } from '@tanstack/react-query';
import { logoutUser } from '../../../services/auth';
import { useAuthStore } from '../../../stores/useAuthStore';

export const useLogoutMutation = () => {
    const logout = useAuthStore((state) => state.logout);
    const refreshToken = useAuthStore((state) => state.refreshToken);
    const showToast = useToastStore((state) => state.showToast);

    return useMutation({
        mutationFn: () => logoutUser({ refreshToken: refreshToken || '' }),
        onSuccess: (response) => {
            if (response.success) {
                logout();
                showToast(response.data.message || 'Logged out successfully', 'success');
            }
        },
        onError: (error: any) => {
            const message = error.response?.data?.message || error.message || 'Logout Failed';
            showToast(message, 'error');
            // Proactive state clearing even on failure to ensure user is logged out locally
            logout();
        },
    });
};
