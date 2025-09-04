import axios, { AxiosError, AxiosResponse, InternalAxiosRequestConfig } from 'axios';

const baseURL = process.env.NEXT_PUBLIC_BACKEND_URL;

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

// Token management for web
const setAccessToken = (token: string) => {
  if (typeof window !== 'undefined') {
    localStorage.setItem('accessToken', token);
  }
};

const setRefreshToken = (token: string) => {
  if (typeof window !== 'undefined') {
    localStorage.setItem('refreshToken', token);
  }
};

const getAccessToken = () => {
  if (typeof window !== 'undefined') {
    return localStorage.getItem('accessToken');
  }
  return null;
};

const getRefreshToken = () => {
  if (typeof window !== 'undefined') {
    return localStorage.getItem('refreshToken');
  }
  return null;
};

const clearTokens = () => {
  if (typeof window !== 'undefined') {
    localStorage.removeItem('accessToken');
    localStorage.removeItem('refreshToken');
    localStorage.removeItem('userId');
  }
};

// Token refresh logic
type QueueItem = {
  resolve: (token: string | undefined) => void;
  reject: (error: Error) => void;
}

let isRefreshing = false;
let failedRequestsQueue: QueueItem[] = [];

const processQueue = (error: AxiosError | null, token: string | undefined = undefined) => {
  failedRequestsQueue.forEach((promise) => {
    if(error) promise.reject(error);
    else promise.resolve(token);
  });
  failedRequestsQueue = [];
}

// Request interceptor for protected API
protectedApi.interceptors.request.use(
  async (config: InternalAxiosRequestConfig) => {
    const token = getAccessToken();
    if(token) config.headers.Authorization = `Bearer ${token}`;
    return config;
  },
  (error: AxiosError) => Promise.reject(error)
);

// Response interceptor for protected API
protectedApi.interceptors.response.use(
  (response: AxiosResponse) => response,
  async (error: AxiosError) => {
    const originalRequest = error.config as CustomInternalAxiosRequestConfig;

    if(!originalRequest) {
      return Promise.reject(error);
    }

    if(error.response?.status !== 401 || originalRequest._retry) {
      return Promise.reject(error);
    }

    if(isRefreshing) {
      return new Promise((resolve, reject) => {
        failedRequestsQueue.push({ resolve, reject });
      }).then((token) => {
        originalRequest.headers.Authorization = `Bearer ${token}`;
        return protectedApi(originalRequest);
      }).catch((error) => {
        return Promise.reject(error);
      });
    }

    originalRequest._retry = true;
    isRefreshing = true;

    try {
      const refreshToken = getRefreshToken();
      const response = await refreshApi.get('/app/users/refresh/', {
        headers: {
          Authorization: `Bearer ${refreshToken}`
        }
      });

      const newAccessToken = response.data.access_token;
      setAccessToken(newAccessToken);
      const newRefreshToken = response.data.refresh_token;
      setRefreshToken(newRefreshToken);

      // Process all queued requests with the new access token
      processQueue(null, newAccessToken);

      return protectedApi(originalRequest);
    }
    catch(refreshError) {
      processQueue(refreshError as AxiosError);
      clearTokens();
      
      // Redirect to login on web
      if (typeof window !== 'undefined') {
        window.location.href = '/login';
      }
      
      return Promise.reject(refreshError);
    }
    finally {
      isRefreshing = false;
    }
  }
);

export { setAccessToken, setRefreshToken, getAccessToken, getRefreshToken, clearTokens };

export default {
  unprotectedApi,
  protectedApi,
  refreshApi
};