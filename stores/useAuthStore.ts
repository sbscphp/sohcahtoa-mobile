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
            setToken: (token) => set({ token, isAuthenticated: !!token }),
            setRefreshToken: (refreshToken) => set({ refreshToken }),
            setVerificationToken: (verificationToken) => set({ verificationToken }),
            setUser: (user) => set({ user }),
            setTempUserInfo: (tempUserInfo) => set({ tempUserInfo }),
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
