import { Stack } from "expo-router";

export default function BtaLayout() {
    return (
        <Stack>
            <Stack.Screen name="create-bta" options={{ headerShown: false }} />
            <Stack.Screen name="view-bta" options={{ headerShown: false }} />
            <Stack.Screen name="payment" options={{ headerShown: false }} />
            <Stack.Screen name="payment-success" options={{ headerShown: false }} />
            <Stack.Screen name="request-initiated-success" options={{ headerShown: false }} />
        </Stack>
    );
}