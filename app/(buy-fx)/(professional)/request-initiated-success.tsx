import SuccessScreen from '@/components/SuccessScreen';
import { useRouter, useLocalSearchParams, useNavigation } from 'expo-router';
import React, { useEffect } from 'react';
import { BackHandler } from 'react-native';

export default function RequestSuccessScreen() {
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
            pathname: '/(buy-fx)/(professional)/view-professional',
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
            headerTitle="Transaction Request Successful"
            title="Request Submitted Successfully"
            description="You have successfully initiated a new transaction request. Your documents have been received and currently awaiting approval."
            onViewTransaction={handleViewTransaction}
            onGoHome={handleGoHome}
        />
    );
}
