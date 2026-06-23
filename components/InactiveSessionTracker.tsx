import React, { useEffect, useRef } from 'react';
import { PanResponder, View, AppState, AppStateStatus } from 'react-native';
import { useAuthStore } from '@/stores/useAuthStore';
import { useToastStore } from '@/stores/useToastStore';


const INACTIVITY_TIMEOUT = 5 * 60 * 1000;

export default function InactiveSessionTracker({ children }: { children: React.ReactNode }) {
    const isAuthenticated = useAuthStore((state) => state.isAuthenticated);
    const logout = useAuthStore((state) => state.logout);
    const timerRef = useRef<NodeJS.Timeout | null>(null);
    const lastBackgroundTimeRef = useRef<number | null>(null);

    const resetTimer = () => {
        if (timerRef.current) {
            clearTimeout(timerRef.current);
        }
        if (isAuthenticated) {
            timerRef.current = setTimeout(() => {
                handleLogout("Session expired due to inactivity");
            }, INACTIVITY_TIMEOUT);
        }
    };

    const handleLogout = (message: string) => {
        if (isAuthenticated) {
            logout();
            useToastStore.getState().showToast(message, 'warning');
        }
    };

    const panResponder = useRef(
        PanResponder.create({
            onStartShouldSetPanResponderCapture: () => {
                resetTimer();
                return false;
            },
            onMoveShouldSetPanResponderCapture: () => {
                resetTimer();
                return false;
            },
        })
    ).current;

    useEffect(() => {
        const handleAppStateChange = (nextAppState: AppStateStatus) => {
            if (nextAppState === 'background') {
                lastBackgroundTimeRef.current = Date.now();
            } else if (nextAppState === 'active') {
                if (lastBackgroundTimeRef.current && isAuthenticated) {
                    const elapsed = Date.now() - lastBackgroundTimeRef.current;
                    if (elapsed >= INACTIVITY_TIMEOUT) {
                        handleLogout("Session expired. Please log in again.");
                    } else {
                        resetTimer();
                    }
                }
                lastBackgroundTimeRef.current = null;
            }
        };

        const subscription = AppState.addEventListener('change', handleAppStateChange);
        return () => {
            subscription.remove();
        };
    }, [isAuthenticated]);

    // Track state changes to reset/clear timers
    useEffect(() => {
        resetTimer();
        return () => {
            if (timerRef.current) {
                clearTimeout(timerRef.current);
            }
        };
    }, [isAuthenticated]);

    return (
        <View style={{ flex: 1 }} {...panResponder.panHandlers}>
            {children}
        </View>
    );
}
