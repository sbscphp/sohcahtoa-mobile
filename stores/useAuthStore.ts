import { User } from '@/types/api/user';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';

interface AuthState {
    token: string | null;
    refreshToken: string | null;
    verificationToken: string | null;
    user: User | null;
    tempUserInfo: any | null;
    isAuthenticated: boolean;
    setToken: (token: string) => void;
    setRefreshToken: (token: string) => void;
    setVerificationToken: (token: string) => void;
    setUser: (user: any) => void;
    setTempUserInfo: (info: any) => void;
    setAuth: (accessToken: string, refreshToken: string, user: any) => void;
    isBiometricEnabled: boolean;
    setBiometricEnabled: (enabled: boolean) => void;
    biometricType: 'face' | 'fingerprint' | null;
    setBiometricType: (type: 'face' | 'fingerprint' | null) => void;
    hasCredentials: boolean;
    setHasCredentials: (has: boolean) => void;
    checkCredentials: () => Promise<void>;
    logout: () => void;
}

export const useAuthStore = create<AuthState>()(
    persist(
        (set) => ({
            token: null,
            refreshToken: null,
            verificationToken: null,
            user: null,
            tempUserInfo: null,
            isAuthenticated: false,
            isBiometricEnabled: false,
            biometricType: null,
            hasCredentials: false,
            setHasCredentials: (hasCredentials) => set({ hasCredentials }),
            checkCredentials: async () => {
                const { getStoredCredentials } = await import('@/utils/biometrics');
                const credentials = await getStoredCredentials();
                set({ hasCredentials: !!credentials });
            },
            setBiometricEnabled: (isBiometricEnabled) => set({ isBiometricEnabled }),
            setBiometricType: (biometricType) => set({ biometricType }),
            setToken: (token) => set({ token, isAuthenticated: !!token }),
            setRefreshToken: (refreshToken) => set({ refreshToken }),
            setVerificationToken: (verificationToken) => set({ verificationToken }),
            setUser: (user) => set({ user }),
            setTempUserInfo: (tempUserInfo) => set({ tempUserInfo }),
            setAuth: (accessToken, refreshToken, user) => set({
                token: accessToken,
                refreshToken,
                user,
                isAuthenticated: !!accessToken
            }),
            logout: () => {
                set({
                    token: null,
                    refreshToken: null,
                    verificationToken: null,
                    user: null,
                    isAuthenticated: false,
                    tempUserInfo: null
                });
            },

        }),
        {
            name: 'auth-storage',
            storage: createJSONStorage(() => AsyncStorage),
        }
    )
);
