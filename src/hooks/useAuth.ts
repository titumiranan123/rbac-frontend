import { useState, useCallback, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { authService } from '@/lib/auth-service';
import { clearTokens, setTokens } from '@/lib/auth';
import { useAuthStore } from '@/store/auth.store';

export function useAuth() {
  const router = useRouter();
  const { user, isAuthenticated, isLoading, setUser, setLoading, login } = useAuthStore();
  const [error, setError] = useState<string | null>(null);

  const handleLogin = useCallback(
    async (email: string, password: string) => {
      setError(null);
      setLoading(true);

      try {
        const result = await authService.login(email, password);
        setTokens(result.accessToken, result.refreshToken);
        login(result.user, result.accessToken, result.refreshToken);
        router.push('/dashboard');
      } catch (err: any) {
        setError(err.response?.data?.message || 'Login failed');
        throw err;
      } finally {
        setLoading(false);
      }
    },
    [login, router, setLoading]
  );

  const handleRegister = useCallback(
    async (data: { email: string; password: string; firstName: string; lastName: string }) => {
      setError(null);
      setLoading(true);

      try {
        const result = await authService.register(data);
        setTokens(result.accessToken, result.refreshToken);
        login(result.user, result.accessToken, result.refreshToken);
        router.push('/dashboard');
      } catch (err: any) {
        setError(err.response?.data?.message || 'Registration failed');
        throw err;
      } finally {
        setLoading(false);
      }
    },
    [login, router, setLoading]
  );

  const handleLogout = useCallback(async () => {
    setLoading(true);

    try {
      await authService.logout();
    } finally {
      clearTokens();
      setUser(null);
      setLoading(false);
      router.push('/login');
    }
  }, [router, setLoading, setUser]);

  const refreshUser = useCallback(async () => {
    try {
      const userData = await authService.me();
      setUser(userData);
      return userData;
    } catch {
      clearTokens();
      setUser(null);
      return null;
    }
  }, [setUser]);

  useEffect(() => {
    if (!isAuthenticated && !isLoading) {
      refreshUser();
    }
  }, [isAuthenticated, isLoading, refreshUser]);

  return {
    user,
    isAuthenticated,
    isLoading,
    error,
    login: handleLogin,
    register: handleRegister,
    logout: handleLogout,
    refreshUser,
  };
}