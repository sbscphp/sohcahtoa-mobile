import SuccessScreen from '@/components/SuccessScreen';
import { useLocalSearchParams, useRouter, useNavigation } from 'expo-router';
import React, { useEffect } from 'react';
import { BackHandler } from 'react-native';

export default function ExpatriateSuccessScreen() {
    const router = useRouter();
    const navigation = useNavigation();

    useEffect(() => {
        navigation.setOptions({
            gestureEnabled: false,
        });
        const backHandler = BackHandler.addEventListener('hardwareBackPress', () => {
            return true;
        });
        return () => backHandler.remove();
    }, [navigation]);

    const { transactionId } = useLocalSearchParams();

    const handleViewTransaction = () => {
        router.push({
            pathname: '/(sell-fx)/(expatriate)/view-expatriate',
            params: {
                transactionId: transactionId,
                fromSuccess: 'true'
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
