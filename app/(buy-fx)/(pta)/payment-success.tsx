import SuccessScreen from '@/components/SuccessScreen';
import { useRouter } from 'expo-router';
import React from 'react';

export default function PaymentSuccessScreen() {
    const router = useRouter();

    const handleViewTransaction = () => {
        // Navigate back to view-pta, possibly ensuring it refreshes or shows updated data
        router.push('/(buy-fx)/(pta)/view-pta');
    };

    const handleGoHome = () => {
        router.push('/(tabs)');
    };

    return (
        <SuccessScreen
            headerTitle="Payment Successful"
            title="Payment Successful"
            description="Your payment has been received and your funds will be released soon."
            onViewTransaction={handleViewTransaction}
            onGoHome={handleGoHome}
        />
    );
}
