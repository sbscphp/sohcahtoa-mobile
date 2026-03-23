import BiometricBottomSheet from '@/components/BiometricBottomSheet';
import { useLoginMutation } from '@/hooks/queries/auth/useLoginMutation';
import { LoginFormData, loginSchema } from '@/lib/validations/auth';
import { useRouter } from 'expo-router';
import { Lock, Sms } from 'iconsax-react-nativejs';
import { ScanFaceIcon } from 'lucide-react-native';
import React, { useState } from 'react';
import { KeyboardAvoidingView, Platform, ScrollView, Text, TouchableOpacity, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { ScaledSheet, moderateScale } from 'react-native-size-matters';
import { z } from 'zod';
import UserSharing from '../../assets/icons/user-sharing.svg';
import AuthHeader from '../../components/AuthHeader';
import BiometricSelectionSheet from '../../components/BiometricSelectionSheet';
import InputField from '../../components/InputField';
import PrimaryButton from '../../components/PrimaryButton';
import { Colors } from '../../constants/theme';
import { useAuthStore } from '@/stores/useAuthStore';

export default function LoginScreen() {
    const router = useRouter();
    const insets = useSafeAreaInsets();
    const user = useAuthStore((state) => state.user);
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [errors, setErrors] = useState<Partial<Record<keyof LoginFormData, string>>>({});
    const [showBiometricSheet, setShowBiometricSheet] = useState(false);
    const [showBiometricBottomSheet, setShowBiometricBottomSheet] = useState(false);
     const userName =  `${user?.profile?.firstName} ${user?.profile?.lastName}`;

    const { mutate: login, isPending } = useLoginMutation();

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

            login({ email, password }, {
                onSuccess: (response) => {
                    if (response.success) {
                        router.replace('/(tabs)');
                    }
                }
            });
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
                            style={styles.biometricButton}
                            onPress={() => setShowBiometricBottomSheet(true)}
                        >
                            <ScanFaceIcon size={moderateScale(42)} color="#94A3B8" />
                        </TouchableOpacity>
                    </View>

                    <View style={styles.signUpFooter}>
                        <Text style={styles.notUserText}>{user ? `Not ${userName} ?` : 'Don\'t have an account?'} </Text>
                        <TouchableOpacity onPress={handleSignUp}>
                            <Text style={styles.signUpText}>Sign Up</Text>
                        </TouchableOpacity>
                    </View>
                </ScrollView>
            </KeyboardAvoidingView>

            <BiometricBottomSheet
                visible={showBiometricBottomSheet}
                onClose={() => setShowBiometricBottomSheet(false)}
                onConfirm={() => {
                    setShowBiometricSheet(true);
                    setShowBiometricBottomSheet(false);
                }}
            />

            <BiometricSelectionSheet
                visible={showBiometricSheet}
                onClose={() => setShowBiometricSheet(false)}
                onSelectFace={() => {
                    setShowBiometricSheet(false);
                    router.push('/(auth)/biometrics-setup');
                }}
                onSelectFingerprint={() => {
                    setShowBiometricSheet(false);
                    router.push('/(auth)/fingerprint-setup');
                }}
            />
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
