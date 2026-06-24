import { useQuery } from '@tanstack/react-query';
import { getVirtualAccount } from '../../../services/transactions';

export const useGetVirtualAccountQuery = (transactionId: string) => {
    return useQuery({
        queryKey: ['transaction', transactionId, 'virtual-account'],
        queryFn: () => getVirtualAccount(transactionId),
        enabled: !!transactionId,
    });
};
