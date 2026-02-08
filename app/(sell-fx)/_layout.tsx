import { Stack } from 'expo-router';
import React from 'react';
import { StyleSheet } from 'react-native';

export default function SellFxLayout() {
    return (
        <Stack>
            <Stack.Screen name="(tourist)" options={{ headerShown: false }} />
            <Stack.Screen name="(resident)" options={{ headerShown: false }} />
            <Stack.Screen name="(expatriate)" options={{ headerShown: false }} />
        </Stack>
    );
}

const styles = StyleSheet.create({});