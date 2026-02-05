import { Stack } from "expo-router";

export default function Layout() {
    return (
        <Stack>
            <Stack.Screen name="(pta)" options={{ headerShown: false }} />
            <Stack.Screen name="(bta)" options={{ headerShown: false }} />
            <Stack.Screen name="(medical)" options={{ headerShown: false }} />
            <Stack.Screen name="(professional)" options={{ headerShown: false }} />
            <Stack.Screen name="(school)" options={{ headerShown: false }} />
            <Stack.Screen name="(touring)" options={{ headerShown: false }} />
        </Stack>
    )
}