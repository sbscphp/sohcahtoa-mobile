import PaymentLayout from '@/components/PaymentLayout';
import { useLocalSearchParams, useRouter } from 'expo-router';
import React from 'react';

export default function PaymentScreen() {
    const router = useRouter();
    const { transactionId } = useLocalSearchParams<{ transactionId: string }>();

    const handleSent = () => {
        router.push({
            pathname: '/(buy-fx)/(pta)/payment-success',
            params: { transactionId }
        });
    };

    return (
        <PaymentLayout
            transactionId={transactionId}
            infoText="Once approved, 75% of your funds will be sent to your bank account or prepaid card, while the remaining 25% will be available for cash pickup at the nearest branch (passport endorsement required)"
            onSent={handleSent}
        />
    );
}
