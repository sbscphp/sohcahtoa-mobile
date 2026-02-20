import SuccessScreen from '@/components/SuccessScreen';
import { useRouter } from 'expo-router';
import React from 'react';
import { ScaledSheet } from 'react-native-size-matters';
export default function ReceiveSuccessScreen() {
    const router = useRouter();

    return (
       
        <SuccessScreen
            headerTitle="Payment Successfully"
            title="Transaction Completed Successfully"
            description="Your payment has been received and your funds will be released soon."
            onViewTransaction={() => {
                // Navigate to details or history
                router.push('/(receive-fx)/view-receive-fx');
            }}
            onGoHome={() => router.push('/(tabs)')}
            primaryButtonText="View Transaction"
        />
    );
}

const styles = ScaledSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#FFFFFF', // Design shows a very light background maybe? Assuming white or very light gray. 
        // Based on other screens, standardizing on white.
        justifyContent: 'center',
        paddingHorizontal: '20@ms',
    },
    content: {
        alignItems: 'center',
    },
    iconContainer: {
        marginBottom: '24@vs',
    },
    iconCircleOuter: {
        width: '80@ms',
        height: '80@ms',
        borderRadius: '40@ms',
        // Dashed border effect or just multiple rings? 
        // Using a simple styled ring for now to match "green check" vibe
        borderWidth: 2,
        borderColor: '#4ADE80', // Green 400
        borderStyle: 'dashed',
        justifyContent: 'center',
        alignItems: 'center',
    },
    iconCircleInner: {
        width: '56@ms',
        height: '56@ms',
        borderRadius: '28@ms',
        backgroundColor: '#22C55E', // Green 500
        justifyContent: 'center',
        alignItems: 'center',
    },
    title: {
        fontSize: '18@ms',
        fontWeight: '700',
        color: '#0F172A',
        textAlign: 'center',
        marginBottom: '8@vs',
    },
    subtitle: {
        fontSize: '14@ms',
        color: '#64748B',
        textAlign: 'center',
        lineHeight: '20@ms',
        marginBottom: '32@vs',
        paddingHorizontal: '20@ms',
    },
    actions: {
        width: '100%',
        gap: '12@vs',
    },
    secondaryButton: {
        backgroundColor: '#F8FAFC', // Light gray/slate
        borderRadius: '30@ms',
        paddingVertical: '16@vs',
        alignItems: 'center',
    },
    secondaryButtonText: {
        color: '#0F172A',
        fontSize: '14@ms',
        fontWeight: '600',
    }
});
