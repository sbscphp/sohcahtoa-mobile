import React, { useEffect, useState } from 'react';
import { useRouter } from 'expo-router';
import { Lock, Sms } from 'iconsax-react-nativejs';
import { Fingerprint, ScanFaceIcon } from 'lucide-react-native';
import { KeyboardAvoidingView, Platform, ScrollView, Text, TouchableOpacity, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { ScaledSheet, moderateScale } from 'react-native-size-matters';
import { z } from 'zod';

import { useToastStore } from '@/stores/useToastStore';
import { useLoginMutation } from '@/hooks/queries/auth/useLoginMutation';
import { LoginFormData, loginSchema } from '@/lib/validations/auth';
import UserSharing from '../../assets/icons/user-sharing.svg';
import AuthHeader from '../../components/AuthHeader';
import InputField from '../../components/InputField';
import PrimaryButton from '../../components/PrimaryButton';
import { authenticateWithBiometrics, clearStoredCredentials, getStoredCredentials, isBiometricsAvailable } from '../../utils/biometrics';
import { Colors } from '../../constants/theme';
import { useAuthStore } from '@/stores/useAuthStore';
import { getSupportedAuthenticationTypes } from '@/utils/biometrics';

export default function LoginScreen() {
    const router = useRouter();
    const insets = useSafeAreaInsets();
   
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [errors, setErrors] = useState<Partial<Record<keyof LoginFormData, string>>>({});
    const [biometricsSupported, setBiometricsSupported] = useState(false);

    const user = useAuthStore((state) => state.user)
    const isBiometricEnabled = useAuthStore((state) => state.isBiometricEnabled);
    const biometricType = useAuthStore((state) => state.biometricType);
    const setBiometricType = useAuthStore((state) => state.setBiometricType);
    const isAuthenticated = useAuthStore((state) => state.isAuthenticated);
    const hasCredentials = useAuthStore((state) => state.hasCredentials);
    const checkCredentials = useAuthStore((state) => state.checkCredentials);
    const showToast = useToastStore((state) => state.showToast);

    const userName =  `${user?.profile?.firstName} ${user?.profile?.lastName}`;

    const { mutate: login, isPending } = useLoginMutation();

    useEffect(() => {
        const checkBiometrics = async () => {
            const available = await isBiometricsAvailable();
            setBiometricsSupported(available);

            await checkCredentials();
            if (available && !biometricType) {
                const types = await getSupportedAuthenticationTypes();
                if (types.includes(2)) {
                    setBiometricType('face');
                } else if (types.includes(1)) {
                    setBiometricType('fingerprint');
                }
            }

            if (isBiometricEnabled && available && !isAuthenticated && !isPending) {
                const credentials = await getStoredCredentials();
                if (credentials) {
                    handleBiometricLogin();
                }
            }
        };
        checkBiometrics();
    }, [isAuthenticated, isBiometricEnabled]);


    const handleBiometricLogin = async () => {
        const success = await authenticateWithBiometrics();
        if (success) {
            useAuthStore.getState().setBiometricEnabled(true);
            const credentials = await getStoredCredentials();
            if (credentials) {
                setEmail(credentials.email);
                setPassword(credentials.password);
                login({ email: credentials.email, password: credentials.password });
            } else {
                showToast('Biometric credentials not found. Please login manually.', 'warning');
            }
        }
    };

    const handleBiometricPress = () => {
        if (hasCredentials) {
            handleBiometricLogin();
        } else if (biometricsSupported) {
            if (biometricType) {
                router.push({
                    pathname: biometricType === 'face' ? '/(auth)/biometrics-setup' : '/(auth)/fingerprint-setup',
                    params: { email, password }
                });
            }
        }
    };

    const validateField = (field: keyof LoginFormData, value: string) => {
        try {
            loginSchema.shape[field].parse(value);
            setErrors(prev => ({ ...prev, [field]: undefined }));
        } catch (error) {
            if (error instanceof z.ZodError) {
                setErrors(prev => ({ ...prev, [field]: error.issues[0]?.message }));
            }
        }
    };

    const handleLogin = () => {
        try {
            loginSchema.parse({ email, password });
            setErrors({});

            login({ email, password });
        } catch (error) {
            if (error instanceof z.ZodError) {
                const fieldErrors: Partial<Record<keyof LoginFormData, string>> = {};
                error.issues.forEach((err: z.ZodIssue) => {
                    if (err.path[0]) {
                        fieldErrors[err.path[0] as keyof LoginFormData] = err.message;
                    }
                });
                setErrors(fieldErrors);
            }
        }
    };

    const handleSignUp = () => {
        router.push('/signup');
    };

    return (
        <View style={[styles.container, { paddingTop: insets.top, paddingBottom: insets.bottom }]}>
            <AuthHeader title="Login" disableBackButton={true} />

            <KeyboardAvoidingView
                behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
                style={styles.keyboardAvoidingView}
            >
                <ScrollView
                    contentContainerStyle={styles.scrollContent}
                    showsVerticalScrollIndicator={false}
                >
                    <View style={styles.welcomeSection}>
                        <View style={styles.avatarPlaceholder}>
                            <UserSharing width={moderateScale(28)} height={moderateScale(28)} color={Colors.light.primary} />
                        </View>
                        <View>
                            <Text style={styles.welcomeTitle}>Welcome to SohCahToa BDC</Text>
                            <Text style={styles.welcomeSubtitle}>Login to Continue</Text>
                        </View>
                    </View>

                    <View style={styles.form}>
                        <InputField
                            label="Email Address"
                            placeholder="Enter your email address"
                            icon={Sms}
                            value={email}
                            onChangeText={setEmail}
                            onBlur={() => validateField('email', email)}
                            keyboardType="email-address"
                            autoCapitalize="none"
                            required
                            error={errors.email}
                        />

                        <InputField
                            label="Password"
                            placeholder="Enter your password"
                            icon={Lock}
                            value={password}
                            onChangeText={setPassword}
                            onBlur={() => validateField('password', password)}
                            isPassword
                            required
                            error={errors.password}
                        />

                        <PrimaryButton
                            title="Login"
                            onPress={handleLogin}
                            style={styles.loginButton}
                            disabled={!email || !password || isPending}
                            loading={isPending}
                        />

                        <TouchableOpacity
                            onPress={() => router.push('/(auth)/forget-password')}
                            style={styles.forgotPassword}
                        >
                            <Text style={styles.forgotPasswordText}>Forget Password ?</Text>
                        </TouchableOpacity>
                    </View>

                    <View style={styles.biometricSection}>
                        <TouchableOpacity
                            style={[
                                styles.biometricButton,
                                !biometricsSupported && { opacity: 0.3 },
                                biometricsSupported && !hasCredentials && { opacity: 0.6 }
                            ]}
                            onPress={handleBiometricPress}
                            disabled={!biometricsSupported}
                        >
                            {biometricType === 'fingerprint' ? (
                                <Fingerprint size={moderateScale(42)} color="#94A3B8" />
                            ) : (
                                <ScanFaceIcon size={moderateScale(42)} color="#94A3B8" />
                            )}
                        </TouchableOpacity>

                        {biometricType && (
                            <TouchableOpacity 
                                onPress={async () => {
                                    await clearStoredCredentials();
                                    useAuthStore.getState().setBiometricType(null);
                                    useAuthStore.getState().setBiometricEnabled(false);
                                    await useAuthStore.getState().checkCredentials();
                                    showToast('Biometric preference and credentials reset', 'success');
                                }}
                                style={{ marginTop: moderateScale(10) }}
                            >
                                <Text style={{ fontSize: moderateScale(12), color: '#EF4444', fontWeight: '500' }}>
                                    Reset Biometric Preference
                                </Text>
                            </TouchableOpacity>
                        )}
                    </View>

                    <View style={styles.signUpFooter}>
                        <Text style={styles.notUserText}>{user ? `Not ${userName} ?` : 'Don\'t have an account?'} </Text>
                        <TouchableOpacity onPress={handleSignUp}>
                            <Text style={styles.signUpText}>Sign Up</Text>
                        </TouchableOpacity>
                    </View>
                </ScrollView>
            </KeyboardAvoidingView>
        </View>
    );
}


const styles = ScaledSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#FFFFFF',
    },
    keyboardAvoidingView: {
        flex: 1,
    },
    scrollContent: {
        paddingHorizontal: '24@s',
        paddingTop: '24@vs',
        paddingBottom: '32@vs',
    },
    welcomeSection: {
        marginBottom: '24@vs',
        flexDirection: 'row',
        alignItems: 'center',
        gap: '16@ms',
    },
    avatarPlaceholder: {
        width: '45@ms',
        height: '45@ms',
        borderRadius: '28@ms',
        backgroundColor: '#FFF7F4',
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: '12@vs',
    },
    welcomeTitle: {
        fontSize: '16@ms',
        fontWeight: '500',
        color: '#0F172A',
        marginBottom: '6@vs',
    },
    welcomeSubtitle: {
        fontSize: '14@ms',
        color: '#64748B',
    },
    form: {
        width: '100%',
    },
    loginButton: {
        marginTop: '10@vs',
        marginBottom: '14@vs',
    },
    forgotPassword: {
        alignSelf: 'flex-end',
    },
    forgotPasswordText: {
        fontSize: '13@ms',
        fontWeight: '500',
        color: Colors.light.primary,
        textDecorationLine: 'underline',
    },
    biometricSection: {
        alignItems: 'center',
        marginTop: '32@vs',
        marginBottom: '32@vs',
    },
    biometricButton: {
        padding: '10@ms',
    },
    signUpFooter: {
        flexDirection: 'row',
        justifyContent: 'center',
        alignItems: 'center',
    },
    notUserText: {
        fontSize: '13@ms',
        color: '#64748B',
    },
    signUpText: {
        fontSize: '13@ms',
        fontWeight: '700',
        color: Colors.light.primary,
        textDecorationLine: 'underline',
    },
});
