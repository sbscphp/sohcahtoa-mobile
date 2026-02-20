import { Stack } from "expo-router";

export default function MoreLayout() {
    return (
        <Stack>
            <Stack.Screen name="profile" options={{ headerShown: false }} />
            <Stack.Screen name="support" options={{ headerShown: false }} />
            <Stack.Screen name="faqs" options={{ headerShown: false }} />
        </Stack>
    );
}