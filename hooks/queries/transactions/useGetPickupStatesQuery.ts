import { getPickupStates } from '@/services/transactions';
import { useQuery } from '@tanstack/react-query';

export const useGetPickupStatesQuery = () => {
    return useQuery({
        queryKey: ['pickupStates'],
        queryFn: getPickupStates,
    });
};
