import React, { useRef, useState } from 'react';
import {
    ActivityIndicator,
    Modal,
    Platform,

    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from 'react-native';
import { WebView, WebViewNavigation } from 'react-native-webview';
import type { ShouldStartLoadRequest } from 'react-native-webview/lib/WebViewTypes';
import { CloseCircle } from 'iconsax-react-nativejs';
import * as Linking from 'expo-linking';
import { moderateScale, ScaledSheet } from 'react-native-size-matters';
import { SafeAreaView } from 'react-native-safe-area-context';

interface NibssIgreeWebViewModalProps {
    isVisible: boolean;
    authUrl: string;
    sessionId: string;
    onClose: () => void;
    onConsentCaptured: (code: string, state: string) => void;
    onRestartFreshSession?: () => void;
}

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

const SAFARI_USER_AGENT =
    Platform.OS === 'ios'
        ? 'Mozilla/5.0 (iPhone; CPU iPhone OS 17_5 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.5 Mobile/15E148 Safari/604.1'
        : 'Mozilla/5.0 (Linux; Android 10; K) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Mobile Safari/537.36';

const NibssIgreeWebViewModal: React.FC<NibssIgreeWebViewModalProps> = ({
    isVisible,
    authUrl,
    sessionId,
    onClose,
    onConsentCaptured,
    onRestartFreshSession,
}) => {
    const [isLoading, setIsLoading] = useState(true);
    const hasCapturedRef = useRef(false);
    // Explicit `object` generic: the lib's default `P = undefined` makes props resolve to `never`.
    const webViewRef = useRef<WebView<object>>(null);

    // Reset capture flag when modal opens
    React.useEffect(() => {
        if (isVisible) {
            hasCapturedRef.current = false;
            setIsLoading(true);
        }
    }, [isVisible]);

    const handleInterceptUrl = (url: string): boolean => {
        if (!url || hasCapturedRef.current) return false;

        const isRedirectTarget =
            url.includes('/igree') ||
            (url.includes('code=') && (url.includes('state=') || sessionId)) ||
            url.startsWith('sohcahtoa://');

        if (isRedirectTarget) {
            const { code, state: returnedState } = extractCodeAndState(url);
            const resolvedState = returnedState || sessionId;

            if (code && resolvedState) {
                hasCapturedRef.current = true;
                onConsentCaptured(code, resolvedState);
                return true; // handled
            }
        }
        return false;
    };

    return (
        <Modal
            visible={isVisible}
            animationType="slide"
            presentationStyle="pageSheet"
            onRequestClose={onClose}
        >
            <SafeAreaView style={styles.safeArea}>
                <View style={styles.header}>
                    <Text style={styles.headerTitle}>NIBSS iGree Consent</Text>
                    <View style={styles.headerActions}>
                        <TouchableOpacity
                            onPress={() => {
                                if (onRestartFreshSession) {
                                    onRestartFreshSession();
                                } else {
                                    webViewRef.current?.reload();
                                }
                            }}
                            hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
                            style={styles.reloadButton}
                        >
                            <Text style={styles.reloadText}>Reload</Text>
                        </TouchableOpacity>

                        <TouchableOpacity
                            onPress={onClose}
                            hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
                            style={styles.closeButton}
                        >
                            <CloseCircle size={moderateScale(24)} color="#64748B" variant="Linear" />
                        </TouchableOpacity>
                    </View>
                </View>

                <View style={styles.webviewContainer}>
                    {authUrl ? (
                        <WebView<object>
                            ref={webViewRef}
                            source={{ uri: authUrl }}
                            userAgent={SAFARI_USER_AGENT}
                            onLoadStart={() => setIsLoading(true)}
                            onLoadEnd={() => setIsLoading(false)}
                            onShouldStartLoadWithRequest={(request: ShouldStartLoadRequest) => {
                                const intercepted = handleInterceptUrl(request.url);
                                if (intercepted) {
                                    return false;
                                }
                                return true;
                            }}
                            onNavigationStateChange={(navState: WebViewNavigation) => {
                                handleInterceptUrl(navState.url);
                            }}
                            javaScriptEnabled
                            domStorageEnabled
                            sharedCookiesEnabled
                            thirdPartyCookiesEnabled
                            originWhitelist={['*']}
                            startInLoadingState
                            renderLoading={() => (
                                <View style={styles.loadingOverlay}>
                                    <ActivityIndicator size="large" color="#FF7A45" />
                                    <Text style={styles.loadingText}>Loading NIBSS consent portal...</Text>
                                </View>
                            )}
                            style={styles.webview}
                        />
                    ) : null}

                    {isLoading && (
                        <View style={styles.loadingOverlay} pointerEvents="none">
                            <ActivityIndicator size="large" color="#FF7A45" />
                            <Text style={styles.loadingText}>Loading NIBSS consent portal...</Text>
                        </View>
                    )}
                </View>
            </SafeAreaView>
        </Modal>
    );
};

const styles = ScaledSheet.create({
    safeArea: {
        flex: 1,
        backgroundColor: '#FFFFFF',
    },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: '16@s',
        paddingVertical: '12@vs',
        borderBottomWidth: StyleSheet.hairlineWidth,
        borderBottomColor: '#E2E8F0',
        backgroundColor: '#FFFFFF',
    },
    headerTitle: {
        fontSize: '16@ms',
        fontWeight: '600',
        color: '#0F172A',
    },
    headerActions: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: '12@s',
    },
    reloadButton: {
        paddingVertical: '4@vs',
        paddingHorizontal: '8@s',
        borderRadius: '6@ms',
        backgroundColor: '#F1F5F9',
    },
    reloadText: {
        fontSize: '12@ms',
        fontWeight: '600',
        color: '#475569',
    },
    closeButton: {
        padding: '2@ms',
    },
    webviewContainer: {
        flex: 1,
        position: 'relative',
    },
    webview: {
        flex: 1,
        backgroundColor: '#FFFFFF',
    },
    loadingOverlay: {
        ...StyleSheet.absoluteFillObject,
        backgroundColor: '#FFFFFF',
        justifyContent: 'center',
        alignItems: 'center',
        zIndex: 10,
    },
    loadingText: {
        marginTop: '12@vs',
        fontSize: '14@ms',
        color: '#64748B',
    },
});

export default NibssIgreeWebViewModal;
