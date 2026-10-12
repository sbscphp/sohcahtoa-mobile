import ProgressBar from '@/components/ProgressBar';
import { useIgreeCallbackMutation } from '@/hooks/queries/auth/useIgreeCallbackMutation';
import { useInitiateIgreeMutation } from '@/hooks/queries/auth/useInitiateIgreeMutation';
import { useRetrieveIgreeMutation } from '@/hooks/queries/auth/useRetrieveIgreeMutation';
import { useSendOtpMutation } from '@/hooks/queries/auth/useSendOtpMutation';
import { useVerifyBvnMutation } from '@/hooks/queries/auth/useVerifyBvnMutation';
import { BVNFormData, bvnSchema } from '@/lib/validations/auth';
import { useAuthStore } from '@/stores/useAuthStore';
import { useToastStore } from '@/stores/useToastStore';
import * as Linking from 'expo-linking';
import { useLocalSearchParams, useRouter } from 'expo-router';
import * as WebBrowser from 'expo-web-browser';
import React, { useEffect, useRef, useState } from 'react';
import { KeyboardAvoidingView, Platform, ScrollView, Text, View } from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { ScaledSheet } from 'react-native-size-matters';
import { z } from 'zod';
import AuthHeader from '../../components/AuthHeader';
import DatePickerField from '../../components/DatePickerField';
import IgreeConsentSheet from '../../components/IgreeConsentSheet';
import InputField from '../../components/InputField';
import NibssIgreeWebViewModal from '../../components/NibssIgreeWebViewModal';
import OtpOptionSheet from '../../components/OtpOptionSheet';
import PrimaryButton from '../../components/PrimaryButton';

WebBrowser.maybeCompleteAuthSession();

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

