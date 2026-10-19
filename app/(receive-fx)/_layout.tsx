import { Stack } from 'expo-router';

export default function ReceiveFxLayout() {
    return (
        <Stack screenOptions={{ headerShown: false }}>
            <Stack.Screen name="imto" />
            <Stack.Screen name="success" />
            <Stack.Screen name="view-receive-fx" />
        </Stack>
    );
}
