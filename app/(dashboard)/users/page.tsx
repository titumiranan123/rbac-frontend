'use client';

import { useEffect, useState, useCallback } from 'react';
import { useAuthStore } from '@/store/auth.store';
import { apiClient } from '@/lib/api-client';
import { User, Role, PaginatedResponse } from '@/types';
import { UserTable, UserForm } from '@/components/users';

export default function UsersPage() {
  const { user: currentUser } = useAuthStore();
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [pagination, setPagination] = useState({ page: 1, limit: 20, total: 0, totalPages: 1 });
  const [editingUser, setEditingUser] = useState<User | null>(null);
  const [showCreateForm, setShowCreateForm] = useState(false);

  const fetchUsers = useCallback(async (page = 1) => {
    try {
      setLoading(true);
      const response = await apiClient.get(`/users?page=${page}&limit=${pagination.limit}`);
      const data = response.data as PaginatedResponse<User>;
      setUsers(data.data);
      setPagination((prev) => ({
        ...prev,
        page: data.meta.page,
        total: data.meta.total,
        totalPages: data.meta.totalPages,
      }));
    } catch (error) {
      console.error('Failed to fetch users', error);
    } finally {
      setLoading(false);
    }
  }, [pagination.limit]);

  useEffect(() => {
    fetchUsers(1);
  }, [fetchUsers]);

  const handlePageChange = (page: number) => {
    fetchUsers(page);
  };

  const handleEdit = (user: User) => {
    setEditingUser(user);
    setShowCreateForm(true);
  };

  const handleSuspend = async (userId: string) => {
    if (!confirm('Are you sure you want to suspend this user?')) return;
    try {
      await apiClient.put(`/users/${userId}`, { isActive: false });
      fetchUsers(pagination.page);
    } catch (error: any) {
      alert(error.response?.data?.message || 'Failed to suspend user');
    }
  };

  const handleBan = async (userId: string) => {
    if (!confirm('Are you sure you want to ban this user?')) return;
    try {
      await apiClient.put(`/users/${userId}`, { isActive: false });
      fetchUsers(pagination.page);
    } catch (error: any) {
      alert(error.response?.data?.message || 'Failed to ban user');
    }
  };

  const handleRestore = async (userId: string) => {
    try {
      await apiClient.put(`/users/${userId}`, { isActive: true });
      fetchUsers(pagination.page);
    } catch (error: any) {
      alert(error.response?.data?.message || 'Failed to restore user');
    }
  };

  const handleSubmit = async (data: any) => {
    setSaving(true);
    try {
      if (editingUser) {
        await apiClient.put(`/users/${editingUser.id}`, data);
      } else {
        await apiClient.post('/users', data);
      }
      setShowCreateForm(false);
      setEditingUser(null);
      fetchUsers(pagination.page);
    } catch (error: any) {
      alert(error.response?.data?.message || 'Failed to save user');
    } finally {
      setSaving(false);
    }
  };

  const handleCancel = () => {
    setShowCreateForm(false);
    setEditingUser(null);
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-3xl font-bold text-[#1F232A]">Users</h1>
          <p className="text-[#404857] mt-1">Manage user accounts and permissions</p>
        </div>
        <button
          onClick={() => setShowCreateForm(true)}
          className="px-6 py-3 bg-[#FD5E2B] text-white rounded-lg hover:bg-[#e04d1f] font-medium transition-colors"
        >
          + Add User
        </button>
      </div>

      {showCreateForm ? (
        <UserForm
          user={editingUser || undefined}
          onSubmit={handleSubmit}
          onCancel={handleCancel}
          loading={saving}
        />
      ) : (
        <UserTable
          users={users}
          loading={loading}
          onEdit={handleEdit}
          onSuspend={handleSuspend}
          onBan={handleBan}
          onRestore={handleRestore}
          pagination={pagination}
          onPageChange={handlePageChange}
        />
      )}
    </div>
  );
}