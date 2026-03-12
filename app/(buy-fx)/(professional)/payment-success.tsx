import SuccessScreen from '@/components/SuccessScreen';
import { useRouter, useLocalSearchParams } from 'expo-router';
import React from 'react';

export default function PaymentSuccessScreen() {
    const router = useRouter();
    const { transactionId } = useLocalSearchParams();

    const handleViewTransaction = () => {
        router.push({
            pathname: '/(buy-fx)/(professional)/view-professional',
            params: { transactionId }
        });
    };

    const handleGoHome = () => {
        router.push('/(tabs)');
    };

    return (
        <SuccessScreen
            headerTitle="Payment Successful"
            title="Payment Successfully"
            description="Your payment has been received and your funds will be released soon."
            onViewTransaction={handleViewTransaction}
            onGoHome={handleGoHome}
            primaryButtonText="View Transaction"
        />
    );
}
