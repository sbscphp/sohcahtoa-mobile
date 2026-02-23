import { useAuthStore } from '@/stores/useAuthStore';
import axios from 'axios';


const api = axios.create({
    baseURL: 'https://sohcahtoa-dev.clocksurewise.com/api',
    headers: {
        'Content-Type': 'application/json',
    },
    // timeout: 10000,
});


api.interceptors.request.use(
    async (config) => {
        const token = useAuthStore.getState().token;
        // console.log('token', token);
        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
    },
    (error) => {
        return Promise.reject(error);
    }
);


api.interceptors.response.use(
    (response) => response,
    async (error) => {
        if (error.response?.status === 401) {
            console.log('401 Unauthorized - Logging out');
            const logout = useAuthStore.getState().logout;
            logout();
        }
        return Promise.reject(error);
    }
);

export default api;
