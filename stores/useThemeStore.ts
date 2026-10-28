import { ThemeMode } from '@/constants/theme';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Appearance, Platform } from 'react-native';
import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';

export const THEME_STORAGE_KEY = 'theme-storage';

export interface ThemeState {
  themeMode: ThemeMode;
  hasHydrated: boolean;
  setThemeMode: (mode: ThemeMode) => void;
  setHasHydrated: (hydrated: boolean) => void;
}

function syncNativeAppearance(mode: ThemeMode) {
  if (Platform.OS === 'web') return;
  try {
    if (typeof Appearance?.setColorScheme === 'function') {
      Appearance.setColorScheme((mode === 'system' ? null : mode) as any);
    }
  } catch {
    // Ignore on platforms/environments where setColorScheme is unsupported
  }
}

export const useThemeStore = create<ThemeState>()(
  persist(
    (set) => ({
      themeMode: 'system',
      hasHydrated: false,
      setThemeMode: (themeMode: ThemeMode) => {
        syncNativeAppearance(themeMode);
        set({ themeMode });
      },
      setHasHydrated: (hasHydrated: boolean) => set({ hasHydrated }),
    }),
    {
      name: THEME_STORAGE_KEY,
      storage: createJSONStorage(() => AsyncStorage),
      partialize: (state) => ({
        themeMode: state.themeMode,
      }),
      onRehydrateStorage: () => (state) => {
        if (state?.themeMode) {
          syncNativeAppearance(state.themeMode);
        }
        state?.setHasHydrated(true);
      },
    }
  )
);
