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
import { getNotificationRoute } from '@/utils/helpers';
import { getTransactionById } from '@/services/transactions';

Notifications.setNotificationHandler({
    handleNotification: async () => ({
        shouldShowAlert: true,
        shouldPlaySound: true,
        shouldSetBadge: true,
        shouldShowBanner: true,
        shouldShowList: true,
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

        responseListener.current = Notifications.addNotificationResponseReceivedListener(async (response: Notifications.NotificationResponse) => {
            const data = (response.notification.request.content.data || {}) as Record<string, any>;
            const title = response.notification.request.content.title || '';
            const body = response.notification.request.content.body || '';
            
            if (data?.notificationId) {
                markAsRead(data.notificationId).catch(() => {});
                queryClient.invalidateQueries({ queryKey: ['notifications'] });
            }
            let routeInfo = getNotificationRoute(data?.actionUrl, data, [], title, body);
            
            // Fallback: If routeInfo is null but we have a transactionId, fetch from server
            if (!routeInfo) {
                let transactionId = data?.transactionId || data?.transaction_id || data?.id;
                if (data?.actionUrl) {
                    const idMatch = data.actionUrl.match(/[?&](transactionId|transaction_id|id)=([^&]+)/);
                    if (idMatch && idMatch[2]) {
                        transactionId = decodeURIComponent(idMatch[2]);
                    }
                    if (!transactionId) {
                        const pathPart = data.actionUrl.split('?')[0];
                        const segments = pathPart.split('/').filter(Boolean);
                        for (let i = segments.length - 1; i >= 0; i--) {
                            const seg = segments[i];
                            if (seg && (seg.length > 5 || /^\d+$/.test(seg))) {
                                transactionId = seg;
                                break;
                            }
                        }
                    }
                }
                
                if (transactionId) {
                    try {
                        const res = await getTransactionById(transactionId);
                        if (res && res.success && res.data && res.data.type) {
                            routeInfo = getNotificationRoute(data?.actionUrl, { ...data, type: res.data.type, transactionId }, [], title, body);
                        }
                    } catch (e) {
                        console.error('Failed to fetch transaction type:', e);
                    }
                }
            }

            if (routeInfo) {
                router.push({
                    pathname: routeInfo.pathname as any,
                    params: routeInfo.params
                });
            } else if (data?.actionUrl) {
                router.push(data.actionUrl);
            } else {
                router.push('/notifications');
            }
        });

        return () => {
            notificationListener.current?.remove();
            responseListener.current?.remove();
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
