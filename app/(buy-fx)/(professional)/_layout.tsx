import { Stack } from "expo-router";

export default function ProfessionalLayout() {
    return (
        <Stack>
            <Stack.Screen name="create-professional" options={{ headerShown: false }} />
            <Stack.Screen name="view-professional" options={{ headerShown: false }} />
            <Stack.Screen name="payment" options={{ headerShown: false }} />
            <Stack.Screen name="payment-success" options={{ headerShown: false }} />
            <Stack.Screen name="request-initiated-success" options={{ headerShown: false }} />
        </Stack>
    );
}