import SuccessScreen from '@/components/SuccessScreen';
import { useRouter } from 'expo-router';
import React from 'react';

export default function ExpatriateSuccessScreen() {
    const router = useRouter();

    return (
        <SuccessScreen
            headerTitle="Transaction Request Successful"
            title="Request Submitted Successfully"
            description="You have successfully initiated a new transaction request. Your documents have been received and currently awaiting approval."
            primaryButtonText="View Transaction"
            onViewTransaction={() => router.push('/(sell-fx)/(expatriate)/view-expatriate')}
            onGoHome={() => router.push('/(tabs)')}
        />
    );
}
