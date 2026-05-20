import ProgressBar from '@/components/ProgressBar';
import { useSendExpatriateOtpMutation } from '@/hooks/queries/auth/useSendExpatriateOtpMutation';
import { useSendNigerianEmailOtpMutation } from '@/hooks/queries/auth/useSendNigerianEmailOtpMutation';
import { useSendTouristOtpMutation } from '@/hooks/queries/auth/useSendTouristOtpMutation';
import { useAuthStore } from '@/stores/useAuthStore';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { InfoCircle } from 'iconsax-react-nativejs';
import React from 'react';
import { ScrollView, Text, View } from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { ScaledSheet } from 'react-native-size-matters';
import AuthHeader from '../../components/AuthHeader';
import PrimaryButton from '../../components/PrimaryButton';

export default function BvnConfirmationScreen() {
    const router = useRouter();
    const insets = useSafeAreaInsets();
    const tempUserInfo = useAuthStore((state) => state.tempUserInfo);

    const {
        userType,
        verificationToken,
        flowContext,
        firstName: paramFirstName,
        lastName: paramLastName,
        phoneNumber: paramPhoneNumber,
        email: paramEmail,
        address: paramAddress
    } = useLocalSearchParams<{
        userType?: string,
        verificationToken?: string,
        flowContext?: string,
        firstName?: string,
        lastName?: string,
        phoneNumber?: string,
        email?: string,
        address?: string
    }>();
    console.log(verificationToken, "Verification Token");
    const firstName = tempUserInfo?.firstName || paramFirstName || '';
    const lastName = tempUserInfo?.lastName || paramLastName || '';
    const phoneNumber = tempUserInfo?.phoneNumber || paramPhoneNumber || '';
    const email = tempUserInfo?.email || paramEmail || '';
    const address = tempUserInfo?.address || paramAddress || '';
    const { mutate: sendNigerianEmailOtp, isPending: isSendingNigerianEmailOtp } = useSendNigerianEmailOtpMutation();
    const { mutate: sendTouristOtp, isPending: isSendingTouristOtp } = useSendTouristOtpMutation();
    const { mutate: sendExpatriateOtp, isPending: isSendingExpatriateOtp } = useSendExpatriateOtpMutation();

    const handleSendOtp = () => {
        const payload = {
            verificationToken: verificationToken || '',
            verificationType: 'email' as const
        };

        const onSuccess = (response?: any) => {
            router.push({
                pathname: '/(auth)/otp-verification',
                params: {
                    flowContext: 'email',
                    target: 'email',
                    userType: userType || 'citizen',
                    contactInfo: response?.data?.email || email || undefined
                }
            });
        };

        const onError = (error: any) => {
            const errorMessage = error.response?.data?.error?.message || error.message;
            if (errorMessage === "BVN verification session expired. Please verify your BVN again.") {
                router.replace({
                    pathname: '/(auth)/passport-verification',
                    params: { userType: userType || 'citizen' }
                });
            }
        };

        if (userType === 'tourist') {
            sendTouristOtp(payload, { onSuccess });
        } else if (userType === 'expatriate') {
            sendExpatriateOtp(payload, { onSuccess });
        } else if (userType === 'citizen') {
            sendNigerianEmailOtp({ verificationToken: verificationToken || '' }, { onSuccess, onError });
        }
    };

    console.log(userType, "userType");
    console.log(flowContext, "flowContext");

    const InfoRow = ({ label, value }: { label: string; value: any }) => (
        <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>{label}</Text>
            <Text style={styles.infoValue}>{value}</Text>
        </View>
    );

    return (
        <SafeAreaView style={styles.container} >
            <AuthHeader title="Sign up" />

            <ScrollView
                contentContainerStyle={[styles.scrollContent, { paddingBottom: insets.bottom + 100 }]}
                showsVerticalScrollIndicator={false}
            >
                {userType === 'citizen' && <ProgressBar step={1} totalSteps={3} />}

                <View style={styles.content}>
                    <Text style={styles.title}>Final Step Ahead</Text>
                    <Text style={styles.subtitle}>
                        {"We'll send an OTP to your email to complete this step."}
                    </Text>

                    <View style={styles.card}>
                        <InfoRow label="Full Name" value={`${firstName} ${lastName}`.trim()} />
                        <InfoRow label="Phone Number" value={phoneNumber} />
                        <InfoRow label="Email Address" value={email} />
                        <InfoRow label="Address" value={address} />
                    </View>

                    <View style={styles.infoBox}>
                        <View style={styles.infoIconContainer}>
                            <InfoCircle size={24} color="#FF7A45" variant="Bold" />
                        </View>
                        <Text style={styles.infoBoxText}>
                            {userType === 'citizen' || !userType
                                ? "Details above can't be changed because they are pulled directly from your BVN."
                                : "The details above are sourced from your passport and are therefore uneditable."}
                        </Text>
                    </View>
                </View>
            </ScrollView>

            <View style={[styles.footer, { paddingBottom: insets.bottom + 20 }]}>
                <PrimaryButton
                    title="Continue"
                    onPress={handleSendOtp}
                    loading={isSendingTouristOtp || isSendingExpatriateOtp || isSendingNigerianEmailOtp}
                    disabled={isSendingTouristOtp || isSendingExpatriateOtp || isSendingNigerianEmailOtp}
                />
            </View>
        </SafeAreaView >
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
        marginTop: '16@vs',
    },
    title: {
        fontSize: '16@ms',
        fontWeight: '500',
        color: '#1E293B',
        marginBottom: '8@vs',
    },
    subtitle: {
        fontSize: '13@ms',
        color: '#6C6969',
        lineHeight: '22@ms',
        marginBottom: '24@vs',
    },
    card: {
        backgroundColor: '#FFFFFF',
        borderRadius: '16@ms',
        padding: '20@ms',
        marginBottom: '20@vs',
        borderWidth: 1,
        borderColor: '#fcf6f6ff',
    },
    infoRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginBottom: '20@vs',
    },
    infoLabel: {
        fontSize: '14@ms',
        color: '#4D4B4B',
        flex: 1,
    },
    infoValue: {
        fontSize: '13@ms',
        fontWeight: '400',
        color: '#6C6969',
        flex: 2,
        textAlign: 'right',
    },
    infoBox: {
        flexDirection: 'row',
        backgroundColor: '#F3F3F3',
        borderRadius: '12@ms',
        padding: '16@ms',
        alignItems: 'center',
        borderWidth: 1,
        borderColor: '#E2E8F0',
    },
    infoIconContainer: {
        marginRight: '12@ms',
    },
    infoBoxText: {
        flex: 1,
        fontSize: '13@ms',
        color: '#64748B',
        lineHeight: '18@ms',
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
