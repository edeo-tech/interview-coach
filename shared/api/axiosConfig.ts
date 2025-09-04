import axios, { AxiosError, AxiosResponse, InternalAxiosRequestConfig} from 'axios';

import {
    getAccessToken,
    getRefreshToken,
    setAccessToken,
    setRefreshToken,
    clearAllCookies
} from './cookies';

const baseURL = process.env.NEXT_PUBLIC_BACKEND_URL || process.env.EXPO_PUBLIC_BACKEND_URL;

export const unprotectedApi = axios.create({
    baseURL
});

export const protectedApi = axios.create({
    baseURL
});

export const refreshApi = axios.create({
    baseURL,
    validateStatus: () => true
});

interface CustomInternalAxiosRequestConfig extends InternalAxiosRequestConfig {
    _retry?: boolean;
}

// Need to know if we are refreshing the token, preventing multiple refresh requests
type QueueItem = {
    resolve: (token: string | undefined) => void;
    reject: (error: Error) => void;
}
let isRefreshing = false;
let failedRequestsQueue: QueueItem[] = [];

const processQueue = (error: AxiosError | null, token: string | undefined = undefined) =>
{
    failedRequestsQueue.forEach((promise) =>
    {
        if(error) promise.reject(error);
        else promise.resolve(token);
    });
    failedRequestsQueue = [];
}

// Interceptors
// Intercept protected requests and add the access tpken to the header
protectedApi.interceptors.request.use(
    async (config: InternalAxiosRequestConfig) =>
    {
        const token = getAccessToken();
        if(token) config.headers.Authorization = `Bearer ${token}`;
        return config;
    },
    (error: AxiosError) => Promise.reject(error)
);

// Intercept protected responses and attempt to refresh access token and retry request
protectedApi.interceptors.response.use(
    (response: AxiosResponse) => response,
    async (error: AxiosError) =>
    {
        const originalRequest = error.config as CustomInternalAxiosRequestConfig;

        if(!originalRequest)
        {
            return Promise.reject(error);
        }

        if(error.response?.status !== 401 || originalRequest._retry)
        {
            return Promise.reject(error);
        }

        if(isRefreshing)
        {
            return new Promise((resolve, reject) =>
            {
                failedRequestsQueue.push({ resolve, reject });
            }).then((token) =>
                {
                    originalRequest.headers.Authorization = `Bearer ${token}`;
                    return protectedApi(originalRequest);
                }).catch((error) =>
                {
                    return Promise.reject(error);
                });
        }

        originalRequest._retry = true;
        isRefreshing = true;

        try
        {
            const refreshToken = getRefreshToken();
            const response = await refreshApi.get('/app/users/refresh/', {
                headers: {
                    Authorization: `Bearer ${refreshToken}`
                }
            });

            const newAccessToken = response.data.access_token;
            await setAccessToken(newAccessToken);
            const newRefreshToken = response.data.refresh_token;
            await setRefreshToken(newRefreshToken);

            // Process all queued requests with the new access token
            processQueue(null, newAccessToken);

            return protectedApi(originalRequest);
        }
        catch(refreshError)
        {
            processQueue(refreshError as AxiosError);
            clearAllCookies();
            
            // Import router at the top of the file if needed
            if (typeof window !== 'undefined') {
                // Web environment
                window.location.href = '/login';
            } else {
                // Native environment - we need to import router
                const { router } = require('expo-router');
                router.replace('/(auth)/landing');
            }
            
            return Promise.reject(refreshError);
        }
        finally
        {
            isRefreshing = false;
        }
    }
);

export default {
    unprotectedApi,
    protectedApi,
    refreshApi
};
