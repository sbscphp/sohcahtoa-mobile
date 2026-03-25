import { useMutation } from '@tanstack/react-query';
import { refreshTokens } from '../../../services/auth';
import { useAuthStore } from '../../../stores/useAuthStore';
import { RefreshResponse } from '@/types/api/auth';

export const useRefreshMutation = () => {
    const setToken = useAuthStore((state) => state.setToken);

    return useMutation({
        mutationFn: refreshTokens,
        onSuccess: (response: RefreshResponse) => {
            if (response.success && response.data) {
                setToken(response.data.accessToken);
            }
        },
        onError: (error: any) => {
            console.error('Token Refresh Failed:', error.response?.data?.message || error.message);
        },
    });
};
