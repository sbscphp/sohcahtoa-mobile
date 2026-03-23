export interface Notification {
    id: string;
    userId: string;
    notificationId: string;
    title: string;
    body: string;
    icon: string | null;
    actionUrl: string | null;
    data: any;
    isRead: boolean;
    readAt: string | null;
    priority: 'NORMAL' | 'HIGH' | 'LOW';
    expiresAt: string | null;
    createdAt: string;
    updatedAt: string;
    // Keep these for backward compatibility/ui mapping
    date?: string;
    time?: string;
    type?: 'transaction' | 'system' | 'general';
}

export interface GetNotificationsResponse {
    success: boolean;
    data: {
        notifications: Notification[];
        total: number;
        limit: number;
        offset: number;
    };
}

export interface RegisterDevicePayload {
    token: string;
    platform: 'IOS' | 'ANDROID';
    deviceId: string;
    deviceName: string;
    appVersion: string;
}

export interface RegisterDeviceResponse {
    success: boolean;
    message: string;
}

export interface GetUnreadCountResponse {
    success: boolean;
    data: {
        count: number;
    };
}

export interface MarkAsReadResponse {
    success: boolean;
    message: string;
}
