import { Stack } from 'expo-router';

export default function ResidentLayout() {
    return (
        <Stack
            screenOptions={{
                headerShown: false,
                animation: 'ios_from_right',
                gestureEnabled: true,
                fullScreenGestureEnabled: true,
            }}
        >
            <Stack.Screen name="create-resident" />
            <Stack.Screen name="success" />
            <Stack.Screen name="view-resident" />
            <Stack.Screen name="payment" />
            <Stack.Screen name="payment-success" />
        </Stack>
    );
}
