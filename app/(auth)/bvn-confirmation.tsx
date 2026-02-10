import ProgressBar from '@/components/ProgressBar';
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
    const { userType } = useLocalSearchParams<{ userType?: string }>();

    const handleSendOtp = () => {
        router.push({
            pathname: '/(auth)/otp-verification',
            params: {
                context: 'email',
                target: 'email',
                userType: userType || undefined
            }
        });
    };

    const InfoRow = ({ label, value }: { label: string; value: string }) => (
        <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>{label}</Text>
            <Text style={styles.infoValue}>{value}</Text>
        </View>
    );

    return (
        <SafeAreaView style={styles.container}>
            <AuthHeader title="Sign up" />

            <ScrollView
                contentContainerStyle={[styles.scrollContent, { paddingBottom: insets.bottom + 100 }]}
                showsVerticalScrollIndicator={false}
            >
                {userType !== 'expatriate' && <ProgressBar step={1} totalSteps={3} />}

                <View style={styles.content}>
                    <Text style={styles.title}>Final Step Ahead</Text>
                    <Text style={styles.subtitle}>
                        We'll send an OTP to your email to complete this step.
                    </Text>

                    <View style={styles.card}>
                        <InfoRow label="Full Name" value="Adewale Adeola" />
                        <InfoRow label="Phone Number" value="+234 903 *** ****91" />
                        <InfoRow label="Email Address" value="fiyin**********@gmail.com" />
                        <InfoRow label="Address" value="No 14A, Karimu Kotun Street, V.I Lagos" />
                    </View>

                    <View style={styles.infoBox}>
                        <View style={styles.infoIconContainer}>
                            <InfoCircle size={24} color="#FF7A45" variant="Bold" />
                        </View>
                        <Text style={styles.infoBoxText}>
                            Details above can't be changed because they are pulled directly from your BVN.
                        </Text>
                    </View>
                </View>
            </ScrollView>

            <View style={[styles.footer, { paddingBottom: insets.bottom + 20 }]}>
                <PrimaryButton
                    title="Send OTP"
                    onPress={handleSendOtp}
                />
            </View>
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
