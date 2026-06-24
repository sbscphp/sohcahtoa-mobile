import { getPickupCities } from '@/services/transactions';
import { useQuery } from '@tanstack/react-query';
import { LocationItem } from '@/utils/locations';

export const useGetPickupCitiesQuery = (stateTitle?: string) => {
    return useQuery({
        queryKey: ['pickupCities', stateTitle],
        queryFn: () => getPickupCities(stateTitle!),
        enabled: !!stateTitle,
        select: (response) => {
            if (!response.success || !response.data.cities) return [];
            return response.data.cities.map((city, index) => ({
                title: city,
                id: `city-${index}`,
            })) as LocationItem[];
        }
    });
};
