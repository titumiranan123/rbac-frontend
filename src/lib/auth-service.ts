import { apiClient } from './api-client';
import { setTokens, clearTokens } from './auth';
import { User } from '@/types';

export const authService = {
  async login(email: string, password: string): Promise<{ user: User; accessToken: string; refreshToken: string }> {
    const response = await apiClient.post('/auth/login', { email, password });
    const { accessToken, refreshToken, user } = response.data;

    setTokens(accessToken, refreshToken);

    return { user, accessToken, refreshToken };
  },

  async register(data: {
    email: string;
    password: string;
    firstName: string;
    lastName: string;
  }): Promise<{ user: User; accessToken: string; refreshToken: string }> {
    const response = await apiClient.post('/auth/register', data);
    const { accessToken, refreshToken, user } = response.data;

    setTokens(accessToken, refreshToken);

    return { user, accessToken, refreshToken };
  },

  async logout(): Promise<void> {
    try {
      await apiClient.post('/auth/logout');
    } finally {
      clearTokens();
    }
  },

  async me(): Promise<User> {
    const response = await apiClient.get('/auth/me');
    return response.data;
  },
};