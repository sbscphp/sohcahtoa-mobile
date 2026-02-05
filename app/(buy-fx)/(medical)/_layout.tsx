import { Stack } from "expo-router";

export default function MedicalLayout() {
    return (
        <Stack>
            <Stack.Screen name="create-medical" options={{ headerShown: false }} />
            <Stack.Screen name="view-medical" options={{ headerShown: false }} />
            <Stack.Screen name="payment" options={{ headerShown: false }} />
            <Stack.Screen name="payment-success" options={{ headerShown: false }} />
            <Stack.Screen name="request-initiated-success" options={{ headerShown: false }} />
        </Stack>
    );
}