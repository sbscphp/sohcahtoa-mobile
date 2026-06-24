import { useQuery } from '@tanstack/react-query';
import { getBanks, GetBanksParams } from '@/services/banks';

export const useGetBanksQuery = (params?: GetBanksParams) => {
  return useQuery({
    queryKey: ['banks', params?.q ?? ''],
    queryFn: () => getBanks(params),
  });
};
