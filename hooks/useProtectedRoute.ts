import { useAuthStore } from '@/stores/useAuthStore';
import { useRouter, useSegments } from 'expo-router';
import { useEffect } from 'react';

export function useProtectedRoute() {
    const segments = useSegments();
    const router = useRouter();
    const isAuthenticated = useAuthStore((state) => state.isAuthenticated);

    useEffect(() => {
        const inAuthGroup = segments[0] === '(auth)';

        if (!isAuthenticated && !inAuthGroup && segments[0] !== undefined) {
            router.replace('/');
        } else if (isAuthenticated && inAuthGroup) {
            router.replace('/(tabs)');
        }
    }, [isAuthenticated, segments]);
}
