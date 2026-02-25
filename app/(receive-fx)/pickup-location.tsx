import Header from '@/components/Header';
import { LocationItem } from '@/components/LocationSelectionSheet';
import PrimaryButton from '@/components/PrimaryButton';
import ProgressBar from '@/components/ProgressBar';
import LocationStep from '@/components/transaction-flow/LocationStep';
import { useRouter } from 'expo-router';
import React, { useState } from 'react';
import { KeyboardAvoidingView, Platform, ScrollView, View } from 'react-native';
import { ScaledSheet } from 'react-native-size-matters';

import { CITIES, LOCATIONS, STATES } from '@/utils/locations';

export default function PickupLocationScreen() {
    const router = useRouter();
    const [selectedState, setSelectedState] = useState<LocationItem | null>(null);
    const [selectedCity, setSelectedCity] = useState<LocationItem | null>(null);
    const [selectedLocation, setSelectedLocation] = useState<LocationItem | null>(null);
    const [pickupDate, setPickupDate] = useState('');
    const [pickupTime, setPickupTime] = useState('');

    const handleSubmit = () => {
        router.push('/(receive-fx)/split-payment');
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
                    <ProgressBar step={4} totalSteps={6} />

                    <LocationStep
                        title="Where would you like to pick up your cash?"
                        states={STATES}
                        cities={CITIES}
                        locations={LOCATIONS}
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
                    title="Submit"
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
