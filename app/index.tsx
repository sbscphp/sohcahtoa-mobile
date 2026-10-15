import { useAuthStore } from '@/stores/useAuthStore';
import { Redirect, useRouter } from 'expo-router';
import React, { useEffect, useState } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import OnboardingScreen from '../components/OnboardingScreen';

export default function AppIndex() {
    const router = useRouter();
    const isAuthenticated = useAuthStore((state) => state.isAuthenticated);
    const [hasRunBefore, setHasRunBefore] = useState<boolean | null>(null);

    useEffect(() => {
        const checkReturningUser = async () => {
            try {
                const flag = await AsyncStorage.getItem('has_run_before');
                setHasRunBefore(flag === 'true');
            } catch (e) {
                setHasRunBefore(false);
            }
        };
        checkReturningUser();
    }, []);

    if (isAuthenticated) {
        return <Redirect href="/(tabs)" />;
    }

    if (hasRunBefore === null) {
        return null; 
    }

    if (hasRunBefore) {
        return <Redirect href="/(auth)/login" />;
    }

    const handleSignUp = () => {
        router.push('/(auth)/signup');
    };

    const handleLogin = () => {
        router.push('/(auth)/login');
    };

    return (
        <OnboardingScreen
            onSignUp={handleSignUp}
            onLogin={handleLogin}
        />
    );
}
