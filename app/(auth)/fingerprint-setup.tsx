import * as LocalAuthentication from 'expo-local-authentication';
import { useRouter } from 'expo-router';
import { Fingerprint } from 'lucide-react-native';
import React, { useEffect, useState } from 'react';
import { Alert, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { ScaledSheet, moderateScale } from 'react-native-size-matters';
import AuthHeader from '../../components/AuthHeader';
import PrimaryButton from '../../components/PrimaryButton';
import { Colors } from '../../constants/theme';

type Status = 'idle' | 'scanning' | 'success' | 'failure' | 'unsupported';

export default function FingerprintSetupScreen() {
    const router = useRouter();
    const insets = useSafeAreaInsets();
    const [status, setStatus] = useState<Status>('idle');
    const [hasHardware, setHasHardware] = useState(false);
    const [isEnrolled, setIsEnrolled] = useState(false);

    // Check biometric hardware availability on mount
    useEffect(() => {
        checkBiometricAvailability();
    }, []);

    const checkBiometricAvailability = async () => {
        try {
            const compatible = await LocalAuthentication.hasHardwareAsync();
            setHasHardware(compatible);

            if (compatible) {
                const enrolled = await LocalAuthentication.isEnrolledAsync();
                setIsEnrolled(enrolled);

                if (!enrolled) {
                    setStatus('unsupported');
                }
            } else {
                setStatus('unsupported');
            }
        } catch (error) {
            console.error('Error checking biometric availability:', error);
            setStatus('unsupported');
        }
    };

    const handleStart = async () => {
        if (!hasHardware) {
            Alert.alert(
                'Not Supported',
                'Your device does not support biometric authentication.',
                [{ text: 'OK' }]
            );
            return;
        }

        if (!isEnrolled) {
            Alert.alert(
                'No Biometrics Enrolled',
                'Please enroll your fingerprint in your device settings first.',
                [{ text: 'OK' }]
            );
            return;
        }

        setStatus('scanning');

        try {
            const result = await LocalAuthentication.authenticateAsync({
                promptMessage: 'Authenticate with your fingerprint',
                fallbackLabel: 'Use passcode',
                cancelLabel: 'Cancel',
            });

            if (result.success) {
                setStatus('success');
            } else {
                // Authentication failed or was cancelled
                if (result.error === 'user_cancel') {
                    setStatus('idle');
                } else {
                    setStatus('failure');
                }
            }
        } catch (error) {
            console.error('Authentication error:', error);
            setStatus('failure');
        }
    };

    const handleRetry = () => {
        handleStart();
    };

    const handleContinue = () => {
        // Navigate to the next screen, presumably tabs as this completes setup
        router.push('/(tabs)');
    };

    const getStatusUI = () => {
        switch (status) {
            case 'scanning':
                return {
                    color: Colors.light.primary,
                    text: 'Scanning...',
                    description: 'Please authenticate with your fingerprint.',
                    iconColor: '#FFFFFF',
                    borderColor: Colors.light.primary,
                    borderStyle: 'dashed' as const
                };
            case 'success':
                return {
                    color: '#22C55E', // Green-500
                    text: 'Verification Successful',
                    description: 'Your fingerprint is now verified.',
                    iconColor: '#15803D', // Green-700
                    borderColor: '#22C55E', // Green-500
                    borderStyle: 'dashed' as const
                };
            case 'failure':
                return {
                    color: '#EF4444', // Red-500
                    text: 'Verification Failed',
                    description: "We couldn't verify your fingerprint. Please try again.",
                    iconColor: '#B91C1C', // Red-700
                    borderColor: '#EF4444', // Red-500
                    borderStyle: 'dashed' as const
                };
            case 'unsupported':
                return {
                    color: '#94A3B8', // Gray-400
                    text: 'Not Available',
                    description: hasHardware
                        ? 'Please enroll your fingerprint in device settings first.'
                        : 'Your device does not support fingerprint authentication.',
                    iconColor: '#64748B', // Gray-500
                    borderColor: '#94A3B8',
                    borderStyle: 'solid' as const
                };
            case 'idle':
            default:
                return {
                    color: Colors.light.primary,
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
                    {/* Background Circles */}
                    <View style={[styles.circleOuter, {
                        backgroundColor: status === 'success' ? '#DCFCE7'
                            : status === 'failure' ? '#FEE2E2'
                                : status === 'unsupported' ? '#F1F5F9'
                                    : Colors.light.primary
                    }]} />
                    <View style={[styles.circleMiddle, {
                        backgroundColor: status === 'success' ? '#86EFAC'
                            : status === 'failure' ? '#FCA5A5'
                                : status === 'unsupported' ? '#CBD5E1'
                                    : Colors.light.primary
                    }]} />

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
                            title="Authenticating..."
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
                    {status === 'unsupported' && (
                        <PrimaryButton
                            title="Skip for Now"
                            onPress={handleContinue}
                            style={{ backgroundColor: '#94A3B8' }}
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
        width: '300@ms',
        height: '300@ms',
        borderRadius: '150@ms',
        borderWidth: 2,
        zIndex: 5,
    },
    footer: {
        marginBottom: '20@vs',
    },
});
