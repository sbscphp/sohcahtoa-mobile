import { Stack } from 'expo-router';
import React from 'react';
import { StyleSheet } from 'react-native';

export default function TouristLayout() {
    return (
        <Stack>
            <Stack.Screen name="create-tourist" options={{ headerShown: false }} />
            <Stack.Screen name="success" options={{ headerShown: false }} />
            <Stack.Screen name="view-tourist" options={{ headerShown: false }} />
            <Stack.Screen name="payment" options={{ headerShown: false }} />
            <Stack.Screen name="payment-success" options={{ headerShown: false }} />
        </Stack>
    );
}

const styles = StyleSheet.create({});