import { useQuery } from '@tanstack/react-query';
import { getBanks } from '@/services/banks';

export const useGetBanksQuery = () => {
  return useQuery({
    queryKey: ['banks'],
    queryFn: getBanks,
  });
};
