import SuccessScreen from '@/components/SuccessScreen';
import { useRouter, useLocalSearchParams, useNavigation } from 'expo-router';
import React, { useEffect } from 'react';
import { BackHandler } from 'react-native';

export default function PaymentSuccessScreen() {
    const router = useRouter();
    const navigation = useNavigation();
    const { transactionId } = useLocalSearchParams();

    useEffect(() => {
        navigation.setOptions({
            gestureEnabled: false,
        });
        const backHandler = BackHandler.addEventListener('hardwareBackPress', () => {
            return true;
        });
        return () => backHandler.remove();
    }, [navigation]);

    const handleViewTransaction = () => {
        router.push({
            pathname: '/(buy-fx)/(medical)/view-medical',
            params: {
                transactionId,
                fromSuccess: 'true'
            }
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
