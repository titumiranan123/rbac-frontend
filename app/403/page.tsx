'use client';

import { useEffect } from 'react';
import { useAuthStore } from '@/store/auth.store';

export default function ForbiddenPage() {
  const { logout } = useAuthStore();

  useEffect(() => {
    const timer = setTimeout(() => logout(), 5000);
    return () => clearTimeout(timer);
  }, [logout]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 p-4">
      <div className="max-w-md w-full bg-white rounded-xl shadow-lg p-8 text-center">
        <div className="w-20 h-20 bg-[#FD5E2B]/10 rounded-full flex items-center justify-center mx-auto mb-6">
          <svg className="w-10 h-10 text-[#FD5E2B]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M18.364 18.364A9 9 0 005.636 5.636m12.728 12.728A9 9 0 015.636 5.636m12.728 12.728L5.636 5.636" />
          </svg>
        </div>

        <h1 className="text-4xl font-bold text-[#1F232A] mb-2">403</h1>
        <h2 className="text-xl font-semibold text-[#404857] mb-4">Access Forbidden</h2>
        <p className="text-[#404857] mb-6">You don&apos;t have permission to access this page. Redirecting in 5s...</p>

        <div className="space-y-3">
          <button onClick={() => logout()} className="w-full bg-[#FD5E2B] text-white py-3 rounded-lg hover:bg-[#e04d1f] transition-colors font-medium">
            Go to Login
          </button>
        </div>
      </div>
    </div>
  );
}