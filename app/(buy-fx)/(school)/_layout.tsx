import { Stack } from "expo-router";

export default function SchoolLayout() {
    return (
        <Stack>
            <Stack.Screen name="create-school" options={{ headerShown: false }} />
            <Stack.Screen name="view-school" options={{ headerShown: false }} />
            <Stack.Screen name="payment" options={{ headerShown: false }} />
            <Stack.Screen name="payment-success" options={{ headerShown: false }} />
            <Stack.Screen name="request-initiated-success" options={{ headerShown: false }} />
        </Stack>
    );
}