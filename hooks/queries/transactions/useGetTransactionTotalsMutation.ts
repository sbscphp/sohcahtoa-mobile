import { useMutation } from '@tanstack/react-query';
import { getTransactionTotals } from '../../../services/transactions';
import { GetTransactionTotalsPayload, GetTransactionTotalsResponse } from '../../../types/api/transactions';

export const useGetTransactionTotalsMutation = () => {
    return useMutation<GetTransactionTotalsResponse, Error, GetTransactionTotalsPayload>({
        mutationFn: (payload: GetTransactionTotalsPayload) => getTransactionTotals(payload),
    });
};
