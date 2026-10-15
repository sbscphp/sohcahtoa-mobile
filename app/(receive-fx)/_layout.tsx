import { Stack } from 'expo-router';

export default function ReceiveFxLayout() {
    return (
        <Stack screenOptions={{ headerShown: false }}>
            <Stack.Screen name="imto" />
            <Stack.Screen name="verification-result" />
            <Stack.Screen name="receiving-options" />
            <Stack.Screen name="pickup-location" />
            <Stack.Screen name="split-payment" />
            <Stack.Screen name="disbursement-options" />
            <Stack.Screen name="success" />
            <Stack.Screen name="view-receive-fx" />
        </Stack>
    );
}
