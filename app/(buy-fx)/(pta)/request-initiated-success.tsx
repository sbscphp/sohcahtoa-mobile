import SuccessScreen from '@/components/SuccessScreen';
import { useLocalSearchParams, useRouter, useNavigation } from 'expo-router';
import React, { useEffect } from 'react';
import { BackHandler } from 'react-native';

export default function RequestSuccessScreen() {
    const router = useRouter();
    const navigation = useNavigation();
    const { transactionId } = useLocalSearchParams<{ transactionId: string }>();

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
            pathname: '/(buy-fx)/(pta)/view-pta',
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
            headerTitle="Request Initiated Successful"
            title="Request Submitted Successfully"
            description="You have successfully initiated a new transaction request. Your documents have been received and currently awaiting approval."
            onViewTransaction={handleViewTransaction}
            onGoHome={handleGoHome}
        />
    );
}
