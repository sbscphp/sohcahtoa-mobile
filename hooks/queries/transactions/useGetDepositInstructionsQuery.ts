import { useQuery } from '@tanstack/react-query';
import { getDepositInstructions } from '../../../services/transactions';

export const useGetDepositInstructionsQuery = (transactionId: string) => {
    return useQuery({
        queryKey: ['transaction', transactionId, 'deposit-instructions'],
        queryFn: () => getDepositInstructions(transactionId),
        enabled: !!transactionId,
    });
};
