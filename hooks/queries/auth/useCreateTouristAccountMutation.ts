import { useToastStore } from '@/stores/useToastStore';
import { useMutation } from '@tanstack/react-query';
import { createTouristAccount } from '../../../services/auth';
import { CreateTouristAccountResponse } from '@/types/api/auth';

export const useCreateTouristAccountMutation = () => {
    const showToast = useToastStore((state) => state.showToast);

    return useMutation({
        mutationFn: createTouristAccount,
        onSuccess: (response: CreateTouristAccountResponse) => {
            if (response.success && response.data) {
                showToast(response.data.message || 'Account Created Successfully', 'success');
            }
            console.log(response, "response");
        },
        onError: (error: any) => {
            const message = error.response?.data?.error?.message || error.message || 'Account Creation Failed';
            showToast(message, 'error');
            // console.log(error.response.data, "error");
        },
    });
};
