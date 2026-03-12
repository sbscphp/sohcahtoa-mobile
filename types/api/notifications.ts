export interface Notification {
    id: string;
    title: string;
    message: string;
    date: string;
    time: string;
    isRead: boolean;
    type: 'transaction' | 'system' | 'general';
}

export interface GetNotificationsResponse {
    success: boolean;
    data: Notification[];
}
