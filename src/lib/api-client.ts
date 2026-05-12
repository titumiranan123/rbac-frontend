import axios, { AxiosError, InternalAxiosRequestConfig } from 'axios';
import { getAccessToken, clearTokens } from './auth';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000/api';

export const apiClient = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  withCredentials: true,
});

let isRefreshing = false;
let refreshPromise: Promise<string> | null = null;

const handleTokenRefresh = async (): Promise<string> => {
  const currentRefreshToken = typeof window !== 'undefined'
    ? (await import('js-cookie')).default.get('refreshToken')
    : null;

  if (!currentRefreshToken) {
    throw new Error('No refresh token');
  }

  const response = await axios.post(`${API_URL}/auth/refresh`, {
    refreshToken: currentRefreshToken,
  });

  const { accessToken, refreshToken } = response.data;

  const Cookies = (await import('js-cookie')).default;
  Cookies.set('accessToken', accessToken);
  Cookies.set('refreshToken', refreshToken);

  return accessToken;
};

const processQueue = (error: Error | null, token: string | null = null) => {
  return Promise.resolve();
};

apiClient.interceptors.request.use(
  async (config: InternalAxiosRequestConfig) => {
    const token = getAccessToken();

    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }

    return config;
  },
  (error) => Promise.reject(error)
);

apiClient.interceptors.response.use(
  (response) => response,
  async (error: AxiosError) => {
    const originalRequest = error.config as InternalAxiosRequestConfig & { _retry?: boolean };

    if (error.response?.status === 401 && !originalRequest._retry) {
      if (isRefreshing) {
        try {
          const token = await refreshPromise;
          originalRequest.headers.Authorization = `Bearer ${token}`;
          return apiClient(originalRequest);
        } catch {
          clearTokens();
          window.location.href = '/login';
          return Promise.reject(error);
        }
      }

      originalRequest._retry = true;
      isRefreshing = true;

      refreshPromise = handleTokenRefresh()
        .then((token) => {
          isRefreshing = false;
          refreshPromise = null;
          originalRequest.headers.Authorization = `Bearer ${token}`;
          return token;
        })
        .catch((err) => {
          isRefreshing = false;
          refreshPromise = null;
          clearTokens();
          window.location.href = '/login';
          return Promise.reject(err);
        });

      return refreshPromise.then((token) => {
        return apiClient(originalRequest);
      }).catch(() => {
        return Promise.reject(error);
      });
    }

    return Promise.reject(error);
  }
);

export default apiClient;