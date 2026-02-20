import { User } from '@/types/api/user';
import api from './api';

// Fetcher function
export const fetchUser = async (userId: string): Promise<User> => {
    const response = await api.get(`/users/${userId}`);
    return response.data;
};
