'use client';

import { useEffect, useState } from 'react';
import { useAuthStore } from '@/store/auth.store';
import { apiClient } from '@/lib/api-client';
import { PaginatedResponse, User } from '@/types';

export default function UsersPage() {
  const { user } = useAuthStore();
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const response = await apiClient.get('/users');
        const data = response.data as PaginatedResponse<User>;
        setUsers(data.data);
      } catch (error) {
        console.error('Failed to fetch users', error);
      } finally {
        setLoading(false);
      }
    };
    fetchUsers();
  }, []);

  return (
    <div>
      <h1 className="text-3xl font-bold text-[#1F232A] mb-6">Users</h1>

      {loading ? (
        <div className="text-center py-10">Loading...</div>
      ) : (
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="text-left px-6 py-4 text-sm font-medium text-[#404857]">Name</th>
                <th className="text-left px-6 py-4 text-sm font-medium text-[#404857]">Email</th>
                <th className="text-left px-6 py-4 text-sm font-medium text-[#404857]">Role</th>
                <th className="text-left px-6 py-4 text-sm font-medium text-[#404857]">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {users.map((user) => (
                <tr key={user.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 text-[#1F232A]">{user.firstName} {user.lastName}</td>
                  <td className="px-6 py-4 text-[#404857]">{user.email}</td>
                  <td className="px-6 py-4">
                    <span className={`px-3 py-1 rounded-full text-xs font-medium ${user.role === 'ADMIN' ? 'bg-red-100 text-red-700' : user.role === 'MANAGER' ? 'bg-yellow-100 text-yellow-700' : 'bg-blue-100 text-blue-700'}`}>
                      {user.role}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <span className={`px-3 py-1 rounded-full text-xs font-medium ${user.isActive ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-700'}`}>
                      {user.isActive ? 'Active' : 'Inactive'}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}