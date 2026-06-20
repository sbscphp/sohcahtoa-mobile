import { useInfiniteQuery } from '@tanstack/react-query';
import { getWalletLedger } from '../../../services/wallet';
import { WalletLedgerParams } from '../../../types/api/wallet';

export const useGetWalletLedgerQuery = (params?: WalletLedgerParams) => {
    return useInfiniteQuery({
        queryKey: ['walletLedger', params],
        queryFn: ({ pageParam = 1 }) => getWalletLedger({ ...params, page: pageParam }),
        initialPageParam: 1,
        getNextPageParam: (lastPage) => {
            const current = lastPage?.meta?.page || 1;
            const total = lastPage?.meta?.totalPages || 1;
            return current < total ? current + 1 : undefined;
        },
        getPreviousPageParam: (firstPage) => {
            const current = firstPage?.meta?.page || 1;
            return current > 1 ? current - 1 : undefined;
        }
    });
};
