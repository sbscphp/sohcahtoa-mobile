import { useEffect, useRef, useState } from 'react';
import * as Linking from 'expo-linking';
import * as WebBrowser from 'expo-web-browser';
import { useRouter } from 'expo-router';
import { useAuthStore } from '@/stores/useAuthStore';
import { useToastStore } from '@/stores/useToastStore';
import { useVerifyBvnMutation } from '@/hooks/queries/auth/useVerifyBvnMutation';
import { useSendOtpMutation } from '@/hooks/queries/auth/useSendOtpMutation';
import { useInitiateIgreeMutation } from '@/hooks/queries/auth/useInitiateIgreeMutation';
import { useIgreeCallbackMutation } from '@/hooks/queries/auth/useIgreeCallbackMutation';
import { useRetrieveIgreeMutation } from '@/hooks/queries/auth/useRetrieveIgreeMutation';

WebBrowser.maybeCompleteAuthSession();

export const extractCodeAndState = (urlStr: string) => {
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

interface UseIgreeVerificationParams {
    firstName: string;
    lastName: string;
    phoneNumber: string;
    email: string;
    dateOfBirth: string;
    bvn: string;
    userType?: string;
}

export function useIgreeVerification({
    firstName,
    lastName,
    phoneNumber,
    email,
    dateOfBirth,
    bvn,
    userType,
}: UseIgreeVerificationParams) {
    const router = useRouter();
    const [activeSessionId, setActiveSessionId] = useState<string>('');
    const [authUrlToOpen, setAuthUrlToOpen] = useState<string>('');
    const [isConsentSheetVisible, setIsConsentSheetVisible] = useState(false);
    const [isWebViewVisible, setIsWebViewVisible] = useState(false);
    const [isProcessingConsent, setIsProcessingConsent] = useState(false);
    const [isPollingRetrieve, setIsPollingRetrieve] = useState(false);
    const [callbackSubmitted, setCallbackSubmitted] = useState(false);

    const pollingTimerRef = useRef<ReturnType<typeof setInterval> | null>(null);

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

                if (attempts >= maxAttempts) {
                    stopPolling();
                    setIsConsentSheetVisible(true);
                }
            } catch {
                if (attempts >= maxAttempts) {
                    stopPolling();
                    setIsConsentSheetVisible(true);
                }
            }
        };

        poll();
        pollingTimerRef.current = setInterval(poll, 2500);
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

            const redirectUrl = Linking.createURL('/auth/nibss/igree/callback');
            const result = await WebBrowser.openAuthSessionAsync(url, redirectUrl);

            urlSubscription?.remove?.();

            if (result.type === 'success' && result.url) {
                await processCallbackUrl(result.url);
            } else if (!handledCallback) {
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

    return {
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
        handleOpenBrowserSession,
        handleConsentCaptured,
        handleCloseWebView,
        verifyBvn,
        isVerifyingCitizen,
        sendOtp,
        isSendingOtp,
        initiateIgree,
        isInitiatingIgree,
        isPending,
    };
}
