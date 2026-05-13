'use client';

import { useState } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import toast from 'react-hot-toast';
import Swal from 'sweetalert2';
import { User, PaginatedResult } from '@/types';
import { apiClient } from '@/lib/api-client';
import { CreateUserModal } from './CreateUserModal';
import { EditUserModal } from './EditUserModal';
import { UserActionsDropdown } from './UserActionsDropdown';
import { PermissionEditor } from './PermissionEditor';

interface UsersClientProps {
  initialData: PaginatedResult<User>;
}

export default function UsersClient({ initialData }: UsersClientProps) {
  const queryClient = useQueryClient();
  const [users, setUsers] = useState<User[]>(initialData.data);
  const [pagination, setPagination] = useState(initialData.meta);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [editingUser, setEditingUser] = useState<User | null>(null);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [showPermissionEditor, setShowPermissionEditor] = useState(false);

  const handlePageChange = async (page: number) => {
    try {
      const response = await apiClient.get(`/users?page=${page}&limit=${pagination.limit}`);
      const data = response.data as PaginatedResult<User>;
      setUsers(data.data);
      setPagination(data.meta);
    } catch (error) {
      console.error('Failed to fetch users:', error);
    }
  };

  const handleCreateSuccess = () => {
    queryClient.invalidateQueries({ queryKey: ['users'] });
    toast.success('User created successfully');
  };

  const handleEditSuccess = () => {
    queryClient.invalidateQueries({ queryKey: ['users'] });
    toast.success('User updated successfully');
  };

  const handleSuspend = async (user: User) => {
    const result = await Swal.fire({
      title: 'Suspend User',
      text: `Are you sure you want to suspend ${user.firstName} ${user.lastName}?`,
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#F97316',
      cancelButtonColor: '#6B7280',
      confirmButtonText: 'Yes, Suspend',
    });
    if (!result.isConfirmed) return;
    try {
      await apiClient.patch(`/users/${user.id}/suspend`);
      setUsers((prev) => prev.map((u) => (u.id === user.id ? { ...u, isActive: false } : u)));
      toast.success('User suspended successfully');
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Failed to suspend user');
    }
  };

  const handleBan = async (user: User) => {
    const result = await Swal.fire({
      title: 'Ban User',
      text: `Are you sure you want to ban ${user.firstName} ${user.lastName}?`,
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#F97316',
      cancelButtonColor: '#6B7280',
      confirmButtonText: 'Yes, Ban',
    });
    if (!result.isConfirmed) return;
    try {
      await apiClient.patch(`/users/${user.id}/ban`);
      setUsers((prev) => prev.map((u) => (u.id === user.id ? { ...u, isActive: false } : u)));
      toast.success('User banned successfully');
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Failed to ban user');
    }
  };

  const handleDelete = async (user: User) => {
    const result = await Swal.fire({
      title: 'Delete User',
      text: `Are you sure you want to delete ${user.firstName} ${user.lastName}? This cannot be undone.`,
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#EF4444',
      cancelButtonColor: '#6B7280',
      confirmButtonText: 'Yes, Delete',
    });
    if (!result.isConfirmed) return;
    try {
      await apiClient.delete(`/users/${user.id}`);
      setUsers((prev) => prev.filter((u) => u.id !== user.id));
      toast.success('User deleted successfully');
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Failed to delete user');
    }
  };

  const handleManagePermissions = (user: User) => {
    setSelectedUser(user);
    setShowPermissionEditor(true);
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Users</h1>
          <p className="text-gray-500 mt-1">Manage user accounts and permissions</p>
        </div>
        <button
          onClick={() => setShowCreateModal(true)}
          className="px-6 py-3 bg-orange-500 text-white rounded-lg hover:bg-orange-600 font-medium transition-colors"
        >
          + Add User
        </button>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        <table className="w-full">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">User</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Role</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Created</th>
              <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {users.map((user) => (
              <tr key={user.id} className="hover:bg-gray-50">
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="flex items-center">
                    <div className="flex-shrink-0 h-10 w-10 bg-orange-100 rounded-full flex items-center justify-center">
                      <span className="text-orange-600 font-medium">
                        {user.firstName[0]}{user.lastName[0]}
                      </span>
                    </div>
                    <div className="ml-4">
                      <div className="text-sm font-medium text-gray-900">
                        {user.firstName} {user.lastName}
                      </div>
                      <div className="text-sm text-gray-500">{user.email}</div>
                    </div>
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                    user.role === 'ADMIN' ? 'bg-red-100 text-red-700' :
                    user.role === 'MANAGER' ? 'bg-purple-100 text-purple-700' :
                    user.role === 'AGENT' ? 'bg-blue-100 text-blue-700' :
                    'bg-gray-100 text-gray-700'
                  }`}>
                    {user.role}
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                    user.isActive ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
                  }`}>
                    {user.isActive ? 'Active' : 'Inactive'}
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {new Date(user.createdAt).toLocaleDateString()}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-right">
                  <UserActionsDropdown
                    user={user}
                    onEdit={() => setEditingUser(user)}
                    onSuspend={() => handleSuspend(user)}
                    onBan={() => handleBan(user)}
                    onDelete={() => handleDelete(user)}
                    onManagePermissions={() => handleManagePermissions(user)}
                  />
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        {pagination.totalPages > 1 && (
          <div className="px-6 py-4 flex items-center justify-between border-t border-gray-200">
            <div className="text-sm text-gray-500">
              Showing {((pagination.page - 1) * pagination.limit) + 1} to{' '}
              {Math.min(pagination.page * pagination.limit, pagination.total)} of {pagination.total} results
            </div>
            <div className="flex gap-2">
              <button
                onClick={() => handlePageChange(pagination.page - 1)}
                disabled={pagination.page === 1}
                className="px-3 py-1 text-sm border rounded-lg disabled:opacity-50 hover:bg-gray-50"
              >
                Previous
              </button>
              <button
                onClick={() => handlePageChange(pagination.page + 1)}
                disabled={pagination.page === pagination.totalPages}
                className="px-3 py-1 text-sm border rounded-lg disabled:opacity-50 hover:bg-gray-50"
              >
                Next
              </button>
            </div>
          </div>
        )}
      </div>

      {showCreateModal && (
        <CreateUserModal
          onClose={() => setShowCreateModal(false)}
          onSuccess={handleCreateSuccess}
        />
      )}

      {editingUser && (
        <EditUserModal
          user={editingUser}
          onClose={() => setEditingUser(null)}
          onSuccess={handleEditSuccess}
        />
      )}

      {showPermissionEditor && selectedUser && (
        <PermissionEditor
          user={selectedUser}
          currentUserRole="ADMIN"
          onClose={() => {
            setShowPermissionEditor(false);
            setSelectedUser(null);
          }}
          onSuccess={() => {
            queryClient.invalidateQueries({ queryKey: ['users'] });
          }}
        />
      )}
    </div>
  );
}