import { useRouter } from 'expo-router';
import React from 'react';
import OnboardingScreen from '../components/OnboardingScreen';

export default function AppIndex() {
    const router = useRouter();

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
