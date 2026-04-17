import { User } from '@/types/api/user';
import api from './api';

export const fetchUser = async (userId: string): Promise<User> => {
    const response = await api.get(`/users/${userId}`);
    return response.data;
};

export const changePassword = async (payload: { oldPassword?: string, newPassword?: string }): Promise<any> => {
    const response = await api.post('/auth/change-password', payload);
    return response.data;
};
