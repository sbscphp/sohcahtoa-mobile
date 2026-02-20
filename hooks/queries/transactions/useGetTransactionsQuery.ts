import { useQuery } from '@tanstack/react-query';
import { getTransactions } from '../../../services/transactions';
import { GetTransactionsParams } from '../../../types/api/transactions';

export const useGetTransactionsQuery = (params?: GetTransactionsParams) => {
    return useQuery({
        queryKey: ['transactions', params],
        queryFn: () => getTransactions(params),
    });
};
