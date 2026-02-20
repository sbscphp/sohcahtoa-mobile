import { Stack } from 'expo-router';

export default function ReceiveFxLayout() {
    return (
        <Stack screenOptions={{ headerShown: false }}>
            <Stack.Screen name="imto" />
            <Stack.Screen name="verification-result" />
            <Stack.Screen name="receiving-options" />
            <Stack.Screen name="select-bank" />
        </Stack>
    );
}
