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
    const hasHandledInitialResponse = useRef(false);

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
        }).catch((err) => {
            console.warn('Push registration error:', err);
        });

        // Handle cold start: App was launched from killed state via notification tap
        Notifications.getLastNotificationResponseAsync().then(response => {
            if (response && !hasHandledInitialResponse.current) {
                hasHandledInitialResponse.current = true;
                handleNotificationResponse(response, queryClient);
            }
        }).catch((err) => {
            console.warn('Error checking last notification response:', err);
        });

        notificationListener.current = Notifications.addNotificationReceivedListener((notification: Notifications.Notification) => {
            if (isAuthenticated) {
                queryClient.invalidateQueries({ queryKey: ['notifications'] });
            }
        });

        responseListener.current = Notifications.addNotificationResponseReceivedListener(async (response: Notifications.NotificationResponse) => {
            handleNotificationResponse(response, queryClient);
        });

        return () => {
            notificationListener.current?.remove();
            responseListener.current?.remove();
        };
    }, [isAuthenticated, hasSeenPrompt]);
};

async function handleNotificationResponse(response: Notifications.NotificationResponse, queryClient: any) {
    const data = (response.notification.request.content.data || {}) as Record<string, any>;
    const title = response.notification.request.content.title || '';
    const body = response.notification.request.content.body || '';

    const notifId = data?.notificationId || data?.id;
    if (notifId) {
        markAsRead(notifId).catch(() => {});
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
    } else if (
        data?.actionUrl &&
        typeof data.actionUrl === 'string' &&
        data.actionUrl.startsWith('/') &&
        !data.actionUrl.startsWith('//')
    ) {
        router.push(data.actionUrl as any);
    } else {
        router.push('/notifications');
    }
}


async function registerForPushNotificationsAsync() {
    let token;

    try {
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
                console.warn('Error getting device push token', e);
            }
        } else {
            console.log('Must use physical device for Push Notifications');
        }
    } catch (error) {
        console.warn('Failed to configure push notifications:', error);
    }

    return token;
}
