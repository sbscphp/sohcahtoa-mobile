import { useToastStore } from '@/stores/useToastStore';
import { useMutation } from '@tanstack/react-query';
import { createExpatriateAccount } from '../../../services/auth';
import { CreateTouristAccountResponse } from '@/types/api/auth';

export const useCreateExpatriateAccountMutation = () => {
    const showToast = useToastStore((state) => state.showToast);

    return useMutation({
        mutationFn: createExpatriateAccount,
        onSuccess: (response: CreateTouristAccountResponse) => {
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
