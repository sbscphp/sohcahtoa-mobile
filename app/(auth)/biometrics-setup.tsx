import { useRouter, useLocalSearchParams } from 'expo-router';
import { ScanFaceIcon } from 'lucide-react-native';
import React, { useState } from 'react';
import { Alert, Text, View } from 'react-native';
import { useAuthStore } from '@/stores/useAuthStore';
import {
    authenticateWithBiometrics,
    getBiometricCapabilities,
    saveCredentials,
} from '../../utils/biometrics';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { ScaledSheet, moderateScale } from 'react-native-size-matters';
import AuthHeader from '../../components/AuthHeader';
import PrimaryButton from '../../components/PrimaryButton';
import { Colors } from '../../constants/theme';
import { useAppTheme } from '@/hooks/useAppTheme';

type Status = 'idle' | 'scanning' | 'success' | 'failure' | 'unsupported';

export default function BiometricsSetupScreen() {
    const { colors } = useAppTheme();
    const router = useRouter();
    const insets = useSafeAreaInsets();
    const { email, password } = useLocalSearchParams<{ email: string; password: string }>();
    const setBiometricEnabled = useAuthStore((state) => state.setBiometricEnabled);
    const setBiometricType = useAuthStore((state) => state.setBiometricType);
    const checkCredentials = useAuthStore((state) => state.checkCredentials);
    const [status, setStatus] = useState<Status>('idle');
    const [loading, setLoading] = useState(false);
    const [isContinuing, setIsContinuing] = useState(false);

    const handleStart = async () => {
        setLoading(true);
        try {
            // Validate email and password before proceeding with biometrics setup
            if (!email || !password) {
                Alert.alert('Setup Error', 'Email and password are required to set up biometrics. Please go back and ensure both are filled.');
                setStatus('idle');
                setLoading(false);
                return;
            }

            const capabilities = await getBiometricCapabilities();
            if (!capabilities.hasHardware) {
                Alert.alert('Not Supported', 'Your device does not support biometric authentication.');
                setLoading(false);
                return;
            }

            if (!capabilities.isEnrolled) {
                Alert.alert('Not Enrolled', 'Please enroll your face or biometric in device settings.');
                setLoading(false);
                return;
            }

            const success = await authenticateWithBiometrics('Authenticate with Face ID');

            if (success) {
                const saved = await saveCredentials(email, password);
                if (saved) {
                    setBiometricEnabled(true);
                    setBiometricType('face');
                    if (typeof checkCredentials === 'function') {
                        await checkCredentials();
                    }
                    setStatus('success');
                } else {
                    Alert.alert('Save Error', 'Failed to securely store credentials. Please try again.');
                    setStatus('failure');
                }
            } else {
                setStatus('idle');
            }
        } catch (error) {
            console.error('Face ID Error:', error);
            setStatus('failure');
        } finally {
            setLoading(false);
        }
    };

    const handleContinue = () => {
        setIsContinuing(true);
        router.replace('/(tabs)');
    };

    return (
        <View style={[styles.container, { paddingTop: insets.top, paddingBottom: insets.bottom, backgroundColor: colors.background }]}>
            <AuthHeader title="Biometrics Setup" />

            <View style={styles.content}>
                <View style={styles.textSection}>
                    <Text style={[styles.title, { color: colors.text }]}>Face Recognition</Text>
                    <Text style={[styles.description, { color: colors.textMuted }]}>
                        Add a face recognition to make your account more secure.
                    </Text>
                </View>

                <View style={styles.graphicContainer}>
                    <View style={[styles.circleOuter, { backgroundColor: colors.primary }]} />
                    <View style={[styles.circleMiddle, { backgroundColor: colors.primary }]} />
                    {status !== 'scanning' && status !== 'success' && (
                        <View style={[styles.circleInner, { backgroundColor: colors.primary }]}>
                            <ScanFaceIcon size={moderateScale(64)} color="#FFFFFF" />
                        </View>
                    )}
                    {status === 'success' && (
                         <View style={[styles.circleInner, { backgroundColor: '#22C55E' }]}>
                            <ScanFaceIcon size={moderateScale(64)} color="#FFFFFF" />
                         </View>
                    )}
                </View>

                <View style={styles.footer}>
                    {status === 'success' ? (
                         <PrimaryButton
                            title="Continue"
                            onPress={handleContinue}
                            loading={isContinuing}
                         />
                    ) : (
                        <PrimaryButton
                            title={loading ? "Authenticating..." : "Start"}
                            onPress={handleStart}
                            loading={loading}
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
    },
    circleOuter: {
        position: 'absolute',
        width: '280@ms',
        height: '280@ms',
        borderRadius: '140@ms',
        backgroundColor: Colors.light.primary,
        opacity: 0.1,
    },
    circleMiddle: {
        position: 'absolute',
        width: '200@ms',
        height: '200@ms',
        borderRadius: '100@ms',
        backgroundColor: Colors.light.primary,
        opacity: 0.3, // Slightly darker
    },
    circleInner: {
        width: '120@ms',
        height: '120@ms',
        borderRadius: '60@ms',
        backgroundColor: Colors.light.primary,
        justifyContent: 'center',
        alignItems: 'center',
    },
    footer: {
        marginBottom: '20@vs',
    },
});
