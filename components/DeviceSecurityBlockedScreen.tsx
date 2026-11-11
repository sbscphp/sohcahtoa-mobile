import React, { useState } from 'react';
import { View, Text, StyleSheet, BackHandler, Platform, TouchableOpacity, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { ShieldCross, ShieldSecurity } from 'iconsax-react-nativejs';
import { openDeveloperSettings, SecurityCompromiseType } from '@/utils/deviceIntegrity';

interface DeviceSecurityBlockedScreenProps {
    reason?: string;
    type?: SecurityCompromiseType;
    onRecheck?: () => Promise<void> | void;
}

export default function DeviceSecurityBlockedScreen({
    reason,
    type,
    onRecheck,
}: DeviceSecurityBlockedScreenProps) {
    const [isRechecking, setIsRechecking] = useState(false);
    const isUsbDebugging = type === 'usb_debugging';

    const handleExit = () => {
        if (Platform.OS === 'android') {
            BackHandler.exitApp();
        }
    };

    const handleOpenSettings = async () => {
        await openDeveloperSettings();
    };

    const handleRecheck = async () => {
        if (onRecheck) {
            setIsRechecking(true);
            try {
                await onRecheck();
            } finally {
                setIsRechecking(false);
            }
        }
    };

    return (
        <SafeAreaView style={styles.container}>
            <View style={styles.content}>
                <View style={[styles.iconCircle, isUsbDebugging && styles.iconCircleWarning]}>
                    {isUsbDebugging ? (
                        <ShieldSecurity size={64} color="#F59E0B" variant="Bold" />
                    ) : (
                        <ShieldCross size={64} color="#EF4444" variant="Bold" />
                    )}
                </View>

                <Text style={styles.title}>
                    {isUsbDebugging ? 'USB Debugging Detected' : 'Security Restriction'}
                </Text>

                <Text style={[styles.subtitle, isUsbDebugging && styles.subtitleWarning]}>
                    {isUsbDebugging
                        ? 'Please turn off USB Debugging to continue'
                        : 'SohCahToa detected that your device may be rooted or jailbroken.'}
                </Text>

                <Text style={styles.description}>
                    {isUsbDebugging
                        ? 'For your financial security and to protect your account from remote interception, SohCahToa cannot be accessed while USB Debugging is active.'
                        : 'To safeguard your financial data, funds, and identity against malware and unauthorized interception, this application cannot run on compromised operating systems.'}
                </Text>

                {isUsbDebugging ? (
                    <View style={styles.instructionCard}>
                        <Text style={styles.instructionHeader}>How to turn it off:</Text>
                        <View style={styles.instructionStep}>
                            <Text style={styles.stepNumber}>1.</Text>
                            <Text style={styles.stepText}>
                                Tap <Text style={styles.stepBold}>Turn Off USB Debugging</Text> below to open Developer Options.
                            </Text>
                        </View>
                        <View style={styles.instructionStep}>
                            <Text style={styles.stepNumber}>2.</Text>
                            <Text style={styles.stepText}>
                                Find <Text style={styles.stepBold}>USB Debugging</Text> and toggle it to <Text style={styles.stepBold}>Off</Text>.
                            </Text>
                        </View>
                        <View style={styles.instructionStep}>
                            <Text style={styles.stepNumber}>3.</Text>
                            <Text style={styles.stepText}>
                                Return to SohCahToa to continue automatically.
                            </Text>
                        </View>
                    </View>
                ) : null}

                {reason ? (
                    <View style={styles.reasonBox}>
                        <Text style={styles.reasonText}>{reason}</Text>
                    </View>
                ) : null}

                <View style={styles.actionsContainer}>
                    {isUsbDebugging && Platform.OS === 'android' ? (
                        <TouchableOpacity
                            style={styles.primaryActionButton}
                            onPress={handleOpenSettings}
                            activeOpacity={0.8}
                            testID="open-developer-settings-button"
                        >
                            <Text style={styles.primaryActionText}>Turn Off USB Debugging</Text>
                        </TouchableOpacity>
                    ) : null}

                    {onRecheck ? (
                        <TouchableOpacity
                            style={styles.secondaryActionButton}
                            onPress={handleRecheck}
                            disabled={isRechecking}
                            activeOpacity={0.8}
                            testID="recheck-security-button"
                        >
                            {isRechecking ? (
                                <ActivityIndicator size="small" color="#FFFFFF" />
                            ) : (
                                <Text style={styles.secondaryActionText}>Recheck Security</Text>
                            )}
                        </TouchableOpacity>
                    ) : null}

                    {Platform.OS === 'android' ? (
                        <TouchableOpacity
                            style={styles.exitButton}
                            onPress={handleExit}
                            activeOpacity={0.8}
                            testID="close-application-button"
                        >
                            <Text style={styles.exitButtonText}>Close Application</Text>
                        </TouchableOpacity>
                    ) : null}
                </View>
            </View>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#0F172A',
        justifyContent: 'center',
        alignItems: 'center',
        padding: 24,
    },
    content: {
        alignItems: 'center',
        maxWidth: 360,
        width: '100%',
    },
    iconCircle: {
        width: 104,
        height: 104,
        borderRadius: 52,
        backgroundColor: 'rgba(239, 68, 68, 0.12)',
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 20,
    },
    iconCircleWarning: {
        backgroundColor: 'rgba(245, 158, 11, 0.12)',
    },
    title: {
        fontSize: 22,
        fontWeight: '700',
        color: '#FFFFFF',
        marginBottom: 10,
        textAlign: 'center',
    },
    subtitle: {
        fontSize: 15,
        fontWeight: '600',
        color: '#F87171',
        marginBottom: 14,
        textAlign: 'center',
    },
    subtitleWarning: {
        color: '#FBBF24',
    },
    description: {
        fontSize: 13,
        lineHeight: 20,
        color: '#94A3B8',
        textAlign: 'center',
        marginBottom: 20,
    },
    instructionCard: {
        width: '100%',
        backgroundColor: 'rgba(30, 41, 59, 0.8)',
        borderColor: 'rgba(245, 158, 11, 0.25)',
        borderWidth: 1,
        borderRadius: 12,
        padding: 16,
        marginBottom: 20,
    },
    instructionHeader: {
        color: '#FBBF24',
        fontSize: 13,
        fontWeight: '700',
        marginBottom: 10,
    },
    instructionStep: {
        flexDirection: 'row',
        marginBottom: 8,
    },
    stepNumber: {
        color: '#F59E0B',
        fontWeight: '700',
        width: 18,
        fontSize: 12,
        lineHeight: 18,
    },
    stepText: {
        color: '#CBD5E1',
        fontSize: 12,
        lineHeight: 18,
        flex: 1,
    },
    stepBold: {
        color: '#FFFFFF',
        fontWeight: '700',
    },
    reasonBox: {
        backgroundColor: 'rgba(239, 68, 68, 0.08)',
        borderColor: 'rgba(239, 68, 68, 0.3)',
        borderWidth: 1,
        borderRadius: 8,
        paddingHorizontal: 16,
        paddingVertical: 8,
        marginBottom: 20,
        width: '100%',
    },
    reasonText: {
        color: '#FCA5A5',
        fontSize: 11,
        textAlign: 'center',
        fontFamily: Platform.OS === 'ios' ? 'Courier' : 'monospace',
    },
    actionsContainer: {
        width: '100%',
        gap: 10,
    },
    primaryActionButton: {
        backgroundColor: '#F59E0B',
        paddingVertical: 14,
        borderRadius: 12,
        width: '100%',
        alignItems: 'center',
    },
    primaryActionText: {
        color: '#0F172A',
        fontWeight: '700',
        fontSize: 15,
    },
    secondaryActionButton: {
        backgroundColor: 'rgba(255, 255, 255, 0.08)',
        borderColor: 'rgba(255, 255, 255, 0.16)',
        borderWidth: 1,
        paddingVertical: 13,
        borderRadius: 12,
        width: '100%',
        alignItems: 'center',
    },
    secondaryActionText: {
        color: '#FFFFFF',
        fontWeight: '600',
        fontSize: 14,
    },
    exitButton: {
        backgroundColor: 'transparent',
        paddingVertical: 10,
        borderRadius: 12,
        width: '100%',
        alignItems: 'center',
    },
    exitButtonText: {
        color: '#EF4444',
        fontWeight: '600',
        fontSize: 13,
    },
});
