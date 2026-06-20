import PaymentLayout from '@/components/PaymentLayout';
import { useLocalSearchParams, useRouter } from 'expo-router';
import React from 'react';

export default function PaymentScreen() {
    const router = useRouter();
    const { transactionId } = useLocalSearchParams<{ transactionId: string }>();

    const handleSent = () => {
        router.push({
            pathname: '/(sell-fx)/(resident)/payment-success',
            params: { transactionId }
        });
    };

    return (
        <PaymentLayout
            transactionId={transactionId}
            onSent={handleSent}
        />
    );
}
