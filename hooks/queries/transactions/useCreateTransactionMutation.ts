import { useToastStore } from '@/stores/useToastStore';
import { useMutation } from '@tanstack/react-query';
import { createTransaction } from '../../../services/transactions';

export const useCreateTransactionMutation = () => {
    const showToast = useToastStore((state) => state.showToast);

    return useMutation({
        mutationFn: createTransaction,
        onSuccess: (response) => {
            if (response.success && response.data) {
                showToast(response.data.message || 'Transaction initiated successfully', 'success');
            }
        },
        onError: (error: any) => {
            const errorMessage = error.response?.data?.message || 'Failed to initiate transaction';
            showToast(errorMessage, 'error');
        },
    });
};
