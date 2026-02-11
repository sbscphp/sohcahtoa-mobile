import api from './api';

// Define the User type (replace with actual interface)
export interface User {
    id: string;
    name: string;
    email: string;
}

// Fetcher function
export const fetchUser = async (userId: string): Promise<User> => {
    const response = await api.get(`/users/${userId}`);
    return response.data;
};
