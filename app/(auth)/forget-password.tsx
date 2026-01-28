import { useRouter } from 'expo-router';
import { Sms } from 'iconsax-react-nativejs';
import React, { useState } from 'react';
import { ScrollView, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { ScaledSheet } from 'react-native-size-matters';
import AuthHeader from '../../components/AuthHeader';
import InputField from '../../components/InputField';
import PrimaryButton from '../../components/PrimaryButton';
import ProgressBar from '../../components/ProgressBar';

export default function ForgotPasswordScreen() {
    const router = useRouter();
    const insets = useSafeAreaInsets();
    const [email, setEmail] = useState('');

    const handleContinue = () => {
        // Navigate to OTP verification (reusing existing OTP screen or creating new flow?)
        // Assuming reusing OTP for now, or maybe a specific reset-password-otp
        router.push({
            pathname: '/(auth)/otp-verification',
            params: { type: 'reset-password', email },
        });
    };

    return (
        <View style={[styles.container, { paddingTop: insets.top, paddingBottom: insets.bottom }]}>
            <AuthHeader title="Forget Password" />

            <View style={styles.contentContainer}>
               

                <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
                    <Text style={styles.title}>Enter your Email Address to Continue</Text>

                    <InputField
                        label="Email Address"
                        placeholder="Enter your email address"
                        icon={Sms}
                        value={email}
                        onChangeText={setEmail}
                        keyboardType="email-address"
                        autoCapitalize="none"
                        required
                    />
                </ScrollView>

                <View style={styles.footer}>
                    <PrimaryButton
                        title="Continue"
                        onPress={handleContinue}
                        disabled={!email}
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
