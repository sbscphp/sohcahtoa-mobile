import { useInfiniteQuery } from '@tanstack/react-query';
import { getTransactions } from '../../../services/transactions';
import { GetTransactionsParams } from '../../../types/api/transactions';

export const useGetTransactionsQuery = (params?: GetTransactionsParams) => {
    return useInfiniteQuery({
        queryKey: ['transactions', params],
        queryFn: ({ pageParam = 1 }) => getTransactions({ ...params, page: pageParam }),
        initialPageParam: 1,
        getNextPageParam: (lastPage) => {
            const current = lastPage?.pagination?.page || 1;
            const total = lastPage?.pagination?.totalPages || 1;
            return current < total ? current + 1 : undefined;
        },
        getPreviousPageParam: (firstPage) => {
            const current = firstPage?.pagination?.page || 1;
            return current > 1 ? current - 1 : undefined;
        }
    });
};
