'use client';

import { useEffect, useState } from 'react';
import { useAuth } from '@/context/AuthContext';
import { apiClient } from '@/lib/api-client';
import { User, Permission } from '@/types';

const RoleHierarchy: Record<string, number> = {
  ADMIN: 0, MANAGER: 1, AGENT: 2, CUSTOMER: 3,
};

export default function PermissionsPage() {
  const { user: currentUser } = useAuth();
  const [users, setUsers] = useState<User[]>([]);
  const [permissionsList, setPermissionsList] = useState<Permission[]>([]);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [userPermissions, setUserPermissions] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [search, setSearch] = useState('');

  const canEdit = currentUser?.grantedPermissions?.includes('edit_user') || false;

  useEffect(() => {
    Promise.all([
      apiClient.get('/users'),
      apiClient.get('/permissions'),
    ]).then(([usersRes, permsRes]) => {
      setUsers((usersRes.data as { data?: User[] })?.data || []);
      setPermissionsList(Array.isArray(permsRes.data) ? permsRes.data : []);
    }).catch(console.error).finally(() => setLoading(false));
  }, []);

  const handleSelectUser = (user: User) => {
    setSelectedUser(user);
    setUserPermissions(user.grantedPermissions || []);
  };

  const togglePermission = (permName: string) => {
    if (!canEdit || !selectedUser) return;
    const perm = permissionsList.find((p) => p.name === permName);
    const currentUserLevel = RoleHierarchy[currentUser?.role as string] ?? 999;
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
      alert('Permissions updated!');
    } catch (error: any) {
      alert(error.response?.data?.message || 'Failed to update');
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
  const canGrantPermission = (level: number): boolean => canEdit && level >= currentUserLevel;

  if (loading) return <div className="p-8">Loading...</div>;

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-900">Permissions Management</h1>
        <p className="text-gray-500 mt-2">Select a user and manage their permissions</p>
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Select User</h2>
          <input type="text" placeholder="Search users..." value={search} onChange={(e) => setSearch(e.target.value)} className="w-full px-3 py-2 border border-gray-300 rounded-lg mb-4" />
          <div className="space-y-2 max-h-[70vh] overflow-y-auto">
            {filteredUsers.map((user) => (
              <button key={user.id} onClick={() => handleSelectUser(user)} className={`w-full text-left p-3 rounded-lg ${selectedUser?.id === user.id ? 'bg-orange-500 text-white' : 'bg-gray-50 hover:bg-gray-100'}`}>
                <div className="font-medium">{user.firstName} {user.lastName}</div>
                <div className={`text-sm ${selectedUser?.id === user.id ? 'text-white/80' : 'text-gray-500'}`}>{user.email}</div>
                <span className={`text-xs px-2 py-0.5 rounded mt-1 inline-block ${user.role === 'ADMIN' ? 'bg-red-100' : user.role === 'MANAGER' ? 'bg-yellow-100' : 'bg-blue-100'}`}>{user.role}</span>
              </button>
            ))}
          </div>
        </div>
        <div className="lg:col-span-2 bg-white rounded-xl shadow-sm border border-gray-100 p-6">
          {selectedUser ? (
            <>
              <div className="flex items-center justify-between mb-6 pb-4 border-b">
                <div>
                  <h2 className="text-xl font-semibold">{selectedUser.firstName} {selectedUser.lastName}</h2>
                  <p className="text-gray-500 text-sm">{selectedUser.email}</p>
                </div>
                <button onClick={savePermissions} disabled={!canEdit || saving} className="px-6 py-2 bg-orange-500 text-white rounded-lg disabled:opacity-50">
                  {saving ? 'Saving...' : 'Save Changes'}
                </button>
              </div>
              {!canEdit && <div className="bg-yellow-50 text-yellow-800 px-4 py-3 rounded-lg mb-6">You dont have permission to edit</div>}
              <div className="space-y-6">
                {Object.entries(groupedPermissions).map(([resource, perms]) => (
                  <div key={resource}>
                    <h3 className="text-sm font-semibold text-gray-500 uppercase mb-3">{resource}</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                      {perms.map((perm) => {
                        const isGranted = userPermissions.includes(perm.name);
                        const isDisabled = !canGrantPermission(perm.level);
                        return (
                          <label key={perm.id} className={`flex items-center gap-3 p-3 rounded-lg border ${isDisabled ? 'bg-gray-50 opacity-50' : isGranted ? 'bg-green-50' : 'bg-gray-50'}`}>
                            <input type="checkbox" checked={isGranted} onChange={() => togglePermission(perm.name)} disabled={!canEdit || isDisabled} className="w-5 h-5" />
                            <div>
                              <div className="font-medium text-sm">{perm.name}</div>
                              <div className="text-xs text-gray-500">{perm.description}</div>
                            </div>
                            {isDisabled && <span className="text-xs bg-gray-200 px-2 py-1 rounded">No Access</span>}
                          </label>
                        );
                      })}
                    </div>
                  </div>
                ))}
              </div>
            </>
          ) : (
            <div className="text-center py-12 text-gray-500">Select a user to manage permissions</div>
          )}
        </div>
      </div>
    </div>
  );
}