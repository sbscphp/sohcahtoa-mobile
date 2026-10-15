import React from 'react';
import LocationStep from '@/components/transaction-flow/LocationStep';
import { LocationItem } from '@/utils/locations';
import { UseFormSetValue } from 'react-hook-form';

interface BuyFxLocationStepSectionProps {
    states: LocationItem[];
    cities: LocationItem[];
    locations: any[];
    selectedState?: LocationItem | null;
    selectedCity?: LocationItem | null;
    selectedLocation?: LocationItem | null;
    pickupDate?: string;
    pickupTime?: string;
    setValue: UseFormSetValue<any>;
    errors: {
        selectedState?: { message?: string };
        selectedCity?: { message?: string };
        selectedLocation?: { message?: string };
        pickupDate?: { message?: string };
        pickupTime?: { message?: string };
    };
}

export default function BuyFxLocationStepSection({
    states,
    cities,
    locations,
    selectedState,
    selectedCity,
    selectedLocation,
    pickupDate,
    pickupTime,
    setValue,
    errors,
}: BuyFxLocationStepSectionProps) {
    return (
        <LocationStep
            states={states}
            cities={cities}
            locations={locations}
            selectedState={selectedState || null}
            onSelectState={(item) => {
                setValue('selectedState', item);
                setValue('selectedCity', undefined as unknown as LocationItem);
                setValue('selectedLocation', undefined as unknown as LocationItem);
            }}
            selectedCity={selectedCity || null}
            onSelectCity={(item) => {
                setValue('selectedCity', item);
                setValue('selectedLocation', undefined as unknown as LocationItem);
            }}
            selectedLocation={selectedLocation || null}
            onSelectLocation={(item) => setValue('selectedLocation', item)}
            pickupDate={pickupDate}
            onPickupDateChange={(date) => setValue('pickupDate', date)}
            pickupTime={pickupTime}
            onPickupTimeChange={(time) => setValue('pickupTime', time)}
            errors={{
                state: errors.selectedState?.message,
                city: errors.selectedCity?.message,
                location: errors.selectedLocation?.message,
                pickupDate: errors.pickupDate?.message,
                pickupTime: errors.pickupTime?.message,
            }}
        />
    );
}
