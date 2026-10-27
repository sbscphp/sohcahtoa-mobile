import { GlobalToast } from '@/components/GlobalToast';
import InactiveSessionTracker from '@/components/InactiveSessionTracker';
import { QueryProvider } from '@/components/QueryProvider';
import { AppThemeProvider, useAppTheme } from '@/context/ThemeContext';
import { useProtectedRoute } from '@/hooks/useProtectedRoute';
import { usePushNotifications } from '@/hooks/usePushNotifications';
import { useAuthStore } from '@/stores/useAuthStore';
import { useThemeStore } from '@/stores/useThemeStore';
import { clearStoredCredentials } from '@/utils/biometrics';
import {
  Inter_300Light,
  Inter_400Regular,
  Inter_500Medium,
  Inter_600SemiBold,
  Inter_700Bold,
  useFonts,
} from '@expo-google-fonts/inter';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { ThemeProvider } from '@react-navigation/native';
import { Stack } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import { StatusBar } from 'expo-status-bar';
import { useEffect, useState } from 'react';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import 'react-native-reanimated';

// Prevent the splash screen from auto-hiding before asset loading is complete.
SplashScreen.preventAutoHideAsync();

export const unstable_settings = {
  initialRouteName: 'index',
};

function InitialLayout() {
  useProtectedRoute();
  usePushNotifications();
  const { colors } = useAppTheme();

  return (
    <Stack
      screenOptions={{
        headerShown: false,
        animation: 'ios_from_right',
        gestureEnabled: true,
        fullScreenGestureEnabled: true,
        contentStyle: { backgroundColor: colors.background },
      }}
    >
      <Stack.Screen name="index" options={{ headerShown: false, animation: 'fade' }} />
      <Stack.Screen name="(auth)" options={{ headerShown: false, animation: 'fade' }} />
      <Stack.Screen name="(tabs)" options={{ headerShown: false, animation: 'fade' }} />
      <Stack.Screen name="(buy-fx)" options={{ headerShown: false }} />
      <Stack.Screen name="(sell-fx)" options={{ headerShown: false }} />
      <Stack.Screen name="all-transactions" options={{ headerShown: false }} />
      <Stack.Screen name="security/change-password" options={{ headerShown: false }} />
      <Stack.Screen name="(more)" options={{ headerShown: false }} />
      <Stack.Screen name="(receive-fx)" options={{ headerShown: false }} />
      <Stack.Screen name="notifications" options={{ headerShown: false }} />
      <Stack.Screen name="proof-of-fund" options={{ headerShown: false }} />
    </Stack>
  );
}

function ThemedRootContent() {
  const { navigationTheme, isDark, colors } = useAppTheme();

  return (
    <GestureHandlerRootView style={{ flex: 1, backgroundColor: colors.background }}>
      <ThemeProvider value={navigationTheme}>
        <InactiveSessionTracker>
          <InitialLayout />
          <GlobalToast />
          <StatusBar style={isDark ? 'light' : 'dark'} />
        </InactiveSessionTracker>
      </ThemeProvider>
    </GestureHandlerRootView>
  );
}

export default function RootLayout() {
  const [loaded, error] = useFonts({
    Inter_300Light,
    Inter_400Regular,
    Inter_500Medium,
    Inter_600SemiBold,
    Inter_700Bold,
  });

  const [isReady, setIsReady] = useState(false);

  useEffect(() => {
    if (error) throw error;
  }, [error]);

  useEffect(() => {
    if (loaded && isReady) {
      SplashScreen.hideAsync();
    }
  }, [loaded, isReady]);

  useEffect(() => {
    const initApp = async () => {
      try {
        await Promise.all([
          new Promise<void>((resolve) => {
            if (useAuthStore.persist.hasHydrated()) {
              resolve();
            } else {
              const unsub = useAuthStore.persist.onFinishHydration(() => {
                unsub();
                resolve();
              });
            }
          }),
          new Promise<void>((resolve) => {
            if (useThemeStore.persist.hasHydrated()) {
              resolve();
            } else {
              const unsub = useThemeStore.persist.onFinishHydration(() => {
                unsub();
                resolve();
              });
            }
          }),
        ]);

        // Perform first run check
        const hasRunBefore = await AsyncStorage.getItem('has_run_before');
        if (!hasRunBefore) {
          // Clear Zustand store persisted key
          await AsyncStorage.removeItem('auth-storage');
          // Clear secure store email/password
          await clearStoredCredentials();
          // Reset auth store memory state
          useAuthStore.getState().logout();
          // Set run flag
          await AsyncStorage.setItem('has_run_before', 'true');
        }
      } catch (err) {
        console.error('Error during app initialization:', err);
      } finally {
        setIsReady(true);
      }
    };
    initApp();
  }, []);

  if (!loaded || !isReady) {
    return null;
  }

  return (
    <QueryProvider>
      <AppThemeProvider>
        <ThemedRootContent />
      </AppThemeProvider>
    </QueryProvider>
  );
}
