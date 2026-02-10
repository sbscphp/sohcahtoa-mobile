import ProgressBar from '@/components/ProgressBar';
import { bvnSchema } from '@/lib/validations/auth';
import { useRouter } from 'expo-router';
import React, { useState } from 'react';
import { KeyboardAvoidingView, Platform, ScrollView, Text, View } from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { ScaledSheet } from 'react-native-size-matters';
import { z } from 'zod';
import AuthHeader from '../../components/AuthHeader';
import InputField from '../../components/InputField';
import OtpOptionSheet from '../../components/OtpOptionSheet';
import PrimaryButton from '../../components/PrimaryButton';

export default function BvnVerificationScreen() {
    const router = useRouter();
    const insets = useSafeAreaInsets();
    const [bvn, setBvn] = useState('');
    const [error, setError] = useState<string>();
    const [isSheetVisible, setIsSheetVisible] = useState(false);

    const validateBvn = (value: string) => {
        try {
            bvnSchema.parse({ bvn: value });
            setError(undefined);
        } catch (err) {
            if (err instanceof z.ZodError) {
                setError(err.issues[0]?.message);
            }
        }
    };

    const handleContinue = () => {
        try {
            bvnSchema.parse({ bvn });
            setError(undefined);
            setIsSheetVisible(true);
        } catch (err) {
            if (err instanceof z.ZodError) {
                setError(err.issues[0]?.message);
            }
        }
    };

    const handleOptionSelect = (option: 'phone' | 'email') => {
        setIsSheetVisible(false);
        router.push({
            pathname: '/(auth)/otp-verification',
            params: { context: 'bvn', target: option }
        });
    };

    return (
        <SafeAreaView style={styles.container}>
            <KeyboardAvoidingView
                behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
                style={styles.container}
            >
                <AuthHeader title="Sign up" />

                <ScrollView
                    contentContainerStyle={[styles.scrollContent, { paddingBottom: insets.bottom + 80 }]}
                    showsVerticalScrollIndicator={false}
                >
                    <ProgressBar step={1} totalSteps={3} />

                    <View style={styles.content}>
                        <Text style={styles.title}>Enter your Bank verification Number (BVN)</Text>

                        <InputField
                            label="BVN"
                            placeholder="Enter your BVN"
                            value={bvn}
                            onChangeText={setBvn}
                            onBlur={() => validateBvn(bvn)}
                            keyboardType="numeric"
                            maxLength={11}
                            required
                            error={error}
                        />
                    </View>
                </ScrollView>

                <View style={[styles.footer, { paddingBottom: insets.bottom + 20 }]}>
                    <PrimaryButton
                        title="Continue"
                        onPress={handleContinue}
                        disabled={bvn.length !== 11}
                    />
                </View>
                <OtpOptionSheet
                    isVisible={isSheetVisible}
                    onClose={() => setIsSheetVisible(false)}
                    onSelect={handleOptionSelect}
                />
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
        paddingHorizontal: '24@s',
    },
    content: {
        marginTop: '12@vs',
    },
    title: {
        fontSize: '16@ms',
        fontWeight: '500',
        color: '#1E293B',
        // lineHeight: '28@ms',
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
