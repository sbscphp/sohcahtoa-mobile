import SuccessScreen from '@/components/SuccessScreen';
import { useLocalSearchParams, useRouter } from 'expo-router';
import React from 'react';

export default function RequestSuccessScreen() {
    const router = useRouter();
    const { transactionId } = useLocalSearchParams<{ transactionId: string }>();

    const handleViewTransaction = () => {
        router.push({
            pathname: '/(buy-fx)/(school)/view-school',
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
