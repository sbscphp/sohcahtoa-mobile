import { useQuery } from '@tanstack/react-query';
import { getPickupPoints } from '../../../services/transactions';
import { LocationItem } from '@/utils/locations';

export const useGetPickupPointsQuery = () => {
    return useQuery({
        queryKey: ['pickupPoints'],
        queryFn: getPickupPoints,
        select: (response) => {
            if (!response.success || !response.data) return [];
            return response.data.map((point) => ({
                id: point.id,
                title: point.name,
                subtitle: `${point.address}${point.branch ? `, ${point.branch}` : ''}`,
                // We keep original data for filtering in component if needed
                metadata: point 
            })) as LocationItem[];
        }
    });
};
