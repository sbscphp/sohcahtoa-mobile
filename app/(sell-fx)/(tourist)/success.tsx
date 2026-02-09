
import SuccessScreen from '@/components/SuccessScreen';
import { useRouter } from 'expo-router';
import React from 'react';

export default function TouristSuccessScreen() {
    const router = useRouter();

    const handleViewTransaction = () => {
        router.push('/(sell-fx)/(tourist)/view-tourist');
    };

    const handleGoHome = () => {
        router.push('/(tabs)');
    };

    return (
        <SuccessScreen
            headerTitle="Transaction Request Successful"
            title="Request Submitted Successfully"
            description="You have successfully initiated a new transaction request. Your documents have been received and currently awaiting approval."
            onViewTransaction={handleViewTransaction}
            onGoHome={handleGoHome}
        />
    );
}
