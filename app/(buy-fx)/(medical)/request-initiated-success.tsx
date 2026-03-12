import SuccessScreen from '@/components/SuccessScreen';
import { useRouter, useLocalSearchParams } from 'expo-router';
import React from 'react';

export default function RequestSuccessScreen() {
    const router = useRouter();
    const { transactionId } = useLocalSearchParams();

    const handleViewTransaction = () => {
        router.push({
            pathname: '/(buy-fx)/(medical)/view-medical',
            params: { transactionId }
        });
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
