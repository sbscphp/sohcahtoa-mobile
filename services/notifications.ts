import { GetNotificationsResponse, GetUnreadCountResponse, MarkAsReadResponse, RegisterDevicePayload, RegisterDeviceResponse } from '@/types/api/notifications';
import api from './api';

export const registerDevice = async (payload: RegisterDevicePayload): Promise<RegisterDeviceResponse> => {
    const response = await api.post('/notifications/devices', payload);
    return response.data;
};

export const getNotifications = async (): Promise<GetNotificationsResponse> => {
    const response = await api.get('/notifications');
    return response.data;
};

export const getUnreadCount = async (): Promise<GetUnreadCountResponse> => {
    const response = await api.get('/notifications/unread/count');
    return response.data;
};

export const markAsRead = async (id: string): Promise<MarkAsReadResponse> => {
    const response = await api.post(`/notifications/${id}/read`);
    return response.data;
};

export const markAllAsRead = async (): Promise<MarkAsReadResponse> => {
    const response = await api.post('/notifications/read-all');
    return response.data;
};
