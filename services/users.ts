import { User } from '@/types/api/user';
import api from './api';

// Fetcher function
export const fetchUser = async (userId: string): Promise<User> => {
    const response = await api.get(`/users/${userId}`);
    return response.data;
};

// Change Password
export const changePassword = async (payload: { oldPassword?: string, newPassword?: string }): Promise<any> => {
    // Note: Assuming endpoint is /auth/change-password based on typical auth service
    const response = await api.post('/auth/change-password', payload);
    return response.data;
};
