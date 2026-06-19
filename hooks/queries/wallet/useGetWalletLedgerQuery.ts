import { useQuery } from '@tanstack/react-query';
import { getWalletLedger } from '../../../services/wallet';
import { WalletLedgerParams } from '../../../types/api/wallet';

export const useGetWalletLedgerQuery = (params?: WalletLedgerParams) => {
    return useQuery({
        queryKey: ['walletLedger', params],
        queryFn: () => getWalletLedger(params),
    });
};
