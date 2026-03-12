import { useQuery } from '@tanstack/react-query';
import { getExchangeRates } from '../../../services/transactions';
import { GetExchangeRatesParams } from '../../../types/api/transactions';

export const useGetExchangeRatesQuery = (params?: GetExchangeRatesParams) => {
    return useQuery({
        queryKey: ['exchangeRates', params],
        queryFn: () => getExchangeRates(params),
    });
};
