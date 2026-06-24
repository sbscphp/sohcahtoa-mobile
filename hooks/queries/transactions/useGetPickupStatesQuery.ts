import { getPickupStates } from '@/services/transactions';
import { useQuery } from '@tanstack/react-query';
import { LocationItem } from '@/utils/locations';

export const useGetPickupStatesQuery = () => {
    return useQuery({
        queryKey: ['pickupStates'],
        queryFn: getPickupStates,
        select: (response) => {
           
            if (!response.success || !response.data.states) return [];
            return response.data.states.map((state, index) => ({
                title: state,
                id: index.toString(),
            })) as LocationItem[];
        }
    });
};
