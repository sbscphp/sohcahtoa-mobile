import { Stack } from "expo-router";

export default function TouringLayout() {
    return (
        <Stack>
            <Stack.Screen name="create-touring" options={{ headerShown: false }} />
            <Stack.Screen name="view-touring" options={{ headerShown: false }} />
            <Stack.Screen name="payment" options={{ headerShown: false }} />
            <Stack.Screen name="payment-success" options={{ headerShown: false }} />
            <Stack.Screen name="request-initiated-success" options={{ headerShown: false }} />
        </Stack>
    );
}