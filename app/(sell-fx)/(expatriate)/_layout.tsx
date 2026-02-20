import { Stack } from 'expo-router';

export default function ExpatriateLayout() {
    return (
        <Stack>
            <Stack.Screen name="create-expatriate" options={{ headerShown: false }} />
            <Stack.Screen name="view-expatriate" options={{ headerShown: false }} />
            <Stack.Screen name="payment" options={{ headerShown: false }} />
            <Stack.Screen name="payment-success" options={{ headerShown: false }} />
            <Stack.Screen name="success" options={{ headerShown: false }} />
        </Stack>
    );
}
