import { useToastStore } from '@/stores/useToastStore';
import { useMutation } from '@tanstack/react-query';
import { getTransactionReceipt } from '../../../services/transactions';
import { GetTransactionReceiptResponse } from '../../../types/api/transactions';

export const useGetTransactionReceiptMutation = () => {
    const showToast = useToastStore((state) => state.showToast);

    return useMutation<GetTransactionReceiptResponse, any, string>({
        mutationFn: (transactionId: string) => getTransactionReceipt(transactionId),
        onError: (error: any) => {
            console.log(" ERROR IN RECEIPT MUATION", error)
            const message =
                error?.response?.data?.message ||
                error?.response?.data?.error?.message ||
                error?.message;
            if (message) {
                showToast(message, 'error');
            }
            console.log(error);
        },
    });
};

