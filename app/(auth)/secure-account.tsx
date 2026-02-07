import ProgressBar from '@/components/ProgressBar';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { Lock, TickCircle } from 'iconsax-react-nativejs';
import React, { useState } from 'react';
import { KeyboardAvoidingView, Platform, ScrollView, Text, View } from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { moderateScale, ScaledSheet } from 'react-native-size-matters';
import AuthHeader from '../../components/AuthHeader';
import InputField from '../../components/InputField';
import PrimaryButton from '../../components/PrimaryButton';
import { Colors } from '../../constants/theme';

export default function SecureAccountScreen() {
    const router = useRouter();
    const { type } = useLocalSearchParams<{ type?: string }>();
    const insets = useSafeAreaInsets();
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');

    const handleCreatePassword = () => {
        if (password && password === confirmPassword) {
            console.log('Password created');
            router.replace('/(auth)/login');
        }
    };

    // Password validation logic
    const validatePassword = (pass: string) => ({
        hasMinLength: pass.length >= 8,
        hasUppercase: /[A-Z]/.test(pass),
        hasLowercase: /[a-z]/.test(pass),
        hasNumber: /[0-9]/.test(pass),
        hasSpecialChar: /[!@#$%^&*+\-?]/.test(pass),
    });

    const validations = validatePassword(password);
    const isPasswordValid = Object.values(validations).every(Boolean);

    const ValidationItem = ({ label, isValid }: { label: string; isValid: boolean }) => (
        <View style={styles.validationRow}>
            <TickCircle
                size={moderateScale(18)}
                color={isValid ? '#10B981' : 'rgba(77, 75, 75, 1)'}
                variant={isValid ? "Bold" : "Outline"}
                style={styles.validationIcon}
            />
            <Text style={[styles.validationText, isValid && styles.validationTextValid]}>
                {label}
            </Text>
        </View>
    );

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
                        { paddingBottom: insets.bottom + 100 } // Increased padding for footer
                    ]}
                    showsVerticalScrollIndicator={false}
                >

                    {type === 'reset-password' ? null : <ProgressBar step={3} totalSteps={3} />}
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

                        <View style={styles.validationBox}>
                            <ValidationItem label="Minimum 8 of character long" isValid={validations.hasMinLength} />
                            <ValidationItem label="One uppercase letter" isValid={validations.hasUppercase} />
                            <ValidationItem label="One lowercase letter" isValid={validations.hasLowercase} />
                            <ValidationItem label="One number 0-9" isValid={validations.hasNumber} />
                            <ValidationItem label="One special charater (!@#$%^&*+-?)" isValid={validations.hasSpecialChar} />
                        </View>

                        <InputField
                            label="Confirm new Password"
                            placeholder="Confirm new password"
                            value={confirmPassword}
                            onChangeText={setConfirmPassword}
                            isPassword
                            icon={Lock}
                            required
                            disabled={!confirmPassword}
                        />
                    </View>
                </ScrollView>

                <View style={[styles.footer, { paddingBottom: insets.bottom + 20 }]}>
                    <PrimaryButton
                        title="Create Password"
                        onPress={handleCreatePassword}
                        disabled={!isPasswordValid || password !== confirmPassword}
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
    validationBox: {
        backgroundColor: '#FFFFFF',
        padding: '10@ms',
        marginBottom: '20@vs',
        gap: '14@vs',
    },
    validationRow: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    validationIcon: {
        marginRight: '12@s',
    },
    validationText: {
        fontSize: '13@ms',
        color: 'rgba(77, 75, 75, 1)',
        fontWeight: '400',
    },
    validationTextValid: {
        color: '#111827',
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
