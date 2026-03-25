import { useToastStore } from '@/stores/useToastStore';
import { useMutation } from '@tanstack/react-query';
import { createTransaction } from '../../../services/transactions';
import { CreateTransactionPayload, CreateTransactionResponse } from '../../../types/api/transactions';

export const useCreateTransactionMutation = () => {
    const showToast = useToastStore((state) => state.showToast);

    return useMutation<CreateTransactionResponse, any, CreateTransactionPayload>({
        mutationFn: createTransaction,
        onSuccess: (response: CreateTransactionResponse) => {
            if (response.success && response.data) {
                showToast(response.data.message || 'Transaction initiated successfully', 'success');
            }
            console.log(response,"TRANSACTION");
        },
        onError: (error: any) => {
            const message = error.response?.data?.error?.message || 'Failed to initiate transaction';
            showToast(message, 'error');

            console.log(error.response.data?.error)

        },
    });
};
