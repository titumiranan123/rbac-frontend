'use client';

import { ReactNode, useEffect } from 'react';
import { useAuthStore } from '@/store/auth.store';
import { useRouter } from 'next/navigation';
import Cookies from 'js-cookie';

export function AuthProvider({ children }: { children: ReactNode }) {
  const { user, isAuthenticated, isLoading, checkAuth, setUser } = useAuthStore();
  const router = useRouter();

  useEffect(() => {
    checkAuth();
  }, [checkAuth]);

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      const token = Cookies.get('accessToken');
      if (token) {
        fetch('/api/auth/me')
          .then((res) => {
            if (res.ok) return res.json();
            throw new Error('Not authenticated');
          })
          .then((userData) => {
            setUser(userData);
          })
          .catch(() => {
            Cookies.remove('accessToken');
            Cookies.remove('refreshToken');
            router.push('/login');
          });
      } else if (!window.location.pathname.startsWith('/login') &&
                 !window.location.pathname.startsWith('/register')) {
        router.push('/login');
      }
    }
  }, [isLoading, isAuthenticated, user, setUser, router]);

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-lg">Loading...</div>
      </div>
    );
  }

  return <>{children}</>;
}