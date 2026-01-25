import { Stack } from 'expo-router';
import React from 'react';

export default function AuthLayout() {
    return (
        <Stack
            screenOptions={{
                headerShown: false,
                animation: 'slide_from_right',
            }}
        >
            <Stack.Screen name="login" />
            <Stack.Screen name="signup" />
            <Stack.Screen name="bvn-verification" />
            <Stack.Screen name="otp-verification" />
            <Stack.Screen name="bvn-confirmation" />
            <Stack.Screen name="secure-account" />
        </Stack>
    );
}
