import { useQuery } from '@tanstack/react-query';
import { getTransactionById } from '../../../services/transactions';

export const useGetTransactionByIdQuery = (transactionId: string) => {
    return useQuery({
        queryKey: ['transaction', transactionId],
        queryFn: () => getTransactionById(transactionId),
        enabled: !!transactionId,
    });
};
