import { useToastStore } from '@/stores/useToastStore';
import { useMutation } from '@tanstack/react-query';
import { createAccount } from '../../../services/auth';
import { CreateAccountResponse } from '@/types/api/auth';

export const useCreateAccountMutation = () => {
    const showToast = useToastStore((state) => state.showToast);

    return useMutation({
        mutationFn: createAccount,
        onSuccess: (response: CreateAccountResponse) => {
            if (response.success && response.data) {
                showToast(response.data.message || 'Account Created Successfully', 'success');
            }
        },
        onError: (error: any) => {
            const message = error.response?.data?.error?.message || error.message || 'Account Creation Failed';
            showToast(message, 'error');
        },
    });
};
