import { useQuery } from '@tanstack/react-query';
import { getTransactionStats } from '../../../services/transactions';
import { GetTransactionStatsParams } from '../../../types/api/transactions';

export const useGetTransactionStatsQuery = (params?: GetTransactionStatsParams) => {
    return useQuery({
        queryKey: ['transactionStats', params],
        queryFn: () => getTransactionStats(params),
    });
};
