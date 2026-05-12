'use client';

import { useEffect, useState, useCallback } from 'react';
import { useAuthStore } from '@/store/auth.store';
import { apiClient } from '@/lib/api-client';
import { User, Permission } from '@/types';
import { PaginatedResponse } from '@/types';

const RoleHierarchy: Record<string, number> = {
  ADMIN: 0, MANAGER: 1, AGENT: 2, CUSTOMER: 3,
};

export default function PermissionsPage() {
  const { user: currentUser, permissions } = useAuthStore();
  const [users, setUsers] = useState<User[]>([]);
  const [permissionsList, setPermissionsList] = useState<Permission[]>([]);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [userPermissions, setUserPermissions] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [search, setSearch] = useState('');

  const canEdit = permissions.includes('*') || permissions.includes('permissions:update');

  const fetchUsers = useCallback(async () => {
    try {
      const response = await apiClient.get('/users');
      const data = response.data as PaginatedResponse<User>;
      setUsers(data.data);
    } catch (error) {
      console.error('Failed to fetch users', error);
    }
  }, []);

  const fetchPermissions = useCallback(async () => {
    try {
      const response = await apiClient.get('/permissions');
      setPermissionsList(Array.isArray(response.data) ? response.data : []);
    } catch (error) {
      console.error('Failed to fetch permissions', error);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchUsers();
    fetchPermissions();
  }, [fetchUsers, fetchPermissions]);

  const handleSelectUser = (user: User) => {
    setSelectedUser(user);
    setUserPermissions(user.grantedPermissions || []);
  };

  const togglePermission = (permName: string) => {
    if (!canEdit) return;
    if (!selectedUser) return;

    const currentUserLevel = RoleHierarchy[currentUser?.role as string] ?? 999;
    const perm = permissionsList.find((p) => p.name === permName);
    if (perm && perm.level < currentUserLevel) return;

    setUserPermissions((prev) =>
      prev.includes(permName) ? prev.filter((p) => p !== permName) : [...prev, permName]
    );
  };

  const savePermissions = async () => {
    if (!selectedUser) return;

    setSaving(true);
    try {
      const granted = userPermissions;
      const revoked = (selectedUser.grantedPermissions || []).filter((p) => !granted.includes(p));

      for (const perm of granted) {
        if (!(selectedUser.grantedPermissions || []).includes(perm)) {
          await apiClient.post(`/users/${selectedUser.id}/permissions/${perm}`);
        }
      }

      for (const perm of revoked) {
        await apiClient.delete(`/users/${selectedUser.id}/permissions/${perm}`);
      }

      const updatedUser = { ...selectedUser, grantedPermissions: granted };
      setUsers((prev) => prev.map((u) => (u.id === selectedUser.id ? updatedUser : u)));
      setSelectedUser(updatedUser);

      alert('Permissions updated successfully!');
    } catch (error: any) {
      alert(error.response?.data?.message || 'Failed to update permissions');
    } finally {
      setSaving(false);
    }
  };

  const filteredUsers = users.filter((u) =>
    `${u.firstName} ${u.lastName} ${u.email}`.toLowerCase().includes(search.toLowerCase())
  );

  const groupedPermissions = permissionsList.reduce((acc, perm) => {
    if (!acc[perm.resource]) acc[perm.resource] = [];
    acc[perm.resource].push(perm);
    return acc;
  }, {} as Record<string, Permission[]>);

  const currentUserLevel = RoleHierarchy[currentUser?.role as string] ?? 999;

  const canGrantPermission = (perm: Permission): boolean => {
    if (!canEdit) return false;
    return perm.level >= currentUserLevel;
  };

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-[#1F232A]">Permissions Management</h1>
        <p className="text-[#404857] mt-2">Select a user and manage their permissions</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4">
          <h2 className="text-lg font-semibold text-[#1F232A] mb-4">Select User</h2>
          <input
            type="text"
            placeholder="Search users..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg mb-4 focus:outline-none focus:ring-2 focus:ring-[#FD5E2B]"
          />
          <div className="space-y-2 max-h-[500px] overflow-y-auto">
            {filteredUsers.map((user) => (
              <button
                key={user.id}
                onClick={() => handleSelectUser(user)}
                className={`w-full text-left p-3 rounded-lg transition-colors ${
                  selectedUser?.id === user.id
                    ? 'bg-[#FD5E2B] text-white'
                    : 'bg-gray-50 hover:bg-gray-100'
                }`}
              >
                <div className="font-medium">{user.firstName} {user.lastName}</div>
                <div className={`text-sm ${selectedUser?.id === user.id ? 'text-white/80' : 'text-gray-500'}`}>
                  {user.email}
                </div>
                <span className={`text-xs px-2 py-0.5 rounded mt-1 inline-block ${
                  user.role === 'ADMIN' ? 'bg-red-100 text-red-700' : user.role === 'MANAGER' ? 'bg-yellow-100 text-yellow-700' : 'bg-blue-100 text-blue-700'
                }`}>
                  {user.role}
                </span>
              </button>
            ))}
          </div>
        </div>

        <div className="lg:col-span-2 bg-white rounded-xl shadow-sm border border-gray-100 p-6">
          {selectedUser ? (
            <>
              <div className="flex items-center justify-between mb-6 pb-4 border-b border-gray-100">
                <div>
                  <h2 className="text-xl font-semibold text-[#1F232A]">
                    {selectedUser.firstName} {selectedUser.lastName}
                  </h2>
                  <p className="text-[#404857] text-sm">{selectedUser.email}</p>
                </div>
                <button
                  onClick={savePermissions}
                  disabled={!canEdit || saving}
                  className="px-6 py-2 bg-[#FD5E2B] text-white rounded-lg hover:bg-[#e04d1f] disabled:opacity-50 disabled:cursor-not-allowed font-medium"
                >
                  {saving ? 'Saving...' : 'Save Changes'}
                </button>
              </div>

              {!canEdit && (
                <div className="bg-yellow-50 border border-yellow-200 text-yellow-800 px-4 py-3 rounded-lg mb-6">
                  You don&apos;t have permission to edit permissions
                </div>
              )}

              <div className="space-y-6">
                {Object.entries(groupedPermissions).map(([resource, perms]) => (
                  <div key={resource}>
                    <h3 className="text-sm font-semibold text-[#404857] uppercase mb-3">{resource}</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                      {perms.map((perm) => {
                        const isGranted = userPermissions.includes(perm.name);
                        const isDisabled = !canGrantPermission(perm);
                        const canToggle = canEdit && !isDisabled;

                        return (
                          <label
                            key={perm.id}
                            className={`flex items-center gap-3 p-3 rounded-lg border transition-colors ${
                              isDisabled ? 'bg-gray-50 border-gray-100 opacity-50' : isGranted ? 'bg-green-50 border-green-200' : 'bg-gray-50 border-gray-200'
                            }`}
                          >
                            <input
                              type="checkbox"
                              checked={isGranted}
                              onChange={() => togglePermission(perm.name)}
                              disabled={!canToggle}
                              className="w-5 h-5 rounded border-gray-300 text-[#FD5E2B] focus:ring-[#FD5E2B] disabled:cursor-not-allowed"
                            />
                            <div className="flex-1">
                              <div className="font-medium text-[#1F232A] text-sm">{perm.name}</div>
                              <div className="text-xs text-[#404857]">{perm.description}</div>
                            </div>
                            {isDisabled && (
                              <span className="text-xs bg-gray-200 px-2 py-1 rounded text-gray-600">No Access</span>
                            )}
                          </label>
                        );
                      })}
                    </div>
                  </div>
                ))}
              </div>
            </>
          ) : (
            <div className="text-center py-12">
              <svg className="w-16 h-16 text-gray-300 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a4.5 4.5 0 11-9 0 4.5 4.5 0 019 0z" />
              </svg>
              <p className="text-[#404857]">Select a user to manage their permissions</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}