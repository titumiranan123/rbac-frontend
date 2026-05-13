'use client';

import { useEffect, useState } from 'react';
import { useAuth } from '@/context/AuthContext';
import { apiClient } from '@/lib/api-client';
import { PaginatedResult } from '@/types';

export default function DashboardPage() {
  const { user } = useAuth();
  const [stats, setStats] = useState({ users: 0, permissions: 0, auditLogs: 0 });

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const [usersRes, permsRes, auditRes] = await Promise.all([
          apiClient.get('/users'),
          apiClient.get('/permissions'),
          apiClient.get('/audit?limit=1'),
        ]);
        const usersData = usersRes.data as PaginatedResult<any>;
        const auditData = auditRes.data as PaginatedResult<any>;
        setStats({
          users: usersData.meta?.total || 0,
          permissions: Array.isArray(permsRes.data) ? permsRes.data.length : 0,
          auditLogs: auditData.meta?.total || 0,
        });
      } catch (error) {
        console.error('Failed to fetch stats', error);
      }
    };
    fetchStats();
  }, []);

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Welcome, {user?.firstName} {user?.lastName}</h1>
        <p className="text-gray-500 mt-2">Role: <span className="font-semibold text-orange-500">{user?.role}</span></p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
          <div className="text-3xl font-bold text-orange-500">{stats.users}</div>
          <p className="text-gray-500 mt-1">Total Users</p>
        </div>
        <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
          <div className="text-3xl font-bold text-orange-500">{stats.permissions}</div>
          <p className="text-gray-500 mt-1">Permissions</p>
        </div>
        <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
          <div className="text-3xl font-bold text-orange-500">{stats.auditLogs}</div>
          <p className="text-gray-500 mt-1">Audit Logs</p>
        </div>
      </div>
    </div>
  );
}