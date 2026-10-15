import React, { useState } from 'react';
import { KeyboardAvoidingView, Platform, ScrollView, View } from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { ScaledSheet } from 'react-native-size-matters';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { z } from 'zod';

import ProgressBar from '@/components/ProgressBar';
import AuthHeader from '../../components/AuthHeader';
import PrimaryButton from '../../components/PrimaryButton';
import OtpOptionSheet from '../../components/OtpOptionSheet';
import IgreeConsentSheet from '../../components/IgreeConsentSheet';
import NibssIgreeWebViewModal from '../../components/NibssIgreeWebViewModal';
import BvnFormInputs from '@/components/auth/BvnFormInputs';
import { useIgreeVerification } from '@/hooks/auth/useIgreeVerification';
import { BVNFormData, bvnSchema } from '@/lib/validations/auth';
import { useAuthStore } from '@/stores/useAuthStore';

const formatDateForApi = (dob: string): string => {
    if (!dob) return '';
    if (dob.includes('-')) return dob;
    const parts = dob.split('/');
    if (parts.length === 3) {
        const [day, month, year] = parts;
        return `${year}-${month.padStart(2, '0')}-${day.padStart(2, '0')}`;
    }
    return dob;
};

const formatPhoneNumberForApi = (phone: string): string => {
    const trimmed = phone.trim();
    if (trimmed.startsWith('0')) {
        return `+234${trimmed.slice(1)}`;
    }
    if (trimmed.startsWith('234')) {
        return `+${trimmed}`;
    }
    return trimmed;
};

