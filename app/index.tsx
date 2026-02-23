import { useAuthStore } from '@/stores/useAuthStore';
import { Redirect, useRouter } from 'expo-router';
import React from 'react';
import OnboardingScreen from '../components/OnboardingScreen';

export default function AppIndex() {
    const router = useRouter();
    const isAuthenticated = useAuthStore((state) => state.isAuthenticated);

    if (isAuthenticated) {
        return <Redirect href="/(tabs)" />;
    }

    const handleSignUp = () => {
        router.push('/(auth)/signup');
    };

    const handleLogin = () => {
        router.push('/(auth)/welcome-back');
    };

    return (
        <OnboardingScreen
            onSignUp={handleSignUp}
            onLogin={handleLogin}
        />
    );
}
