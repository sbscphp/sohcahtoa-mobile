import { useAuthStore } from '@/stores/useAuthStore';
import axios from 'axios';
import { router } from 'expo-router';


const api = axios.create({
    baseURL: 'https://sohcahtoa-dev.clocksurewise.com/api',
    headers: {
        'Content-Type': 'application/json',
    },
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


let isRefreshing = false;
let failedQueue: Array<{ resolve: (value?: unknown) => void; reject: (reason?: any) => void }> = [];

const processQueue = (error: any, token: string | null = null) => {
    failedQueue.forEach(prom => {
        if (error) {
            prom.reject(error);
        } else {
            prom.resolve(token);
        }
    });

    failedQueue = [];
};

api.interceptors.response.use(
    (response) => response,
    async (error) => {
        const originalRequest = error.config;

        if (error.response?.status === 401 && !originalRequest._retry) {
            if (isRefreshing) {
                return new Promise(function (resolve, reject) {
                    failedQueue.push({ resolve, reject });
                })
                    .then((token) => {
                        if (token) {
                            originalRequest.headers.Authorization = `Bearer ${token}`;
                        }
                        return api(originalRequest);
                    })
                    .catch((err) => {
                        return Promise.reject(err);
                    });
            }

            originalRequest._retry = true;
            isRefreshing = true;

            const authStore = useAuthStore.getState();
            const refreshToken = authStore.refreshToken;

            if (!refreshToken) {
                authStore.logout();
                router.replace('/(auth)/login');
                return Promise.reject(error);
            }

            try {
                const response = await axios.post(`${api.defaults.baseURL}/auth/refresh`, {
                    refreshToken: refreshToken
                });

                const { accessToken } = response.data.data;

                authStore.setToken(accessToken);
               
                if (response.data.data.refreshToken) {
                    authStore.setRefreshToken(response.data.data.refreshToken);
                }

                originalRequest.headers.Authorization = `Bearer ${accessToken}`;

                processQueue(null, accessToken);
                return api(originalRequest);
            } catch (refreshError) {
                processQueue(refreshError, null);
                authStore.logout();
                router.replace('/(auth)/login');
                return Promise.reject(refreshError);
            } finally {
                isRefreshing = false;
            }
        }

        return Promise.reject(error);
    }
);

export default api;
