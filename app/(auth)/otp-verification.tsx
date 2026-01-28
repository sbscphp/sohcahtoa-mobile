import { useLocalSearchParams, useRouter } from 'expo-router';
import React, { useEffect, useRef, useState } from 'react';
import { KeyboardAvoidingView, Platform, ScrollView, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { ScaledSheet } from 'react-native-size-matters';
import AuthHeader from '../../components/AuthHeader';
import PrimaryButton from '../../components/PrimaryButton';

export default function OtpVerificationScreen() {
    const router = useRouter();
    const { context, target, type } = useLocalSearchParams<{ context: 'bvn' | 'email'; target: 'phone' | 'email'; type?: string }>();
    const insets = useSafeAreaInsets();
    const [otp, setOtp] = useState(['', '', '', '', '', '']);
    const inputs = useRef<TextInput[]>([]);
    const [timer, setTimer] = useState(900); // 15:00 in seconds

    // ... existing timer logic ... 
    useEffect(() => {
        const interval = setInterval(() => {
            setTimer((prev) => (prev > 0 ? prev - 1 : 0));
        }, 1000);
        return () => clearInterval(interval);
    }, []);

    const formatTime = (seconds: number) => {
        const mins = Math.floor(seconds / 60);
        const secs = seconds % 60;
        return `${mins}:${secs < 10 ? '0' : ''}${secs}`;
    };

    const handleOtpChange = (value: string, index: number) => {
        const newOtp = [...otp];
        newOtp[index] = value;
        setOtp(newOtp);

        if (value && index < 5) {
            inputs.current[index + 1]?.focus();
        }
    };

    const handleKeyPress = (e: any, index: number) => {
        if (e.nativeEvent.key === 'Backspace' && !otp[index] && index > 0) {
            inputs.current[index - 1]?.focus();
        }
    };

    const handleValidate = () => {
        if (otp.join('').length === 6) {
            if (context === 'bvn') {
                router.push('/(auth)/bvn-confirmation');
            } else {
                router.push({
                    pathname: '/(auth)/secure-account',
                    params: { type: type } // Pass the type forward
                });
            }
        }
    };

    const isEmailTarget = target === 'email';
    const isResetPassword = type === 'reset-password';

    let title = context === 'email' ? 'Enter OTP to Verify your Email Address' : 'Enter OTP to Verify your BVN';
    let subtitle = isEmailTarget
        ? 'A six (6) digit OTP has been sent to your mail linked to BVN feu*****gmail.com. Enter to verify'
        : 'A six (6) digit OTP has been sent to your phone number linked to BVN 713*****598. Enter to verify';

    let headerTitle = 'Sign up';

    if (isResetPassword) {
        title = 'Enter OTP to Reset Password';
        subtitle = 'A six (6) digit OTP has been sent to your email address. Enter it below to verify your identity.';
        headerTitle = 'Forget Password';
    }

    return (
        <SafeAreaView style={styles.container}>
            <KeyboardAvoidingView
                behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
                style={styles.container}
            >
                <AuthHeader title={headerTitle} />

                <ScrollView
                    contentContainerStyle={[styles.scrollContent, { paddingBottom: insets.bottom + 80 }]}
                    showsVerticalScrollIndicator={false}
                >
                    {/* {context === 'bvn' && <ProgressBar progress={1.0} />} */}

                    <View style={styles.content}>
                        <Text style={styles.title}>{title}</Text>
                        <Text style={styles.subtitle}>{subtitle}</Text>

                        <View style={styles.otpContainer}>
                            {otp.map((digit, index) => (
                                <TextInput
                                    key={index}
                                    ref={(ref) => {
                                        inputs.current[index] = ref as TextInput;
                                    }}
                                    style={styles.otpInput}
                                    value={digit}
                                    onChangeText={(value) => handleOtpChange(value, index)}
                                    onKeyPress={(e) => handleKeyPress(e, index)}
                                    keyboardType="number-pad"
                                    maxLength={1}
                                    selectTextOnFocus
                                />
                            ))}
                        </View>

                        <Text style={styles.timerText}>
                            OTP expires in <Text style={styles.timerValue}>{formatTime(timer)}</Text>
                        </Text>

                        <View style={styles.resendContainer}>
                            <Text style={styles.resendText}>Didn't Receive Code? </Text>
                            <TouchableOpacity>
                                <Text style={styles.resendLink}>Resend OTP</Text>
                            </TouchableOpacity>
                        </View>
                    </View>
                </ScrollView>

                <View style={[styles.footer, { paddingBottom: insets.bottom + 20 }]}>
                    <PrimaryButton
                        title="Validate OTP"
                        onPress={handleValidate}
                        disabled={otp.join('').length !== 6}
                        style={{ backgroundColor: otp.join('').length === 6 ? '#FF7A45' : '#FFCCB4' }}
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
        paddingHorizontal: '24@s',
    },
    content: {
        marginTop: '12@vs',
    },
    title: {
        fontSize: '17@ms',
        fontWeight: '500',
        color: '#1E293B',
        lineHeight: '28@ms',
        marginBottom: '10@vs',
    },
    subtitle: {
        fontSize: '13@ms',
        color: '#6C6969',
        lineHeight: '22@ms',
        marginBottom: '32@vs',
    },
    otpContainer: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginBottom: '24@vs',
    },
    otpInput: {
        width: '44@s',
        height: '44@vs',
        borderWidth: 1,
        borderColor: '#E2E8F0',
        borderRadius: '8@ms',
        fontSize: '20@ms',
        fontWeight: '700',
        textAlign: 'center',
        color: '#0F172A',
        backgroundColor: '#FFFFFF',
    },
    timerText: {
        fontSize: '14@ms',
        color: '#64748B',
        textAlign: 'center',
        marginBottom: '40@vs',
    },
    timerValue: {
        color: '#FF4D4D',
        fontWeight: '600',
    },
    resendContainer: {
        flexDirection: 'row',
        justifyContent: 'center',
        alignItems: 'center',
    },
    resendText: {
        fontSize: '14@ms',
        color: '#64748B',
    },
    resendLink: {
        fontSize: '14@ms',
        color: '#FF7A45',
        fontWeight: '600',
        textDecorationLine: 'underline',
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
