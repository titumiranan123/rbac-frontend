'use client';

import { useEffect, useState } from 'react';
import { useAuthStore } from '@/store/auth.store';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

export default function DashboardPage() {
  const { user } = useAuthStore();
  const [stats, setStats] = useState({
    totalUsers: 0,
    activeUsers: 0,
    totalPermissions: 0,
    recentLogs: 0,
  });

  useEffect(() => {
    async function fetchStats() {
      try {
        const [usersRes, permsRes, auditRes] = await Promise.all([
          fetch('/api/users'),
          fetch('/api/permissions'),
          fetch('/api/audit?limit=1'),
        ]);

        const usersData = await usersRes.json();
        const permsData = await permsRes.json();
        const auditData = await auditRes.json();

        setStats({
          totalUsers: usersData.meta?.total || 0,
          activeUsers: usersData.data?.filter((u: any) => u.isActive).length || 0,
          totalPermissions: permsData.length || 0,
          recentLogs: auditData.meta?.total || 0,
        });
      } catch (error) {
        console.error('Failed to fetch stats', error);
      }
    }

    fetchStats();
  }, []);

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">
          Welcome, {user?.firstName} {user?.lastName}
        </h1>
        <p className="text-gray-600 mt-2">
          Your role: <Badge variant="info">{user?.role}</Badge>
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card>
          <CardContent className="pt-6">
            <div className="text-3xl font-bold text-blue-600">{stats.totalUsers}</div>
            <p className="text-gray-600 mt-1">Total Users</p>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="text-3xl font-bold text-green-600">{stats.activeUsers}</div>
            <p className="text-gray-600 mt-1">Active Users</p>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="text-3xl font-bold text-purple-600">{stats.totalPermissions}</div>
            <p className="text-gray-600 mt-1">Permissions</p>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="text-3xl font-bold text-orange-600">{stats.recentLogs}</div>
            <p className="text-gray-600 mt-1">Audit Logs</p>
          </CardContent>
        </Card>
      </div>

      <Card className="mt-8">
        <CardHeader>
          <CardTitle>Quick Actions</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {user?.role === 'ADMIN' && (
              <>
                <a href="/users" className="p-4 bg-blue-50 rounded-lg hover:bg-blue-100">
                  <div className="text-lg font-medium text-blue-900">Manage Users</div>
                  <div className="text-sm text-blue-600">Add, edit, or remove users</div>
                </a>
                <a href="/roles" className="p-4 bg-green-50 rounded-lg hover:bg-green-100">
                  <div className="text-lg font-medium text-green-900">View Roles</div>
                  <div className="text-sm text-green-600">See role permissions</div>
                </a>
              </>
            )}
            <a href="/audit" className="p-4 bg-purple-50 rounded-lg hover:bg-purple-100">
              <div className="text-lg font-medium text-purple-900">Audit Logs</div>
              <div className="text-sm text-purple-600">View system activity</div>
            </a>
            <a href="/permissions" className="p-4 bg-orange-50 rounded-lg hover:bg-orange-100">
              <div className="text-lg font-medium text-orange-900">Permissions</div>
              <div className="text-sm text-orange-600">View all permissions</div>
            </a>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}