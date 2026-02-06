import SuccessScreen from '@/components/SuccessScreen';
import { useRouter } from 'expo-router';
import React from 'react';

export default function RequestSuccessScreen() {
    const router = useRouter();

    const handleViewTransaction = () => {
        router.push('/(buy-fx)/(pta)/view-pta');
    };

    const handleGoHome = () => {
        router.push('/(tabs)');
    };

    return (
        <SuccessScreen
            headerTitle="Request Initiated Successful"
             title="Request Submitted Successfully"
            description="You have successfully initiated a new transaction request. Your documents have been received and currently awaiting approval."
            onViewTransaction={handleViewTransaction}
            onGoHome={handleGoHome}
        />
    );
}
