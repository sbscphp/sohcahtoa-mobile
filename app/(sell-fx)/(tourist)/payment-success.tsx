import SuccessScreen from '@/components/SuccessScreen';
import { useLocalSearchParams, useRouter } from 'expo-router';
import React from 'react';

export default function PaymentSuccessScreen() {
    const router = useRouter();
    const { transactionId } = useLocalSearchParams();

    const handleViewTransaction = () => {
         router.push({
            pathname: '/(sell-fx)/(tourist)/view-tourist',
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
            headerTitle="Payment Successful"
            title="Payment Successful"
            description="Your payment has been received and your funds will be released soon."
            onViewTransaction={handleViewTransaction}
            onGoHome={handleGoHome}
        />
    );
}
