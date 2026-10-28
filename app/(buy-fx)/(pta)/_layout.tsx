import { Stack } from "expo-router";

export default function Layout() {
    return (
        <Stack
            screenOptions={{
                headerShown: false,
                animation: 'ios_from_right',
                gestureEnabled: true,
                fullScreenGestureEnabled: true,
            }}
        >
            <Stack.Screen name="create-pta" options={{ headerShown: false }} />
            <Stack.Screen name="request-initiated-success" options={{ headerShown: false }} />
            <Stack.Screen name="view-pta" options={{ headerShown: false }} />
            <Stack.Screen name="payment" options={{ headerShown: false }} />
            <Stack.Screen name="payment-success" options={{ headerShown: false }} />
        </Stack>
    )
}