import { User } from '@/types/api/user';
import { clearStoredCredentials, hasStoredCredentials } from '@/utils/biometrics';
import { purgeDocumentPickerCache } from '@/utils/cacheCleanup';
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
    disableBiometrics: () => Promise<void>;
    hasSeenNotificationPrompt: boolean;
    setHasSeenNotificationPrompt: (seen: boolean) => void;
    pendingBiometricCredentials: { email: string; password: string } | null;
    setPendingBiometricCredentials: (creds: { email: string; password: string } | null) => void;
    pendingResetToken: string | null;
    setPendingResetToken: (token: string | null) => void;
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
            pendingBiometricCredentials: null,
            pendingResetToken: null,
            isAuthenticated: false,
            isBiometricEnabled: false,
            biometricType: null,
            hasCredentials: false,
            hasSeenNotificationPrompt: false,
            setPendingResetToken: (pendingResetToken) => set({ pendingResetToken }),
            setPendingBiometricCredentials: (pendingBiometricCredentials) => set({ pendingBiometricCredentials }),
            setHasCredentials: (hasCredentials) => set({ hasCredentials }),
            setHasSeenNotificationPrompt: (seen) => set({ hasSeenNotificationPrompt: seen }),
            checkCredentials: async () => {
                const has = await hasStoredCredentials();
                set({ hasCredentials: has });
            },
            disableBiometrics: async () => {
                await clearStoredCredentials();
                set({ isBiometricEnabled: false, biometricType: null, hasCredentials: false });
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
                purgeDocumentPickerCache().catch(() => {});
                set({
                    token: null,
                    refreshToken: null,
                    verificationToken: null,
                    user: null,
                    isAuthenticated: false,
                    tempUserInfo: null,
                    pendingBiometricCredentials: null,
                    pendingResetToken: null,
                });
            },

        }),
        {
            name: 'auth-storage',
            storage: createJSONStorage(() => AsyncStorage),
            partialize: (state) => ({
                isBiometricEnabled: state.isBiometricEnabled,
                biometricType: state.biometricType,
                hasSeenNotificationPrompt: state.hasSeenNotificationPrompt,
            }),
        }
    )
);
