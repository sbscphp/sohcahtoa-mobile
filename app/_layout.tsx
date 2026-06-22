import { GlobalToast } from '@/components/GlobalToast';
import { QueryProvider } from '@/components/QueryProvider';
import { Inter_300Light, Inter_400Regular, Inter_500Medium, Inter_600SemiBold, Inter_700Bold, useFonts } from '@expo-google-fonts/inter';
import { DarkTheme, DefaultTheme, ThemeProvider } from '@react-navigation/native';
import { Stack } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import { StatusBar } from 'expo-status-bar';
import { useEffect } from 'react';
import 'react-native-reanimated';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { clearStoredCredentials } from '@/utils/biometrics';
import { useAuthStore } from '@/stores/useAuthStore';
import InactiveSessionTracker from '@/components/InactiveSessionTracker';

import { useColorScheme } from '@/hooks/use-color-scheme';
import { useProtectedRoute } from '@/hooks/useProtectedRoute';
import { usePushNotifications } from '@/hooks/usePushNotifications';

// Prevent the splash screen from auto-hiding before asset loading is complete.
SplashScreen.preventAutoHideAsync();

export const unstable_settings = {
  initialRouteName: 'index',
};

function InitialLayout() {
  useProtectedRoute();
  usePushNotifications();

  return (
    <Stack>
      <Stack.Screen name="index" options={{ headerShown: false }} />
      <Stack.Screen name="(auth)" options={{ headerShown: false }} />
      <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
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

export default function RootLayout() {
  const colorScheme = useColorScheme();
  const [loaded, error] = useFonts({
    Inter_300Light,
    Inter_400Regular,
    Inter_500Medium,
    Inter_600SemiBold,
    Inter_700Bold,
  });

  useEffect(() => {
    if (error) throw error;
  }, [error]);

  useEffect(() => {
    if (loaded) {
      SplashScreen.hideAsync();
    }
  }, [loaded]);

  useEffect(() => {
    const handleFirstRun = async () => {
      try {
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
        console.error('Error in first-run check:', err);
      }
    };
    handleFirstRun();
  }, []);

  if (!loaded) {
    return null;
  }

  return (
    <QueryProvider>
      <ThemeProvider value={colorScheme === 'dark' ? DarkTheme : DefaultTheme}>
        <InactiveSessionTracker>
          <InitialLayout />
          <GlobalToast />
          <StatusBar style="auto" />
        </InactiveSessionTracker>
      </ThemeProvider>
    </QueryProvider>
  );
}
