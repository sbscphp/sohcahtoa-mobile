import SuccessScreen from '@/components/SuccessScreen';
import { useLocalSearchParams, useRouter } from 'expo-router';
import React from 'react';

export default function ExpatriateSuccessScreen() {
    const router = useRouter();

    const { transactionId } = useLocalSearchParams();

    const handleViewTransaction = () => {
        router.push({
            pathname: '/(sell-fx)/(expatriate)/view-expatriate',
            params: {
                transactionId: transactionId,
            },
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
            primaryButtonText="View Transaction"
            onViewTransaction={handleViewTransaction}
            onGoHome={handleGoHome}
        />
    );
}
