import { GlobalToast } from '@/components/GlobalToast';
import InactiveSessionTracker from '@/components/InactiveSessionTracker';
import DeviceSecurityBlockedScreen from '@/components/DeviceSecurityBlockedScreen';
import { QueryProvider } from '@/components/QueryProvider';
import { AppThemeProvider, useAppTheme } from '@/context/ThemeContext';
import { useProtectedRoute } from '@/hooks/useProtectedRoute';
import { usePushNotifications } from '@/hooks/usePushNotifications';
import { useAuthStore } from '@/stores/useAuthStore';
import { useThemeStore } from '@/stores/useThemeStore';
import { clearStoredCredentials } from '@/utils/biometrics';
import { checkDeviceIntegrity, DeviceIntegrityResult } from '@/utils/deviceIntegrity';
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
import { AppState, AppStateStatus } from 'react-native';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import 'react-native-reanimated';

// Prevent the splash screen from auto-hiding before asset loading is complete.
SplashScreen.preventAutoHideAsync().catch(() => {});

export const unstable_settings = {
  anchor: 'index',
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
  const [securityStatus, setSecurityStatus] = useState<DeviceIntegrityResult | null>(null);

  const evaluateSecurity = async () => {
    try {
      const integrity = await checkDeviceIntegrity();
      setSecurityStatus(integrity.isCompromised ? integrity : null);
      return integrity;
    } catch {
      return { isCompromised: false };
    }
  };

  useEffect(() => {
    if (error) {
      console.warn('Font loading error:', error);
    }
  }, [error]);

  useEffect(() => {
    if ((loaded || error) && isReady) {
      SplashScreen.hideAsync().catch(() => {});
    }
  }, [loaded, error, isReady]);

  // Listen for app state changes (e.g. user toggles USB Debugging in settings and returns)
  useEffect(() => {
    const handleAppStateChange = (nextAppState: AppStateStatus) => {
      if (nextAppState === 'active') {
        evaluateSecurity();
      }
    };

    const subscription = AppState.addEventListener('change', handleAppStateChange);
    return () => {
      subscription.remove();
    };
  }, []);

  useEffect(() => {
    const initApp = async () => {
      try {
        await evaluateSecurity();

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

  if ((!loaded && !error) || !isReady) {
    return null;
  }

  if (securityStatus?.isCompromised) {
    return (
      <DeviceSecurityBlockedScreen
        reason={securityStatus.reason}
        type={securityStatus.type}
        onRecheck={evaluateSecurity}
      />
    );
  }

  return (
    <QueryProvider>
      <AppThemeProvider>
        <ThemedRootContent />
      </AppThemeProvider>
    </QueryProvider>
  );
}
