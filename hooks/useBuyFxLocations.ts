import { useMemo } from 'react';
import { useGetPickupStatesQuery } from '@/hooks/queries/transactions/useGetPickupStatesQuery';
import { useGetPickupPointsQuery } from '@/hooks/queries/transactions/useGetPickupPointsQuery';
import { useGetPickupCitiesQuery } from '@/hooks/queries/transactions/useGetPickupCitiesQuery';
import { LocationItem } from '@/utils/locations';

export function useBuyFxLocations(
    selectedState?: LocationItem | null,
    selectedCity?: LocationItem | null
) {
    const { data: states = [] } = useGetPickupStatesQuery();
    const { data: allLocations = [] } = useGetPickupPointsQuery();
    const { data: filteredCities = [] } = useGetPickupCitiesQuery(selectedState?.title);

    const filteredLocations = useMemo(() => {
        if (!selectedCity) return [];
        return allLocations.filter((loc: any) => loc.metadata?.city === selectedCity.title);
    }, [selectedCity, allLocations]);

    return {
        states,
        allLocations,
        filteredCities,
        filteredLocations,
    };
}
