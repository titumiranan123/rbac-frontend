'use client';

import { useState, useEffect, useCallback } from 'react';
import { apiClient } from '@/lib/api-client';

interface UserSummaryProps {
  onViewAll?: () => void;
}

interface RoleCount {
  role: string;
  count: number;
  color: string;
}

interface UserStats {
  total: number;
  active: number;
  inactive: number;
  roleCounts: RoleCount[];
}

const roleColors: Record<string, { bg: string; text: string; border: string }> = {
  ADMIN: { bg: 'bg-(--color-primary)/10', text: 'text-(--color-primary)', border: 'border-(--color-primary)/20' },
  MANAGER: { bg: 'bg-blue-100', text: 'text-blue-600', border: 'border-blue-200' },
  AGENT: { bg: 'bg-green-100', text: 'text-green-600', border: 'border-green-200' },
  CUSTOMER: { bg: 'bg-purple-100', text: 'text-purple-600', border: 'border-purple-200' },
};

const roleIcons: Record<string, string> = {
  ADMIN: 'M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z',
  MANAGER: 'M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z',
  AGENT: 'M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z',
  CUSTOMER: 'M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z',
};

export function UserSummary({ onViewAll }: UserSummaryProps) {
  const [stats, setStats] = useState<UserStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchStats = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await apiClient.get('/users?page=1&limit=1');
      const allUsers = await apiClient.get('/users?page=1&limit=1000');

      const users = allUsers.data.data || [];
      const total = allUsers.data.total || users.length;

      const roleCounts: RoleCount[] = ['ADMIN', 'MANAGER', 'AGENT', 'CUSTOMER'].map((role) => ({
        role,
        count: users.filter((u: any) => u.role?.name === role).length,
        color: roleColors[role]?.text || 'text-gray-600',
      }));

      const active = users.filter((u: any) => u.isActive).length;
      const inactive = total - active;

      setStats({ total, active, inactive, roleCounts });
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to load user statistics');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchStats();
  }, [fetchStats]);

  if (loading) {
    return (
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
        <div className="flex items-center justify-between mb-6">
<h3 className="text-lg font-semibold text-(--color-gray-900)">User Summary</h3>
        </div>
        <div className="space-y-4">
          <div className="flex items-center gap-4 animate-pulse">
            <div className="w-12 h-12 bg-gray-200 rounded-lg"></div>
            <div className="flex-1">
              <div className="h-4 bg-gray-200 rounded w-16 mb-2"></div>
              <div className="h-6 bg-gray-200 rounded w-24"></div>
            </div>
          </div>
          <div className="flex items-center gap-4 animate-pulse">
            <div className="w-12 h-12 bg-gray-200 rounded-lg"></div>
            <div className="flex-1">
              <div className="h-4 bg-gray-200 rounded w-16 mb-2"></div>
              <div className="h-6 bg-gray-200 rounded w-24"></div>
            </div>
          </div>
          <div className="flex items-center gap-4 animate-pulse">
            <div className="w-12 h-12 bg-gray-200 rounded-lg"></div>
            <div className="flex-1">
              <div className="h-4 bg-gray-200 rounded w-16 mb-2"></div>
              <div className="h-6 bg-gray-200 rounded w-24"></div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
        <h3 className="text-lg font-semibold text-(--color-gray-900) mb-4">User Summary</h3>
        <div className="text-center py-8">
          <svg className="w-12 h-12 text-gray-300 mx-auto mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
          </svg>
          <p className="text-(--color-secondary)">{error}</p>
          <button
            onClick={fetchStats}
            className="mt-4 px-4 py-2 bg-(--color-primary) text-white rounded-lg hover:bg-(--color-primary-hover) transition-colors"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  if (!stats) return null;

  const statusItems = [
    { label: 'Total Users', value: stats.total, color: 'text-(--color-gray-900)', bg: 'bg-gray-100' },
    { label: 'Active', value: stats.active, color: 'text-green-600', bg: 'bg-green-100' },
    { label: 'Inactive', value: stats.inactive, color: 'text-red-600', bg: 'bg-red-100' },
  ];

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-lg font-semibold text-(--color-gray-900)">User Summary</h3>
        {onViewAll && (
          <button
            onClick={onViewAll}
            className="text-sm text-(--color-primary) hover:underline font-medium"
          >
            View All
          </button>
        )}
      </div>

      <div className="space-y-4 mb-6">
        {statusItems.map((item) => (
          <div key={item.label} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
            <div className="flex items-center gap-3">
              <div className={`w-10 h-10 ${item.bg} rounded-lg flex items-center justify-center`}>
                <svg className={`w-5 h-5 ${item.color}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
              </div>
<span className="text-sm text-(--color-secondary)">{item.label}</span>
            </div>
            <span className={`text-xl font-bold ${item.color}`}>{item.value}</span>
          </div>
        ))}
      </div>

      <div className="border-t border-gray-100 pt-4">
        <h4 className="text-sm font-medium text-(--color-secondary) mb-3">By Role</h4>
        <div className="space-y-3">
          {stats.roleCounts.map((item) => {
            const colors = roleColors[item.role] || { bg: 'bg-gray-100', text: 'text-gray-600', border: 'border-gray-200' };
            const iconPath = roleIcons[item.role] || 'M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z';
            const percentage = stats.total > 0 ? Math.round((item.count / stats.total) * 100) : 0;

            return (
              <div key={item.role} className="space-y-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className={`w-8 h-8 ${colors.bg} rounded-lg flex items-center justify-center`}>
                      <svg className={`w-4 h-4 ${colors.text}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d={iconPath} />
                      </svg>
                    </div>
                    <span className="text-sm font-medium text-(--color-gray-900)">{item.role}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-bold text-(--color-gray-900)">{item.count}</span>
                    <span className="text-xs text-(--color-secondary)">({percentage}%)</span>
                  </div>
                </div>
                <div className="w-full bg-gray-100 rounded-full h-2">
                  <div
                    className={`h-2 rounded-full ${colors.bg.replace('/10', '')}`}
                    style={{ width: `${percentage}%` }}
                  ></div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

export function UserSummarySkeleton() {
  return <UserSummary />;
}