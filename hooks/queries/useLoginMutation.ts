import { useMutation } from '@tanstack/react-query';
import { loginUser } from '../../services/auth';
import { useAuthStore } from '../../stores/useAuthStore';

// Custom Hook
export const useLoginMutation = () => {
    const setToken = useAuthStore((state) => state.setToken);
    const setUser = useAuthStore((state) => state.setUser);

    return useMutation({
        mutationFn: loginUser,
        onSuccess: (data) => {
            // Update Global State on Success
            setToken(data.token);
            setUser(data.user);
            console.log('Login Successful:', data.user.name);
        },
        onError: (error: any) => {
            console.error('Login Failed:', error.response?.data?.message || error.message);
        },
    });
};
