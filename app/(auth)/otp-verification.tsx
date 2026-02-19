import ProgressBar from '@/components/ProgressBar';
import { useForgotPasswordMutation } from '@/hooks/queries/auth/useForgotPasswordMutation';
import { useResendEmailOtpMutation } from '@/hooks/queries/auth/useResendEmailOtpMutation';
import { useResendExpatriateOtpMutation } from '@/hooks/queries/auth/useResendExpatriateOtpMutation';
import { useResendOtpMutation } from '@/hooks/queries/auth/useResendOtpMutation';
import { useResendTouristOtpMutation } from '@/hooks/queries/auth/useResendTouristOtpMutation';
import { useValidateExpatriateOtpMutation } from '@/hooks/queries/auth/useValidateExpatriateOtpMutation';
import { useValidateForgotPasswordOtpMutation } from '@/hooks/queries/auth/useValidateForgotPasswordOtpMutation';
import { useValidateNigerianEmailOtpMutation } from '@/hooks/queries/auth/useValidateNigerianEmailOtpMutation';
import { useValidateOtpMutation } from '@/hooks/queries/auth/useValidateOtpMutation';
import { useValidateTouristOtpMutation } from '@/hooks/queries/auth/useValidateTouristOtpMutation';
import { useAuthStore } from '@/stores/useAuthStore';
import { useLocalSearchParams, useRouter } from 'expo-router';
import React, { useEffect, useRef, useState } from 'react';
import { KeyboardAvoidingView, Platform, ScrollView, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { ScaledSheet } from 'react-native-size-matters';
import AuthHeader from '../../components/AuthHeader';
import PrimaryButton from '../../components/PrimaryButton';

export default function OtpVerificationScreen() {
    const router = useRouter();
    const { flowContext, target, type, userType, contactInfo } = useLocalSearchParams<{
        flowContext: 'bvn' | 'email';
        target: 'phone' | 'email';
        type?: string;
        userType?: string;
        contactInfo?: string;
    }>();
    const insets = useSafeAreaInsets();
    const [otp, setOtp] = useState(['', '', '', '', '', '']);
    const inputs = useRef<TextInput[]>([]);
    const [timer, setTimer] = useState(900);

    const { mutate: validateOtp, isPending: isValidatingNigerian } = useValidateOtpMutation();
    const { mutate: validateNigerianEmailOtp, isPending: isValidatingNigerianEmail } = useValidateNigerianEmailOtpMutation();
    const { mutate: validateTouristOtp, isPending: isValidatingTourist } = useValidateTouristOtpMutation();
    const { mutate: validateExpatriateOtp, isPending: isValidatingExpatriate } = useValidateExpatriateOtpMutation();
    const { mutate: validateForgotPasswordOtp, isPending: isValidatingForgot } = useValidateForgotPasswordOtpMutation();

    const { mutate: forgotPassword, isPending: isResendingForgot } = useForgotPasswordMutation();
    const { mutate: resendOtp, isPending: isResendingOtp } = useResendOtpMutation();
    const { mutate: resendEmailOtp, isPending: isResendingEmailOtp } = useResendEmailOtpMutation();
    const { mutate: resendTouristOtp, isPending: isResendingTourist } = useResendTouristOtpMutation();
    const { mutate: resendExpatriateOtp, isPending: isResendingExpatriate } = useResendExpatriateOtpMutation();

    const isPending =
        isValidatingNigerian ||
        isValidatingNigerianEmail ||
        isValidatingTourist ||
        isValidatingExpatriate ||
        isValidatingForgot ||
        isValidatingForgot ||
        isResendingOtp ||
        isResendingTourist ||
        isResendingExpatriate ||
        isResendingForgot ||
        isResendingEmailOtp;

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
        const verificationToken = useAuthStore.getState().verificationToken;
        const currentOtp = otp.join('');

        if (currentOtp.length === 6) {
            const onSuccess = (response: any) => {
                // console.log(response, "OTP-response");

                router.push({
                    pathname: '/(auth)/bvn-confirmation',
                    params: {
                        userType: userType,
                        verificationToken: response?.data?.verificationToken,
                        firstName: response?.data?.firstName || '',
                        lastName: response?.data?.lastName || '',
                        phoneNumber: response?.data?.phoneNumber || '',
                        email: response?.data?.email || '',
                        address: response?.data?.address || '',
                        flowContext: 'email'
                    },
                });
                if (userType === 'tourist' || userType === 'expatriate' || type === 'reset-password') {
                    router.push({
                        pathname: '/(auth)/secure-account',
                        params: {
                            type: type,
                            userType: userType || undefined,
                            email: type === 'reset-password' ? contactInfo : undefined,
                            otp: type === 'reset-password' ? currentOtp : undefined,
                            resetToken: response?.data?.resetToken,
                        },
                    });
                }
            };

            if (type === 'reset-password' && contactInfo) {
                validateForgotPasswordOtp({ email: contactInfo, otp: currentOtp }, { onSuccess });
            } else if (verificationToken) {
                const payload = {
                    verificationToken,
                    otp: currentOtp,
                };

                if (userType === 'tourist') {
                    validateTouristOtp(payload, { onSuccess });
                } else if (userType === 'expatriate') {
                    validateExpatriateOtp(payload, { onSuccess });
                } else if (userType === 'citizen') {
                    if (flowContext === 'email') {
                        validateNigerianEmailOtp(payload);
                    } else {
                        validateOtp(payload, { onSuccess });
                    }
                }
            }
        }
    };

    const handleResendOtp = () => {
        const verificationToken = useAuthStore.getState().verificationToken;

        const onSuccess = () => {
            setTimer(900);
        };

        if (type === 'reset-password' && contactInfo) {
            forgotPassword({ email: contactInfo }, { onSuccess });
        } else if (verificationToken) {
            const payload = {
                verificationToken,
                verificationType: target as 'phone' | 'email',
            };

            if (userType === 'tourist') {
                resendTouristOtp(payload, { onSuccess });
            } else if (userType === 'expatriate') {
                resendExpatriateOtp(payload, { onSuccess });
            } else if (flowContext === 'email') {
                resendEmailOtp({ verificationToken }, { onSuccess });
            } else {
                resendOtp({ ...payload, verificationType: 'phone' }, { onSuccess });
            }
        }
    };

    const isEmailTarget = target === 'email';
    const isResetPassword = type === 'reset-password';

    const maskContactInfo = (info: string | undefined, type: 'phone' | 'email') => {
        if (!info) return type === 'email' ? 'your email' : 'your phone number';

        if (type === 'email') {
            const [username, domain] = info.split('@');
            if (!username || !domain) return info;
            const maskedUsername = username.slice(0, 3) + '*****';
            return `${maskedUsername}@${domain}`;
        } else {
            if (info.length < 6) return info;
            const masked = info.slice(0, 3) + '*****' + info.slice(-3);
            return masked;
        }
    };

    let title = flowContext === 'email' ? 'Enter OTP to Verify your Email Address' : 'Enter OTP to Verify your BVN';
    let subtitle = isEmailTarget
        ? `A six (6) digit OTP has been sent to your mail linked to BVN ${maskContactInfo(contactInfo, 'email')}. Enter to verify`
        : `A six (6) digit OTP has been sent to your phone number linked to BVN ${maskContactInfo(contactInfo, 'phone')}. Enter to verify`;

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
                    {flowContext === 'bvn' && userType === 'citizen' && <ProgressBar step={1} totalSteps={3} />}
                    {flowContext === 'email' && userType === 'citizen' && <ProgressBar step={2} totalSteps={3} />}
                    {isResetPassword && <ProgressBar step={1} totalSteps={2} />}

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
                            <TouchableOpacity
                                onPress={handleResendOtp}
                                disabled={isPending || timer > 0}
                            >
                                <Text
                                    style={[
                                        styles.resendLink,
                                        (isPending || timer > 0) && { color: '#CBD5E1', textDecorationLine: 'none' },
                                    ]}
                                >
                                    Resend OTP
                                </Text>
                            </TouchableOpacity>
                        </View>
                    </View>
                </ScrollView>

                <View style={[styles.footer, { paddingBottom: insets.bottom + 20 }]}>
                    <PrimaryButton
                        title="Validate OTP"
                        onPress={handleValidate}
                        disabled={otp.join('').length !== 6}
                        loading={isPending}
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
