import { Stack } from "expo-router";

export default function Layout() {
    return (
        <Stack>
            <Stack.Screen name="create-pta" options={{ headerShown: false }} />
            <Stack.Screen name="request-initiated-success" options={{ headerShown: false }} />
            <Stack.Screen name="view-pta" options={{ headerShown: false }} />
        </Stack>
    )
}