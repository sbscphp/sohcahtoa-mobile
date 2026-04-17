import { useRouter } from 'expo-router';
import { Notification } from 'iconsax-react-nativejs';
import React, { useState } from 'react';
import { Text, View, Alert } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { ScaledSheet, moderateScale } from 'react-native-size-matters';
import * as Notifications from 'expo-notifications';
import AuthHeader from '../../components/AuthHeader';
import PrimaryButton from '../../components/PrimaryButton';
import { Colors } from '../../constants/theme';
import { useAuthStore } from '@/stores/useAuthStore';

export default function AllowNotificationsScreen() {
    const router = useRouter();
    const insets = useSafeAreaInsets();
    const setHasSeenNotificationPrompt = useAuthStore((s) => s.setHasSeenNotificationPrompt);
    const [loading, setLoading] = useState(false);

    const handleAllow = async () => {
        setLoading(true);
        try {
            const { status: existingStatus } = await Notifications.getPermissionsAsync();
            let finalStatus = existingStatus;
            
            if (existingStatus !== 'granted') {
                const { status } = await Notifications.requestPermissionsAsync();
                finalStatus = status;
            }
            
            if (finalStatus !== 'granted') {
                setHasSeenNotificationPrompt(true);
                Alert.alert(
                    'Notifications Disabled',
                    'To get the best experience, please enable notifications in your device settings.',
                    [{ text: 'OK', onPress: () => router.replace('/(tabs)') }]
                );
            } else {
                setHasSeenNotificationPrompt(true);
                router.replace('/(tabs)');
            }
        } catch (error) {
            console.error('Error requesting notification permission:', error);
            router.replace('/(tabs)');
        } finally {
            setLoading(false);
        }
    };

    const handleSkip = () => {
        setHasSeenNotificationPrompt(true);
        router.replace('/(tabs)');
    };

    return (
        <View style={[styles.container, { paddingTop: insets.top, paddingBottom: insets.bottom }]}>
            <View style={styles.content}>
                <View style={styles.textSection}>
                    <Text style={styles.title}>Never miss an update</Text>
                    <Text style={styles.description}>
                        Enable notifications to get real-time updates on your transactions, currency rates, and security alerts.
                    </Text>
                </View>

                <View style={styles.graphicContainer}>
                    <View style={styles.circleOuter} />
                    <View style={styles.circleMiddle} />
                    <View style={styles.circleInner}>
                        <Notification variant="Bold" size={moderateScale(64)} color="#FFFFFF" />
                    </View>
                </View>

                <View style={styles.footer}>
                    <PrimaryButton
                        title="Allow Notifications"
                        onPress={handleAllow}
                        loading={loading}
                    />
                    <PrimaryButton
                        title="Skip for Now"
                        onPress={handleSkip}
                        style={styles.skipButton}
                        textStyle={styles.skipButtonText}
                    />
                </View>
            </View>
        </View>
    );
}

const styles = ScaledSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#FFFFFF',
    },
    content: {
        flex: 1,
        paddingHorizontal: '24@s',
        paddingTop: '32@vs',
    },
    textSection: {
        marginBottom: '48@vs',
    },
    title: {
        fontSize: '18@ms',
        fontWeight: '700',
        color: '#0F172A',
        marginBottom: '8@vs',
    },
    description: {
        fontSize: '14@ms',
        color: '#64748B',
        lineHeight: '22@ms',
    },
    graphicContainer: {
        alignItems: 'center',
        justifyContent: 'center',
        flex: 1,
        marginBottom: '40@vs',
    },
    circleOuter: {
        position: 'absolute',
        width: '280@ms',
        height: '280@ms',
        borderRadius: '140@ms',
        backgroundColor: Colors.light.primary,
        opacity: 0.1,
    },
    circleMiddle: {
        position: 'absolute',
        width: '200@ms',
        height: '200@ms',
        borderRadius: '100@ms',
        backgroundColor: Colors.light.primary,
        opacity: 0.2,
    },
    circleInner: {
        width: '120@ms',
        height: '120@ms',
        borderRadius: '60@ms',
        backgroundColor: Colors.light.primary,
        justifyContent: 'center',
        alignItems: 'center',
    },
    footer: {
        marginBottom: '20@vs',
        gap: '12@vs',
    },
    skipButton: {
        backgroundColor: 'transparent',
        borderWidth: 0,
        elevation: 0,
        shadowOpacity: 0,
    },
    skipButtonText: {
        color: '#64748B',
        fontWeight: '600',
    },
});
