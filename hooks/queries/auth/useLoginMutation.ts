import { useToastStore } from '@/stores/useToastStore';
import { useMutation } from '@tanstack/react-query';
import { loginUser } from '../../../services/auth';
import { useAuthStore } from '../../../stores/useAuthStore';


export const useLoginMutation = () => {
    const setToken = useAuthStore((state) => state.setToken);
    const setRefreshToken = useAuthStore((state) => state.setRefreshToken);
    const setUser = useAuthStore((state) => state.setUser);
    const showToast = useToastStore((state) => state.showToast);

    return useMutation({
        mutationFn: loginUser,
        onSuccess: (response) => {
            if (response.success && response.data) {
                setToken(response.data.accessToken);
                setRefreshToken(response.data.refreshToken);
                setUser(response.data.user);

                showToast('Login Successful!', 'success');
            }
            console.log(response,"LOGIN");
        },

        onError: (error: any) => {
            const message = error.response?.data?.error?.message || error.message || 'Login Failed';
            showToast(message, 'error');
            console.log(error.response.data.error.message);
        },
    });
};
