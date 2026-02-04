import { useRouter } from 'expo-router';
import { Fingerprint } from 'lucide-react-native';
import React, { useEffect, useState } from 'react';
import { Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { ScaledSheet, moderateScale } from 'react-native-size-matters';
import AuthHeader from '../../components/AuthHeader';
import PrimaryButton from '../../components/PrimaryButton';
import { Colors } from '../../constants/theme';

type Status = 'idle' | 'scanning' | 'success' | 'failure';

export default function FingerprintSetupScreen() {
    const router = useRouter();
    const insets = useSafeAreaInsets();
    const [status, setStatus] = useState<Status>('idle');

    // Reset status when component mounts
    useEffect(() => {
        setStatus('idle');
    }, []);

    // Handle scanning logic
    useEffect(() => {
        let timeout: NodeJS.Timeout;
        if (status === 'scanning') {
            // Simulate scanning delay
            timeout = setTimeout(() => {
                // Randomly succeed or fail for demo purposes, or default to success
                // For now, let's allow a retry flow by failing once maybe? 
                // Or just straight to success for the happy path.
                // Let's implement a simple toggle or just random:
                const isSuccess = Math.random() > 0.3;
                setStatus(isSuccess ? 'success' : 'failure');
            }, 2000);
        }
        return () => clearTimeout(timeout);
    }, [status]);

    const handleStart = () => {
        setStatus('scanning');
    };

    const handleRetry = () => {
        setStatus('scanning');
    };

    const handleContinue = () => {
        // Navigate to the next screen, presumably tabs as this completes setup
        router.push('/(tabs)');
    };

    const getStatusUI = () => {
        switch (status) {
            case 'scanning':
                return {
                    color: Colors.light.primary, // Keep primary but maybe animate?
                    text: 'Scanning...',
                    description: 'Please hold your finger on the sensor.',
                    iconColor: '#FFFFFF',
                    borderColor: Colors.light.primary,
                    borderStyle: 'dashed' as const
                };
            case 'success':
                return {
                    color: '#22C55E', // Green-500
                    text: 'Verification Successful',
                    description: 'Your fingerprints is now verified.',
                    iconColor: '#15803D', // Green-700
                    borderColor: '#22C55E', // Green-500
                    borderStyle: 'dashed' as const
                };
            case 'failure':
                return {
                    color: '#EF4444', // Red-500
                    text: 'Verification Failed',
                    description: "We couldn't verify your finger print",
                    iconColor: '#B91C1C', // Red-700
                    borderColor: '#EF4444', // Red-500
                    borderStyle: 'dashed' as const
                };
            case 'idle':
            default:
                return {
                    color: Colors.light.primary, // Orange
                    text: 'Fingerprint Setup',
                    description: 'Add a fingerprint recognition to make your account more secure.',
                    iconColor: '#FFFFFF',
                    borderColor: 'transparent',
                    borderStyle: 'solid' as const
                };
        }
    };

    const uiState = getStatusUI();

    return (
        <View style={[styles.container, { paddingTop: insets.top, paddingBottom: insets.bottom }]}>
            <AuthHeader title="Biometrics Setup" />

            <View style={styles.content}>
                <View style={styles.textSection}>
                    <Text style={styles.title}>{status === 'idle' ? 'Fingerprint Setup' : uiState.text}</Text>
                    <Text style={[styles.description, status !== 'idle' && status !== 'scanning' && { color: uiState.color }]}>
                        {uiState.description}
                    </Text>
                </View>

                <View style={styles.graphicContainer}>
                    {/* Background Circles - only show in idle or scanning maybe? Or change color based on state */}
                    <View style={[styles.circleOuter, { backgroundColor: status === 'success' ? '#DCFCE7' : status === 'failure' ? '#FEE2E2' : Colors.light.primary }]} />
                    <View style={[styles.circleMiddle, { backgroundColor: status === 'success' ? '#86EFAC' : status === 'failure' ? '#FCA5A5' : Colors.light.primary }]} />

                    {/* Ring Border for active states */}
                    {status !== 'idle' && (
                        <View style={[
                            styles.dashedBorder,
                            {
                                borderColor: uiState.borderColor,
                                borderStyle: uiState.borderStyle
                            }
                        ]} />
                    )}

                    <View style={[
                        styles.circleInner,
                        {
                            backgroundColor: status === 'idle' ? Colors.light.primary : 'transparent',
                            // For Success/Failure, inner might be transparent to show icon on middle circle or distinct?
                            // Design shows:
                            // Success: Light Green BG with Green Outline Icon
                            // Failure: Light Red BG with Red Outline Icon
                            // Idle: Solid Orange BG with White Filled/Outline Icon
                        }
                    ]}>
                        <Fingerprint
                            size={moderateScale(64)}
                            color={status === 'idle' ? '#FFFFFF' : uiState.iconColor}
                        />
                    </View>
                </View>

                <View style={styles.footer}>
                    {status === 'idle' && (
                        <PrimaryButton
                            title="Start"
                            onPress={handleStart}
                        />
                    )}
                    {status === 'scanning' && (
                        <PrimaryButton
                            title="Scanning..."
                            onPress={() => { }} // No-op
                            style={{ opacity: 0.7 }}
                        />
                    )}
                    {status === 'success' && (
                        <PrimaryButton
                            title="Continue"
                            onPress={handleContinue}
                        />
                    )}
                    {status === 'failure' && (
                        <PrimaryButton
                            title="Retry"
                            onPress={handleRetry}
                        />
                    )}
                </View>
            </View>
        </View>
    );
}

const styles = ScaledSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#FFFFFF',
    },
    content: {
        flex: 1,
        paddingHorizontal: '24@s',
        paddingTop: '32@vs',
    },
    textSection: {
        marginBottom: '48@vs',
    },
    title: {
        fontSize: '18@ms',
        fontWeight: '700',
        color: '#0F172A',
        marginBottom: '8@vs',
    },
    description: {
        fontSize: '14@ms',
        color: '#64748B',
        lineHeight: '22@ms',
    },
    graphicContainer: {
        alignItems: 'center',
        justifyContent: 'center',
        flex: 1,
        marginBottom: '40@vs',
        position: 'relative',
    },
    circleOuter: {
        position: 'absolute',
        width: '280@ms',
        height: '280@ms',
        borderRadius: '140@ms',
        opacity: 0.2,
    },
    circleMiddle: {
        position: 'absolute',
        width: '200@ms',
        height: '200@ms',
        borderRadius: '100@ms',
        opacity: 0.5,
    },
    circleInner: {
        width: '120@ms',
        height: '120@ms',
        borderRadius: '60@ms',
        justifyContent: 'center',
        alignItems: 'center',
        zIndex: 10,
    },
    dashedBorder: {
        position: 'absolute',
        width: '300@ms', // Slightly larger than outer
        height: '300@ms',
        borderRadius: '150@ms',
        borderWidth: 2,
        zIndex: 5,
    },
    footer: {
        marginBottom: '20@vs',
    },
});
