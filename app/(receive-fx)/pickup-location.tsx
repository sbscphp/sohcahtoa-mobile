import React, { useState } from 'react';
import { KeyboardAvoidingView, Platform, ScrollView, View } from 'react-native';
import { ScaledSheet } from 'react-native-size-matters';
import { useLocalSearchParams, useRouter } from 'expo-router';

import Header from '@/components/Header';
import PrimaryButton from '@/components/PrimaryButton';
import ProgressBar from '@/components/ProgressBar';
import LocationStep from '@/components/transaction-flow/LocationStep';
import { CITIES, LOCATIONS, STATES, LocationItem } from '@/utils/locations';
import { useBuyFxLocations } from '@/hooks/useBuyFxLocations';

export default function PickupLocationScreen() {
    const router = useRouter();
    const params = useLocalSearchParams();
    const [selectedState, setSelectedState] = useState<LocationItem | null>(null);
    const [selectedCity, setSelectedCity] = useState<LocationItem | null>(null);
    const [selectedLocation, setSelectedLocation] = useState<LocationItem | null>(null);
    const [pickupDate, setPickupDate] = useState('');
    const [pickupTime, setPickupTime] = useState('');

    const {
        states: apiStates,
        filteredCities: apiCities,
        filteredLocations: apiLocations,
    } = useBuyFxLocations(selectedState, selectedCity);

    const states = apiStates.length > 0 ? apiStates : STATES;
    const cities = apiCities.length > 0 ? apiCities : CITIES;
    const locations = apiLocations.length > 0 ? apiLocations : LOCATIONS;

    const handleSubmit = () => {
        router.push({
            pathname: '/(receive-fx)/success',
            params: {
                ...params,
                state: selectedState?.title,
                city: selectedCity?.title,
                location: selectedLocation?.title,
                pickupDate,
                pickupTime,
            },
        });
    };

    return (
        <View style={styles.container}>
            <Header title="Receive Funds: IMTO" />

            <KeyboardAvoidingView
                behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
                style={{ flex: 1 }}
            >
                <ScrollView
                    style={styles.content}
                    contentContainerStyle={styles.scrollContent}
                    showsVerticalScrollIndicator={false}
                >
                    <ProgressBar step={4} totalSteps={5} />

                    <LocationStep
                        title="Where would you like to pick up your cash?"
                        states={states}
                        cities={cities}
                        locations={locations}
                        selectedState={selectedState}
                        onSelectState={(item) => {
                            setSelectedState(item);
                            setSelectedCity(null);
                            setSelectedLocation(null);
                        }}
                        selectedCity={selectedCity}
                        onSelectCity={(item) => {
                            setSelectedCity(item);
                            setSelectedLocation(null);
                        }}
                        selectedLocation={selectedLocation}
                        onSelectLocation={setSelectedLocation}
                        pickupDate={pickupDate}
                        onPickupDateChange={setPickupDate}
                        pickupTime={pickupTime}
                        onPickupTimeChange={setPickupTime}
                    />
                </ScrollView>
            </KeyboardAvoidingView>

            <View style={styles.footer}>
                <PrimaryButton
                    title="Continue"
                    onPress={handleSubmit}
                    disabled={!selectedLocation}
                />
            </View>
        </View>
    );
}

const styles = ScaledSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#FFFFFF',
        paddingTop: '40@vs',
    },
    content: {
        flex: 1,
    },
    scrollContent: {
        paddingHorizontal: '20@ms',
        paddingTop: '16@vs',
        paddingBottom: '100@vs',
    },
    footer: {
        position: 'absolute',
        bottom: 0,
        left: 0,
        right: 0,
        padding: '20@ms',
        paddingBottom: '30@vs',
        backgroundColor: '#FFFFFF',
        borderTopWidth: 1,
        borderTopColor: '#F1F5F9',
    },
});
