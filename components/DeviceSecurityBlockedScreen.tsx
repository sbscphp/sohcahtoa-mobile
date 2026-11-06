import React from 'react';
import { View, Text, StyleSheet, BackHandler, Platform, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { ShieldCross } from 'iconsax-react-nativejs';

interface DeviceSecurityBlockedScreenProps {
    reason?: string;
}

export default function DeviceSecurityBlockedScreen({ reason }: DeviceSecurityBlockedScreenProps) {
    const handleExit = () => {
        if (Platform.OS === 'android') {
            BackHandler.exitApp();
        }
    };

    return (
        <SafeAreaView style={styles.container}>
            <View style={styles.content}>
                <View style={styles.iconCircle}>
                    <ShieldCross size={64} color="#EF4444" variant="Bold" />
                </View>
                <Text style={styles.title}>Security Restriction</Text>
                <Text style={styles.subtitle}>
                    SohCahToa detected that your device may be rooted or jailbroken.
                </Text>
                <Text style={styles.description}>
                    To safeguard your financial data, funds, and identity against malware and unauthorized interception, this application cannot run on compromised operating systems.
                </Text>
                {reason ? (
                    <View style={styles.reasonBox}>
                        <Text style={styles.reasonText}>{reason}</Text>
                    </View>
                ) : null}

                {Platform.OS === 'android' ? (
                    <TouchableOpacity style={styles.exitButton} onPress={handleExit}>
                        <Text style={styles.exitButtonText}>Close Application</Text>
                    </TouchableOpacity>
                ) : null}
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
        maxWidth: 340,
    },
    iconCircle: {
        width: 110,
        height: 110,
        borderRadius: 55,
        backgroundColor: 'rgba(239, 68, 68, 0.12)',
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 24,
    },
    title: {
        fontSize: 22,
        fontWeight: '700',
        color: '#FFFFFF',
        marginBottom: 12,
        textAlign: 'center',
    },
    subtitle: {
        fontSize: 16,
        fontWeight: '600',
        color: '#F87171',
        marginBottom: 16,
        textAlign: 'center',
    },
    description: {
        fontSize: 14,
        lineHeight: 22,
        color: '#94A3B8',
        textAlign: 'center',
        marginBottom: 24,
    },
    reasonBox: {
        backgroundColor: 'rgba(239, 68, 68, 0.08)',
        borderColor: 'rgba(239, 68, 68, 0.3)',
        borderWidth: 1,
        borderRadius: 8,
        paddingHorizontal: 16,
        paddingVertical: 10,
        marginBottom: 24,
    },
    reasonText: {
        color: '#FCA5A5',
        fontSize: 12,
        fontFamily: Platform.OS === 'ios' ? 'Courier' : 'monospace',
    },
    exitButton: {
        backgroundColor: '#EF4444',
        paddingVertical: 14,
        paddingHorizontal: 32,
        borderRadius: 12,
        width: '100%',
        alignItems: 'center',
    },
    exitButtonText: {
        color: '#FFFFFF',
        fontWeight: '700',
        fontSize: 15,
    },
});
