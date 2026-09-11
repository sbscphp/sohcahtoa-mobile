import { useMutation } from '@tanstack/react-query';
import { getTransactionReceipt } from '../../../services/transactions';
import { GetTransactionReceiptResponse } from '../../../types/api/transactions';

export const useGetTransactionReceiptMutation = () => {
    return useMutation<GetTransactionReceiptResponse, any, string>({
        mutationFn: (transactionId: string) => getTransactionReceipt(transactionId),
    });
};
