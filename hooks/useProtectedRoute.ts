import { useAuthStore } from '@/stores/useAuthStore';
import { useRouter, useSegments } from 'expo-router';
import { useEffect } from 'react';

export function useProtectedRoute() {
    const segments = useSegments();
    const router = useRouter();
    const isAuthenticated = useAuthStore((state) => state.isAuthenticated);

    useEffect(() => {
        const inAuthGroup = segments[0] === '(auth)';
        const hasSeenPrompt = useAuthStore.getState().hasSeenNotificationPrompt;

        if (!isAuthenticated && !inAuthGroup && segments[0] !== undefined) {
            router.replace('/');
        } else if (isAuthenticated) {
            if (!hasSeenPrompt) {
                if (segments[1] !== 'allow-notifications') {
                    router.replace('/(auth)/allow-notifications');
                }
            } else if (inAuthGroup) {
                router.replace('/(tabs)');
            }
        }
    }, [isAuthenticated, segments]);
}