const extractCodeAndState = (urlStr: string) => {
    try {
        const parsed = Linking.parse(urlStr);
        let code = (parsed.queryParams?.code as string) || '';
        let state = (parsed.queryParams?.state as string) || '';

        if ((!code || !state) && urlStr.includes('?')) {
            const queryPart = urlStr.split('?')[1];
            const searchParams = new URLSearchParams(queryPart);
            code = code || searchParams.get('code') || '';
            state = state || searchParams.get('state') || '';
        }
        return { code, state };
    } catch {
        return { code: '', state: '' };
    }
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
    const [activeSessionId, setActiveSessionId] = useState<string>('');
    const [authUrlToOpen, setAuthUrlToOpen] = useState<string>('');
    const [isConsentSheetVisible, setIsConsentSheetVisible] = useState(false);
    const [isWebViewVisible, setIsWebViewVisible] = useState(false);
    const [isProcessingConsent, setIsProcessingConsent] = useState(false);
    const [isPollingRetrieve, setIsPollingRetrieve] = useState(false);
    const [callbackSubmitted, setCallbackSubmitted] = useState(false);

    const pollingTimerRef = useRef<NodeJS.Timeout | null>(null);

    const { mutate: verifyBvn, isPending: isVerifyingCitizen } = useVerifyBvnMutation();
    const { mutate: sendOtp, isPending: isSendingOtp } = useSendOtpMutation();
    const { mutate: initiateIgree, isPending: isInitiatingIgree } = useInitiateIgreeMutation();
    const { mutateAsync: submitIgreeCallbackAsync } = useIgreeCallbackMutation();
    const { mutateAsync: retrieveIgreeAsync } = useRetrieveIgreeMutation();

    const isPending = isVerifyingCitizen || isInitiatingIgree || isProcessingConsent || isPollingRetrieve;

    useEffect(() => {
        return () => {
            if (pollingTimerRef.current) {
                clearInterval(pollingTimerRef.current);
            }
        };
    }, []);

    const stopPolling = () => {
        if (pollingTimerRef.current) {
            clearInterval(pollingTimerRef.current);
            pollingTimerRef.current = null;
        }
        setIsPollingRetrieve(false);
    };

    const startPollingRetrieve = (sessionId: string) => {
        if (!sessionId) return;
        stopPolling();
        setIsPollingRetrieve(true);

        let attempts = 0;
        const maxAttempts = 24; // 24 * 2.5s = 60s

        const poll = async () => {
            attempts++;
            try {
                const retrieveRes = await retrieveIgreeAsync({ sessionId });
                const status = retrieveRes.data?.status;

                if (status === 'COMPLETED') {
                    stopPolling();
                    const customer = retrieveRes.data.customer;
                    const verificationToken = retrieveRes.data.verificationToken;

                    if (verificationToken) {
                        useAuthStore.getState().setVerificationToken(verificationToken);
                    }

                    useAuthStore.getState().setTempUserInfo({
                        firstName: customer?.firstName || firstName,
                        lastName: customer?.lastName || lastName,
                        phoneNumber: phoneNumber,
                        email: email,
                        dateOfBirth: customer?.dateOfBirth || dateOfBirth,
                        address: [customer?.lgaOfOrigin, customer?.stateOfOrigin].filter(Boolean).join(', ') || '',
                        nin: customer?.nin,
                        bvn: bvn,
                    });

                    setIsConsentSheetVisible(false);

                    router.push({
                        pathname: '/(auth)/bvn-confirmation',
                        params: {
                            userType: userType || 'citizen',
                            verificationToken: verificationToken,
                            firstName: customer?.firstName || firstName,
                            lastName: customer?.lastName || lastName,
                            phoneNumber: phoneNumber,
                            email: email,
                            dateOfBirth: customer?.dateOfBirth || dateOfBirth,
                            address: [customer?.lgaOfOrigin, customer?.stateOfOrigin].filter(Boolean).join(', ') || '',
                            flowContext: 'email',
                        },
                    });
                    return;
                }

                if (status === 'FAILED') {
                    stopPolling();
                    useToastStore.getState().showToast(
                        retrieveRes.data?.message || 'BVN consent verification failed. Please restart verification.',
                        'error'
                    );
                    setIsConsentSheetVisible(false);
                    return;
                }

                // If PENDING or CONSENT_VERIFIED, keep polling until maxAttempts
                if (attempts >= maxAttempts) {
                    stopPolling();
                    setIsConsentSheetVisible(true);
                }
            } catch (err: any) {
                if (attempts >= maxAttempts) {
                    stopPolling();
                    setIsConsentSheetVisible(true);
                }
            }
        };

        poll();
        pollingTimerRef.current = setInterval(poll, 2500);
    };

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

    const handleOpenBrowserSession = async (url: string, sessionId: string) => {
        try {
            setIsProcessingConsent(true);
            let handledCallback = false;

            const processCallbackUrl = async (callbackUrl: string) => {
                if (handledCallback) return;
                const { code, state: returnedState } = extractCodeAndState(callbackUrl);
                const stateToUse = returnedState || sessionId;

                if (code && stateToUse) {
                    handledCallback = true;
                    try {
                        await submitIgreeCallbackAsync({ code, state: stateToUse });
                        setCallbackSubmitted(true);
                        startPollingRetrieve(stateToUse);
                    } catch (err: any) {
                        console.warn('Error submitting iGree callback:', err);
                        useToastStore.getState().showToast(
                            err.response?.data?.message || err.message || 'Failed to submit iGree consent',
                            'error'
                        );
                        setIsConsentSheetVisible(true);
                    }
                }
            };

            const urlSubscription = typeof Linking.addEventListener === 'function'
                ? Linking.addEventListener('url', (event) => {
                    if (event.url.includes('code=') || event.url.includes('/igree')) {
                        processCallbackUrl(event.url);
                    }
                })
                : null;

            // Redirect URI typically configured with NIBSS
            const redirectUrl = Linking.createURL('/auth/nibss/igree/callback');
            const result = await WebBrowser.openAuthSessionAsync(url, redirectUrl);

            urlSubscription?.remove?.();

            if (result.type === 'success' && result.url) {
                await processCallbackUrl(result.url);
            } else if (!handledCallback) {
                // If user closes/cancels before redirect, DO NOT poll retrieve!
                setIsConsentSheetVisible(true);
            }
        } catch (error) {
            console.error('Consent session error:', error);
            setIsConsentSheetVisible(true);
        } finally {
            setIsProcessingConsent(false);
        }
    };

    const handleConsentCaptured = async (code: string, state: string) => {
        setIsWebViewVisible(false);
        setIsProcessingConsent(true);
        try {
            await submitIgreeCallbackAsync({ code, state });
            setCallbackSubmitted(true);
            startPollingRetrieve(state);
        } catch (err: any) {
            console.warn('Error submitting iGree callback:', err);
            useToastStore.getState().showToast(
                err.response?.data?.message || err.message || 'Failed to submit iGree consent',
                'error'
            );
            setIsConsentSheetVisible(true);
        } finally {
            setIsProcessingConsent(false);
        }
    };

    const handleCloseWebView = () => {
        setIsWebViewVisible(false);
        setIsConsentSheetVisible(true);
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

        if (!verificationToken) {
            return;
        }

        sendOtp(
            {
                verificationToken,
                verificationType: option
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
                            contactInfo: option === 'email' ? (email || response.data?.email) : (phoneNumber || response.data?.phoneNumber)
                        }
                    });
                }
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

                    <View style={styles.content}>
                        <Text style={styles.title}>Enter your Bank verification Number (BVN)</Text>

                        <InputField
                            label="First Name"
                            placeholder="Enter your first name"
                            value={firstName}
                            onChangeText={(text) => {
                                setFirstName(text);
                                if (errors?.firstName) validateField('firstName', text);
                            }}
                            onBlur={() => validateField('firstName', firstName)}
                            required
                            error={errors?.firstName}
                        />

                        <InputField
                            label="Last Name"
                            placeholder="Enter your last name"
                            value={lastName}
                            onChangeText={(text) => {
                                setLastName(text);
                                if (errors?.lastName) validateField('lastName', text);
                            }}
                            onBlur={() => validateField('lastName', lastName)}
                            required
                            error={errors?.lastName}
                        />

                        <InputField
                            label="Email Address"
                            placeholder="Enter your email address"
                            value={email}
                            onChangeText={(text) => {
                                setEmail(text);
                                if (errors?.email) validateField('email', text);
                            }}
                            onBlur={() => validateField('email', email)}
                            keyboardType="email-address"
                            autoCapitalize="none"
                            required
                            error={errors?.email}
                        />

                        <InputField
                            label="Phone Number"
                            placeholder="Enter your phone number"
                            value={phoneNumber}
                            onChangeText={(text) => {
                                setPhoneNumber(text);
                                if (errors?.phoneNumber) validateField('phoneNumber', text);
                            }}
                            onBlur={() => validateField('phoneNumber', phoneNumber)}
                            keyboardType="phone-pad"
                            required
                            error={errors?.phoneNumber}
                        />

                        <View style={styles.datePickerContainer}>
                            <DatePickerField
                                label="Date of Birth"
                                value={dateOfBirth}
                                onDateChange={(date) => {
                                    setDateOfBirth(date);
                                    if (errors?.dateOfBirth) validateField('dateOfBirth', date);
                                }}
                                placeholder="DD/MM/YYYY"
                                required
                                maximumDate={new Date()}
                                error={errors?.dateOfBirth}
                            />
                        </View>

                        <InputField
                            label="BVN"
                            placeholder="Enter your BVN"
                            value={bvn}
                            onChangeText={(text) => {
                                setBvn(text);
                                if (errors?.bvn) validateField('bvn', text);
                            }}
                            onBlur={() => validateField('bvn', bvn)}
                            keyboardType="numeric"
                            maxLength={11}
                            required
                            error={errors?.bvn}
                        />

                        <Text style={styles.bvnHint}>
                            If you can't remember, please dial{' '}
                            <Text style={styles.bvnHintHighlight}>*565*0#</Text> with your registered SIM to get started.
                        </Text>
                    </View>
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
    datePickerContainer: {
        marginBottom: '12@vs',
    },
    bvnHint: {
        fontSize: '12@ms',
        color: '#64748B',
        lineHeight: '18@ms',
        marginTop: '-6@vs',
        marginBottom: '16@vs',
    },
    bvnHintHighlight: {
        fontWeight: '600',
        color: '#0F172A',
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
