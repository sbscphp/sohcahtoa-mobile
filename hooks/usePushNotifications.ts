import { useRegisterDeviceMutation } from '@/hooks/queries/notifications/useRegisterDeviceMutation';
import { markAsRead } from '@/services/notifications';
import { useAuthStore } from '@/stores/useAuthStore';
import { useQueryClient } from '@tanstack/react-query';
import * as Device from 'expo-device';
import * as Notifications from 'expo-notifications';
import { router } from 'expo-router';
import { useEffect, useRef } from 'react';
import { Platform } from 'react-native';
import Constants from 'expo-constants';

Notifications.setNotificationHandler({
    handleNotification: async () => ({
        shouldShowAlert: true,
        shouldPlaySound: true,
        shouldSetBadge: true,
    }),
});

export const usePushNotifications = () => {
    const { mutate: register } = useRegisterDeviceMutation();
    const queryClient = useQueryClient();
    const isAuthenticated = useAuthStore((state) => state.isAuthenticated);
    const hasSeenPrompt = useAuthStore((state) => state.hasSeenNotificationPrompt);
    const notificationListener = useRef<Notifications.EventSubscription | undefined>(undefined);
    const responseListener = useRef<Notifications.EventSubscription | undefined>(undefined);
 
    useEffect(() => {
        registerForPushNotificationsAsync().then(token => {
            if (token && isAuthenticated) {
                const payload = {
                    token,
                    platform: Platform.OS === 'ios' ? 'IOS' : 'ANDROID' as 'IOS' | 'ANDROID',
                    deviceId: Device.osBuildId || 'unknown',
                    deviceName: Device.deviceName || 'unknown',
                    appVersion: Constants.expoConfig?.version || '1.0.0',
                };
                register(payload);
            }
        });

        notificationListener.current = Notifications.addNotificationReceivedListener((notification: Notifications.Notification) => {
            if (isAuthenticated) {
                queryClient.invalidateQueries({ queryKey: ['notifications'] });
            }
        });

        responseListener.current = Notifications.addNotificationResponseReceivedListener((response: Notifications.NotificationResponse) => {
            const data = response.notification.request.content.data;
            if (data?.notificationId) {
                markAsRead(data.notificationId).catch(() => {});
                queryClient.invalidateQueries({ queryKey: ['notifications'] });
            }
            if (data?.actionUrl) {
                router.push(data.actionUrl);
            } else {
                router.push('/notifications');
            }
        });

        return () => {
            if (notificationListener.current) {
                Notifications.removeNotificationSubscription(notificationListener.current);
            }
            if (responseListener.current) {
                Notifications.removeNotificationSubscription(responseListener.current);
            }
        };
    }, [isAuthenticated, hasSeenPrompt]);
};


async function registerForPushNotificationsAsync() {
    let token;

    if (Platform.OS === 'android') {
        await Notifications.setNotificationChannelAsync('default', {
            name: 'default',
            importance: Notifications.AndroidImportance.MAX,
            vibrationPattern: [0, 250, 250, 250],
            lightColor: '#FF231F7C',
        });
    }

    if (Device.isDevice) {
        const { status: existingStatus } = await Notifications.getPermissionsAsync();
        if (existingStatus !== 'granted') {
            return;
        }
        
        try {
            token = (await Notifications.getDevicePushTokenAsync()).data;
        } catch (e) {
            console.error('Error getting push token', e);
        }
    } else {
        console.log('Must use physical device for Push Notifications');
    }

    return token;
}
