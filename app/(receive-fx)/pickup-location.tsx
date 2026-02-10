import Header from '@/components/Header';
import { LocationItem } from '@/components/LocationSelectionSheet';
import PrimaryButton from '@/components/PrimaryButton';
import ProgressBar from '@/components/ProgressBar';
import LocationStep from '@/components/transaction-flow/LocationStep';
import { useRouter } from 'expo-router';
import React, { useState } from 'react';
import { KeyboardAvoidingView, Platform, ScrollView, View } from 'react-native';
import { ScaledSheet } from 'react-native-size-matters';

// Mock Data (Reused from create-bta.tsx)
const STATES: LocationItem[] = [
    { id: '1', title: 'Lagos State' },
    { id: '2', title: 'Ogun State' },
    { id: '3', title: 'Rivers State' },
    { id: '4', title: 'Kaduna State' },
    { id: '5', title: 'Enugu State' },
    { id: '6', title: 'Kano State' },
];

const CITIES: LocationItem[] = [
    { id: '1', title: 'Ajeromi Local Government' },
    { id: '2', title: 'Agege Local Government' },
    { id: '3', title: 'Alimosho Local Government' },
    { id: '4', title: 'Ikeja LGA' },
];

const LOCATIONS: LocationItem[] = [
    { id: '1', title: 'Ajeromi Local Government', subtitle: 'Femi Areola Street, Ikeja GRA.' },
    { id: '2', title: 'Agege Local Government', subtitle: 'Femi Areola Street, Ikeja GRA.' },
    { id: '3', title: 'Ikorodu Local Government', subtitle: '23 T.O.S Benson Avenue, Ikorodu.' },
    { id: '4', title: 'Festac Local Government', subtitle: '1st Avenue, Festac Town.' },
];

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