export default function BvnVerificationScreen() {
    const router = useRouter();
    const insets = useSafeAreaInsets();
    const { userType } = useLocalSearchParams<{ userType?: string }>();

    const [bvn, setBvn] = useState('');
    const [firstName, setFirstName] = useState('');
    const [lastName, setLastName] = useState('');
    const [email, setEmail] = useState('');
    const [phoneNumber, setPhoneNumber] = useState('');
    const [dateOfBirth, setDateOfBirth] = useState('');
    const [errors, setErrors] = useState<Partial<Record<keyof BVNFormData, string>>>();
    const [isSheetVisible, setIsSheetVisible] = useState(false);

    const {
        activeSessionId,
        setActiveSessionId,
        authUrlToOpen,
        setAuthUrlToOpen,
        isConsentSheetVisible,
        setIsConsentSheetVisible,
        isWebViewVisible,
        setIsWebViewVisible,
        isProcessingConsent,
        isPollingRetrieve,
        callbackSubmitted,
        stopPolling,
        startPollingRetrieve,
        handleConsentCaptured,
        handleCloseWebView,
        verifyBvn,
        sendOtp,
        isSendingOtp,
        initiateIgree,
        isPending,
    } = useIgreeVerification({
        firstName,
        lastName,
        phoneNumber,
        email,
        dateOfBirth,
        bvn,
        userType,
    });

    const validateField = (field: keyof BVNFormData, value: string) => {
        try {
            bvnSchema.shape[field].parse(value);
            setErrors((prev) => ({ ...prev, [field]: undefined }));
        } catch (err) {
            if (err instanceof z.ZodError) {
                setErrors((prev) => ({ ...prev, [field]: err.issues[0]?.message }));
            }
        }
    };

    const handleContinue = () => {
        try {
            bvnSchema.parse({ bvn, firstName, lastName, email, phoneNumber, dateOfBirth });
            setErrors(undefined);

            if (userType === 'expatriate') {
                verifyBvn({ bvn }, {
                    onSuccess: () => {
                        setIsSheetVisible(true);
                    }
                });
            } else {
                initiateIgree(
                    {
                        bvn,
                        firstName,
                        lastName,
                        dateOfBirth: formatDateForApi(dateOfBirth),
                        phoneNumber: formatPhoneNumberForApi(phoneNumber),
                        email,
                    },
                    {
                        onSuccess: (response) => {
                            const authUrl = response.data?.authUrl;
                            const state = response.data?.state;
                            if (authUrl && state) {
                                setActiveSessionId(state);
                                setAuthUrlToOpen(authUrl);
                                setIsWebViewVisible(true);
                            }
                        },
                    }
                );
            }
        } catch (err) {
            if (err instanceof z.ZodError) {
                const fieldErrors: Partial<Record<keyof BVNFormData, string>> = {};
                err.issues.forEach((issue) => {
                    const field = issue.path[0] as keyof BVNFormData;
                    if (field && !fieldErrors[field]) {
                        fieldErrors[field] = issue.message;
                    }
                });
                setErrors(fieldErrors);
            }
        }
    };

    const handleOptionSelect = (option: 'phone' | 'email') => {
        const verificationToken = useAuthStore.getState().verificationToken;
        if (!verificationToken) return;

        sendOtp(
            {
                verificationToken,
                verificationType: option,
            },
            {
                onSuccess: (response: any) => {
                    useAuthStore.getState().setTempUserInfo({
                        firstName: firstName || response.data?.firstName || '',
                        lastName: lastName || response.data?.lastName || '',
                        phoneNumber: phoneNumber || response.data?.phoneNumber || '',
                        email: email || response.data?.email || '',
                        dateOfBirth: dateOfBirth || response.data?.dateOfBirth || '',
                        address: response.data?.address || '',
                    });
                    setIsSheetVisible(false);
                    router.push({
                        pathname: '/(auth)/otp-verification',
                        params: {
                            context: 'bvn',
                            target: option,
                            userType: userType || 'citizen',
                            contactInfo: option === 'email' ? (email || response.data?.email) : (phoneNumber || response.data?.phoneNumber),
                        },
                    });
                },
            }
        );
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
                    <BvnFormInputs
                        firstName={firstName}
                        setFirstName={setFirstName}
                        lastName={lastName}
                        setLastName={setLastName}
                        email={email}
                        setEmail={setEmail}
                        phoneNumber={phoneNumber}
                        setPhoneNumber={setPhoneNumber}
                        dateOfBirth={dateOfBirth}
                        setDateOfBirth={setDateOfBirth}
                        bvn={bvn}
                        setBvn={setBvn}
                        errors={errors}
                        validateField={validateField}
                    />
                </ScrollView>

                <View style={[styles.footer, { paddingBottom: insets.bottom + 20 }]}>
                    <PrimaryButton
                        title="Continue"
                        onPress={handleContinue}
                        disabled={bvn.length !== 11}
                        loading={isPending}
                    />
                </View>

                <OtpOptionSheet
                    isVisible={isSheetVisible}
                    onClose={() => setIsSheetVisible(false)}
                    onSelect={handleOptionSelect}
                    loading={isSendingOtp}
                />

                <IgreeConsentSheet
                    isVisible={isConsentSheetVisible}
                    onClose={() => {
                        stopPolling();
                        setIsConsentSheetVisible(false);
                    }}
                    onCheckStatus={() => {
                        if (callbackSubmitted && activeSessionId) {
                            startPollingRetrieve(activeSessionId);
                        } else if (authUrlToOpen) {
                            setIsConsentSheetVisible(false);
                            setIsWebViewVisible(true);
                        }
                    }}
                    onReopenBrowser={() => {
                        setIsConsentSheetVisible(false);
                        handleContinue();
                    }}
                    checkingStatus={isPollingRetrieve || isProcessingConsent}
                />

                <NibssIgreeWebViewModal
                    isVisible={isWebViewVisible}
                    authUrl={authUrlToOpen}
                    sessionId={activeSessionId}
                    onClose={handleCloseWebView}
                    onConsentCaptured={handleConsentCaptured}
                    onRestartFreshSession={() => {
                        setIsWebViewVisible(false);
                        handleContinue();
                    }}
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
