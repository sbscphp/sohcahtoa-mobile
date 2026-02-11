import api from './api';

// Define the Login Payload and Response types
export interface LoginPayload {
    email: string;
    pass: string;
}

export interface LoginResponse {
    token: string;
    refresh_token: string;
    user: {
        id: string;
        name: string;
    };
}

// API Call Function
export const loginUser = async (credentials: LoginPayload): Promise<LoginResponse> => {
    const response = await api.post('/auth/login', credentials);
    return response.data;
};
