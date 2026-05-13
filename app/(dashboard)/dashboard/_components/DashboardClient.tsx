'use client';

import { useAuth } from '@/context/AuthContext';

interface DashboardClientProps {
  usersCount: number;
  permissionsCount: number;
  auditLogsCount: number;
}

export default function DashboardClient({ usersCount, permissionsCount, auditLogsCount }: DashboardClientProps) {
  const { user } = useAuth();

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Welcome, {user?.firstName} {user?.lastName}</h1>
        <p className="text-gray-500 mt-2">Role: <span className="font-semibold text-orange-500">{user?.role}</span></p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
          <div className="text-3xl font-bold text-orange-500">{usersCount}</div>
          <p className="text-gray-500 mt-1">Total Users</p>
        </div>
        <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
          <div className="text-3xl font-bold text-orange-500">{permissionsCount}</div>
          <p className="text-gray-500 mt-1">Permissions</p>
        </div>
        <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
          <div className="text-3xl font-bold text-orange-500">{auditLogsCount}</div>
          <p className="text-gray-500 mt-1">Audit Logs</p>
        </div>
      </div>
    </div>
  );
}