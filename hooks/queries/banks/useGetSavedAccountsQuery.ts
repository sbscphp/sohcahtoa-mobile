import { useQuery } from '@tanstack/react-query';
import { getSavedAccounts } from '@/services/banks';

export const useGetSavedAccountsQuery = () => {
  return useQuery({
    queryKey: ['savedBankAccounts'],
    queryFn: getSavedAccounts,
    staleTime: 1000 * 60 * 5, // 5 minutes
  });
};
