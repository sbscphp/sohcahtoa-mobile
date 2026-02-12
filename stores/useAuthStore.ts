import { User } from '@/types/api/user';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';

interface AuthState {
    token: string | null;
    verificationToken: string | null;
    user: User | null;
    isAuthenticated: boolean;
    setToken: (token: string) => void;
    setVerificationToken: (token: string) => void;
    setUser: (user: any) => void;
    logout: () => void;
}

export const useAuthStore = create<AuthState>()(
    persist(
        (set) => ({
            token: null,
            verificationToken: null,
            user: null,
            isAuthenticated: false,
            setToken: (token) => set({ token, isAuthenticated: !!token }),
            setVerificationToken: (verificationToken) => set({ verificationToken }),
            setUser: (user) => set({ user }),
            logout: () => set({ token: null, verificationToken: null, user: null, isAuthenticated: false }),
        }),
        {
            name: 'auth-storage',
            storage: createJSONStorage(() => AsyncStorage),
        }
    )
);
