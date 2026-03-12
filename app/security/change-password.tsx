import Header from '@/components/Header';
import InputField from '@/components/InputField';
import PasswordStrengthValidator, { validatePassword } from '@/components/PasswordStrengthValidator';
import PrimaryButton from '@/components/PrimaryButton';
import ProgressBar from '@/components/ProgressBar';
import { useChangePasswordMutation } from '@/hooks/queries/user/useChangePasswordMutation';
import { useRouter } from 'expo-router';
import { Lock } from 'iconsax-react-nativejs';
import React, { useState } from 'react';
import { KeyboardAvoidingView, Platform, ScrollView, Text, View } from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { ScaledSheet } from 'react-native-size-matters';

export default function ChangePasswordScreen() {
    const router = useRouter();
    const insets = useSafeAreaInsets();
    const [step, setStep] = useState(1);
    const [currentPassword, setCurrentPassword] = useState('');
    const [confirmCurrentPassword, setConfirmCurrentPassword] = useState('');
    const [newPassword, setNewPassword] = useState('');
    const [confirmNewPassword, setConfirmNewPassword] = useState('');

    const { mutate: changePassword, isPending } = useChangePasswordMutation();

    const handleContinue = () => {

        if (currentPassword && currentPassword === confirmCurrentPassword) {
            setStep(2);
        } else {
            console.warn("Passwords must match");
        }
    };

    const handleChangePassword = () => {
        const validations = validatePassword(newPassword);
        const isValid = Object.values(validations).every(Boolean);

        if (isValid && newPassword === confirmNewPassword) {

            changePassword({ oldPassword: currentPassword, newPassword }, {
                onSuccess: () => {
                    router.back();
                }
            });
        } else {
            console.warn("Invalid new password");
        }
    };

    const validations = validatePassword(newPassword);
    const isNewPasswordValid = Object.values(validations).every(Boolean);

    return (
        <SafeAreaView style={styles.container}>
            <Header title={step === 1 ? "Change Password" : "Create New Password"} />

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
                    <ProgressBar step={step} totalSteps={2} />

                    <View style={styles.content}>
                        {step === 1 ? (
                            <>
                                <Text style={styles.title}>Enter your Current Password to Continue</Text>
                                <InputField
                                    label="Current Password"
                                    placeholder="****************"
                                    value={currentPassword}
                                    onChangeText={setCurrentPassword}
                                    isPassword
                                    icon={Lock}
                                    required
                                />
                                <InputField
                                    label="Confirm Current Password"
                                    placeholder="****************"
                                    value={confirmCurrentPassword}
                                    onChangeText={setConfirmCurrentPassword}
                                    isPassword
                                    icon={Lock}
                                    required
                                />
                            </>
                        ) : (
                            <>
                                <Text style={styles.title}>Create a New Password to Secure your Account</Text>
                                <InputField
                                    label="New Password"
                                    placeholder="Enter new password"
                                    value={newPassword}
                                    onChangeText={setNewPassword}
                                    isPassword
                                    icon={Lock}
                                    required
                                />

                                <PasswordStrengthValidator password={newPassword} />

                                <InputField
                                    label="Confirm new Password"
                                    placeholder="Confirm new password"
                                    value={confirmNewPassword}
                                    onChangeText={setConfirmNewPassword}
                                    isPassword
                                    icon={Lock}
                                    required
                                />
                            </>
                        )}
                    </View>
                </ScrollView>

                <View style={[styles.footer, { paddingBottom: insets.bottom + 20 }]}>
                    {step === 1 ? (
                        <PrimaryButton
                            title="Continue"
                            onPress={handleContinue}
                            disabled={!currentPassword || currentPassword !== confirmCurrentPassword}
                        />
                    ) : (
                        <PrimaryButton
                            title="Change Password"
                            onPress={handleChangePassword}
                            disabled={!isNewPasswordValid || newPassword !== confirmNewPassword}
                            style={{ backgroundColor: (isNewPasswordValid && newPassword === confirmNewPassword) ? '#FF6B2C' : '#FFCCB4' }} // Assuming primary color
                            loading={isPending}
                        />
                    )}
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
        paddingHorizontal: '20@s',
    },
    content: {
        marginTop: '24@vs',
        gap: '16@vs'
    },
    title: {
        fontSize: '16@ms',
        fontWeight: '600',
        color: '#0F172A',
        marginBottom: '8@vs',
    },
    footer: {
        position: 'absolute',
        bottom: 0,
        left: 0,
        right: 0,
        paddingHorizontal: '20@s',
        paddingTop: '12@vs',
        backgroundColor: '#FFFFFF',
        borderTopWidth: 1,
        borderTopColor: '#F1F5F9',
    },
});
