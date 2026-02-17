import { useForgotPasswordMutation } from '@/hooks/queries/auth/useForgotPasswordMutation';
import { forgetPasswordSchema } from '@/lib/validations/auth';
import { useRouter } from 'expo-router';
import { Sms } from 'iconsax-react-nativejs';
import React, { useState } from 'react';
import { KeyboardAvoidingView, Platform, ScrollView, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { ScaledSheet } from 'react-native-size-matters';
import { z } from 'zod';
import AuthHeader from '../../components/AuthHeader';
import InputField from '../../components/InputField';
import PrimaryButton from '../../components/PrimaryButton';
import ProgressBar from '../../components/ProgressBar';

export default function ForgotPasswordScreen() {
    const router = useRouter();
    const insets = useSafeAreaInsets();
    const [email, setEmail] = useState('');
    const [error, setError] = useState<string>();

    const { mutate: forgotPassword, isPending } = useForgotPasswordMutation();

    const validateEmail = (value: string) => {
        try {
            forgetPasswordSchema.parse({ email: value });
            setError(undefined);
        } catch (err) {
            if (err instanceof z.ZodError) {
                setError(err.issues[0]?.message);
            }
        }
    };

    const handleContinue = () => {
        try {
            forgetPasswordSchema.parse({ email });
            setError(undefined);

            forgotPassword({ email }, {
                onSuccess: () => {
                    router.push({
                        pathname: '/(auth)/otp-verification',
                        params: {
                            type: 'reset-password',
                            email,
                            contactInfo: email,
                            target: 'email'
                        },
                    });
                }
            });
        } catch (err) {
            if (err instanceof z.ZodError) {
                setError(err.issues[0]?.message);
            }
        }
    };

    return (
        <View style={[styles.container, { paddingTop: insets.top, paddingBottom: insets.bottom }]}>
            <AuthHeader title="Forget Password" />

            <View style={styles.contentContainer}>

                <ProgressBar progress={0.5} totalSteps={2} />

                <KeyboardAvoidingView
                    behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
                    style={{ flex: 1 }}
                >
                    <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
                        <Text style={styles.title}>Enter your Email Address to Continue</Text>

                        <InputField
                            label="Email Address"
                            placeholder="Enter your email address"
                            icon={Sms}
                            value={email}
                            onChangeText={setEmail}
                            onBlur={() => validateEmail(email)}
                            keyboardType="email-address"
                            autoCapitalize="none"
                            required
                            error={error}
                        />
                    </ScrollView>
                </KeyboardAvoidingView>

                <View style={styles.footer}>
                    <PrimaryButton
                        title="Continue"
                        onPress={handleContinue}
                        disabled={!email || isPending}
                        loading={isPending}
                    />
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
    contentContainer: {
        flex: 1,
        paddingHorizontal: '20@s',
    },
    scrollContent: {
        flexGrow: 1,
    },
    title: {
        fontSize: '15@ms',
        fontWeight: '500',
        color: '#0F172A',
        marginBottom: '24@vs',
        marginTop: '8@vs',
    },
    footer: {
        paddingBottom: '20@vs',
        paddingTop: '10@vs',
    },
});
