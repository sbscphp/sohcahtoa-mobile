import { useToastStore } from '../../../stores/useToastStore';
import { useMutation } from '@tanstack/react-query';
import { loginUser } from '../../../services/auth';
import { useAuthStore } from '../../../stores/useAuthStore';
import { saveCredentials } from '../../../utils/biometrics';
import { LoginResponse } from '../../../types/api/auth';
import { LoginFormData } from '../../../lib/validations/auth';


export const useLoginMutation = () => {
    const setAuth = useAuthStore((state) => state.setAuth);
    const showToast = useToastStore((state) => state.showToast);

    return useMutation({
        mutationFn: loginUser,
        onSuccess: (response: LoginResponse, variables: LoginFormData) => {
            if (response.success && response.data) {
                setAuth(
                    response.data.accessToken,
                    response.data.refreshToken,
                    response.data.user
                );

                // Save credentials for biometrics if enabled or a preference is set
                const isBiometricEnabled = useAuthStore.getState().isBiometricEnabled;
                const biometricType = useAuthStore.getState().biometricType;
                const checkCredentials = useAuthStore.getState().checkCredentials;
                
                if (isBiometricEnabled || biometricType) {
                    saveCredentials(variables.email, variables.password).then(() => {
                        checkCredentials();
                    });
                }

                showToast('Login Successful!', 'success');
            }
        },

        onError: (error: any) => {
            const message = error.response?.data?.error?.message || error.message || 'Login Failed';
            showToast(message, 'error');
            // console.log(error.response.data.error.message);
        },
    });
};
