import PasswordStrengthValidator, { validatePassword } from '@/components/PasswordStrengthValidator';
import ProgressBar from '@/components/ProgressBar';
import { useCreateAccountMutation } from '@/hooks/queries/auth/useCreateAccountMutation';
import { useCreateExpatriateAccountMutation } from '@/hooks/queries/auth/useCreateExpatriateAccountMutation';
import { useCreateTouristAccountMutation } from '@/hooks/queries/auth/useCreateTouristAccountMutation';
import { useResetPasswordMutation } from '@/hooks/queries/auth/useResetPasswordMutation';
import { useAuthStore } from '@/stores/useAuthStore';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { Lock } from 'iconsax-react-nativejs';
import React, { useState } from 'react';
import { KeyboardAvoidingView, Platform, ScrollView, Text, View } from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { ScaledSheet } from 'react-native-size-matters';
import AuthHeader from '../../components/AuthHeader';
import InputField from '../../components/InputField';
import PrimaryButton from '../../components/PrimaryButton';
import { Colors } from '../../constants/theme';

export default function SecureAccountScreen() {
    const router = useRouter();
    const { type, userType, resetToken } = useLocalSearchParams<{ type?: string; userType?: string; resetToken?: string }>();
    const insets = useSafeAreaInsets();
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');

    const { mutate: createAccount, isPending: isCreatingNigerian } = useCreateAccountMutation();
    const { mutate: createTouristAccount, isPending: isCreatingTourist } = useCreateTouristAccountMutation();
    const { mutate: createExpatriateAccount, isPending: isCreatingExpatriate } = useCreateExpatriateAccountMutation();

    const { mutate: resetPassword, isPending: isResetting } = useResetPasswordMutation();

    const isPending = isCreatingNigerian || isCreatingTourist || isCreatingExpatriate || isResetting;

    const handleCreatePassword = () => {
        if (password && password === confirmPassword) {
            if (type === 'reset-password') {
                if (resetToken) {
                    resetPassword({ resetToken, newPassword: password }, {
                        onSuccess: () => {
                            router.replace('/(auth)/login');
                        }
                    });
                }
                return;
            }

            const verificationToken = useAuthStore.getState().verificationToken;
            if (!verificationToken) return;

            const payload = {
                verificationToken,
                password
            };

            const onSuccess = () => {
                useAuthStore.getState().setTempUserInfo(null);
                router.replace('/(auth)/login');
            };

            const onError = (error: any) => {
                const errorMessage = error.response?.data?.error?.message || error.message;
                if (errorMessage === "Passport verification session expired. Please verify your passport again.") {
                    router.replace({
                        pathname: '/(auth)/passport-verification',
                        params: { userType }
                    });
                }
            };

            if (userType === 'tourist') {
                createTouristAccount(payload, { onSuccess, onError });
            } else if (userType === 'expatriate') {
                createExpatriateAccount(payload, { onSuccess, onError });
            } else if (userType === 'citizen' || !userType) {
                createAccount(payload, { onSuccess });
            }
        }
    };

    const validations = validatePassword(password);
    const isPasswordValid = Object.values(validations).every(Boolean);

    const title = type === 'reset-password' ? 'Create New Password' : 'Secure Account';

    return (
        <SafeAreaView style={styles.container}>
            <AuthHeader title={title} />
            <KeyboardAvoidingView
                behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
                style={{ flex: 1 }}
            >
                <ScrollView
                    contentContainerStyle={[
                        styles.scrollContent,
                        { paddingBottom: insets.bottom + 100 }
                    ]}
                    showsVerticalScrollIndicator={false}
                >

                    {type === 'reset-password' ? null : userType === 'citizen' && <ProgressBar step={3} totalSteps={3} />}
                    <View style={styles.content}>
                        <Text style={styles.title}>Create a Password to Secure your Account</Text>

                        <InputField
                            label="New Password"
                            placeholder="*******"
                            value={password}
                            onChangeText={setPassword}
                            isPassword
                            icon={Lock}
                            required
                            disabled={!password}
                        />

                        <PasswordStrengthValidator password={password} />

                        <InputField
                            label="Confirm new Password"
                            placeholder="Confirm new password"
                            value={confirmPassword}
                            onChangeText={setConfirmPassword}
                            isPassword
                            icon={Lock}
                            required
                        // disabled={!confirmPassword}
                        />
                    </View>
                </ScrollView>

                <View style={[styles.footer, { paddingBottom: insets.bottom + 20 }]}>
                    <PrimaryButton
                        title="Create Password"
                        onPress={handleCreatePassword}
                        disabled={!isPasswordValid || password !== confirmPassword || isPending}
                        loading={isPending}
                        style={{ backgroundColor: (isPasswordValid && password === confirmPassword) ? Colors.light.primary : '#FFCCB4' }}
                    />
                </View>
            </KeyboardAvoidingView>
        </SafeAreaView>
    );
}

const styles = ScaledSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#FFFFFF',
    },
    scrollContent: {
        paddingHorizontal: '16@s',
    },
    content: {
        marginTop: '16@vs',
    },
    title: {
        fontSize: '16@ms',
        fontWeight: '500',
        color: '#1E293B',
        marginBottom: '24@vs',
    },
    footer: {
        position: 'absolute',
        bottom: 0,
        left: 0,
        right: 0,
        paddingHorizontal: '24@s',
        paddingTop: '12@vs',
        backgroundColor: '#FFFFFF',
    },
});
