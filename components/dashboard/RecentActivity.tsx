'use client';

import { useState, useEffect, useCallback } from 'react';
import { apiClient } from '@/lib/api-client';
import { AuditLog } from '@/types';

interface RecentActivityProps {
  limit?: number;
  onViewAll?: () => void;
}

const actionIcons: Record<string, string> = {
  LOGIN: 'M11 16l-4-4m0 0l4-4m-4 4h14m-5 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h7a3 3 0 013 3v1',
  LOGOUT: 'M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1',
  REGISTER: 'M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z',
  CREATE: 'M12 4v16m8-8H4',
  UPDATE: 'M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z',
  DELETE: 'M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16',
  ROLE_CHANGE: 'M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z',
  PERMISSION_CHANGE: 'M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z',
};

const actionColors: Record<string, { bg: string; text: string }> = {
  LOGIN: { bg: 'bg-green-100', text: 'text-green-600' },
  LOGOUT: { bg: 'bg-blue-100', text: 'text-blue-600' },
  REGISTER: { bg: 'bg-purple-100', text: 'text-purple-600' },
  CREATE: { bg: 'bg-indigo-100', text: 'text-indigo-600' },
  UPDATE: { bg: 'bg-yellow-100', text: 'text-yellow-600' },
  DELETE: { bg: 'bg-red-100', text: 'text-red-600' },
  ROLE_CHANGE: { bg: 'bg-orange-100', text: 'text-orange-600' },
  PERMISSION_CHANGE: { bg: 'bg-cyan-100', text: 'text-cyan-600' },
};

const statusIcons: Record<string, string> = {
  success: 'M5 13l4 4L19 7',
  failed: 'M6 18L18 6M6 6l12 12',
};

export function RecentActivity({ limit = 5, onViewAll }: RecentActivityProps) {
  const [activities, setActivities] = useState<AuditLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchActivities = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await apiClient.get(`/audit?page=1&limit=${limit}`);
      setActivities(response.data.data);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to load activities');
    } finally {
      setLoading(false);
    }
  }, [limit]);

  useEffect(() => {
    fetchActivities();
  }, [fetchActivities]);

  const formatTime = (dateStr: string) => {
    const date = new Date(dateStr);
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    const minutes = Math.floor(diff / 60000);
    const hours = Math.floor(diff / 3600000);
    const days = Math.floor(diff / 86400000);

    if (minutes < 1) return 'Just now';
    if (minutes < 60) return `${minutes}m ago`;
    if (hours < 24) return `${hours}h ago`;
    if (days < 7) return `${days}d ago`;
    return date.toLocaleDateString();
  };

  if (loading) {
    return (
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
        <div className="flex items-center justify-between mb-6">
<h3 className="text-lg font-semibold text-(--color-gray-900)">Recent Activity</h3>
        </div>
        <div className="space-y-4">
          {[1, 2, 3].map((i) => (
            <div key={i} className="flex items-start gap-4 animate-pulse">
              <div className="w-10 h-10 bg-gray-200 rounded-full"></div>
              <div className="flex-1">
                <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
                <div className="h-3 bg-gray-200 rounded w-1/2"></div>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
        <h3 className="text-lg font-semibold text-(--color-gray-900) mb-4">Recent Activity</h3>
        <div className="text-center py-8">
          <svg className="w-12 h-12 text-gray-300 mx-auto mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
          </svg>
          <p className="text-(--color-secondary)">{error}</p>
          <button
            onClick={fetchActivities}
            className="mt-4 px-4 py-2 bg-(--color-primary) text-white rounded-lg hover:bg-(--color-primary-hover) transition-colors"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-lg font-semibold text-(--color-gray-900)">Recent Activity</h3>
        {onViewAll && (
          <button
            onClick={onViewAll}
            className="text-sm text-(--color-primary) hover:underline font-medium"
          >
            View All
          </button>
        )}
      </div>

      {activities.length === 0 ? (
        <div className="text-center py-8">
          <svg className="w-12 h-12 text-gray-300 mx-auto mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
          </svg>
          <p className="text-(--color-secondary)">No recent activity</p>
        </div>
      ) : (
        <div className="space-y-4">
          {activities.map((activity) => {
            const colors = actionColors[activity.action] || { bg: 'bg-gray-100', text: 'text-gray-600' };
            const iconPath = actionIcons[activity.action] || 'M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z';

            return (
              <div key={activity.id} className="flex items-start gap-4 p-3 hover:bg-gray-50 rounded-lg transition-colors">
                <div className={`w-10 h-10 ${colors.bg} rounded-full flex items-center justify-center flex-shrink-0`}>
                  <svg className={`w-5 h-5 ${colors.text}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d={iconPath} />
                  </svg>
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="font-medium text-(--color-gray-900) text-sm">{activity.userEmail}</span>
                    <span className="text-(--color-secondary) text-sm">performed</span>
                    <span className={`px-2 py-0.5 rounded text-xs font-medium ${colors.bg} ${colors.text}`}>
                      {activity.action.replace('_', ' ')}
                    </span>
                  </div>
                  {activity.resource && (
                    <p className="text-sm text-(--color-secondary) mt-1 truncate">
                      on {activity.resource}{activity.resourceId ? ` (${activity.resourceId.slice(0, 8)}...)` : ''}
                    </p>
                  )}
                  <div className="flex items-center gap-4 mt-2 text-xs text-gray-400">
                    <span>{formatTime(activity.timestamp)}</span>
                    {activity.ipAddress && <span className="font-mono">{activity.ipAddress}</span>}
                    {activity.status && (
                      <span className={`flex items-center gap-1 ${activity.status === 'success' ? 'text-green-600' : 'text-red-600'}`}>
                        {activity.status === 'success' ? (
                          <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.707-7.707a1 1 0 011.414 0z" clipRule="evenodd" />
                          </svg>
                        ) : (
                          <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                          </svg>
                        )}
                        {activity.status}
                      </span>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

export function RecentActivitySkeleton() {
  return <RecentActivity limit={5} />;
}