import { Stack } from 'expo-router';

export default function ResidentLayout() {
    return (
        <Stack screenOptions={{ headerShown: false }}>
            <Stack.Screen name="create-resident" />
            <Stack.Screen name="success" />
            <Stack.Screen name="view-resident" />
        </Stack>
    );
}
