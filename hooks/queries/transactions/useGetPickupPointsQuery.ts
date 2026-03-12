import { useQuery } from '@tanstack/react-query';
import { getPickupPoints } from '../../../services/transactions';

export const useGetPickupPointsQuery = () => {
    return useQuery({
        queryKey: ['pickupPoints'],
        queryFn: getPickupPoints,
    });
};
