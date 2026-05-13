'use client';
import { useState, useEffect } from 'react';
import { apiClient } from '@/lib/api-client';
import { User } from '@/types';
import { PERMISSION_ATOMS, PERMISSION_DESCRIPTIONS, PermissionAtom } from '@/lib/permissions';
import { Select } from '@/components/ui';

export function PermissionEditor({ targetUserId }: { targetUserId?: string }) {
  const [users, setUsers] = useState<User[]>([]);
  const [selectedUser, setSelectedUser] = useState<string>(targetUserId || '');
  const [userPermissionsState, setUserPermissionsState] = useState<string[]>([]);
  const [loadingPermissions, setLoadingPermissions] = useState(false);
  const [myPermissions, setMyPermissions] = useState<string[]>([]);

  useEffect(() => {
    apiClient.get('/users?page=1&limit=100').then(res => setUsers(res.data.data || [])).catch(() => {});
    const token = document.cookie.match(/(?:^|;\s*)accessToken=([^;]*)/)?.[1];
    if (token) {
      try {
        const payload = JSON.parse(atob(token.split('.')[1]));
        setMyPermissions(payload.grantedPermissions || []);
      } catch {}
    }
  }, []);

  useEffect(() => {
    if (selectedUser) {
      setLoadingPermissions(true);
      apiClient.get(`/users/${selectedUser}`)
        .then(res => setUserPermissionsState(res.data.grantedPermissions || []))
        .catch(() => setUserPermissionsState([]))
        .finally(() => setLoadingPermissions(false));
    }
  }, [selectedUser]);

  const canGrant = (permission: string) => myPermissions.includes(permission);

  const handleToggle = async (permission: PermissionAtom) => {
    if (!canGrant(permission) || !selectedUser) return;
    const isGranted = userPermissionsState.includes(permission);
    try {
      if (isGranted) {
        await apiClient.delete(`/users/${selectedUser}/permissions/${permission}`);
        setUserPermissionsState(prev => prev.filter(p => p !== permission));
      } else {
        await apiClient.post(`/users/${selectedUser}/permissions/${permission}`);
        setUserPermissionsState(prev => [...prev, permission]);
      }
    } catch {}
  };

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
      <h2 className="text-xl font-semibold mb-4">Permission Editor</h2>
      <div className="mb-6">
        <Select label="Select User" value={selectedUser} onChange={(e) => setSelectedUser(e.target.value)}>
          <option value="">-- Select User --</option>
          {users.map(u => <option key={u.id} value={u.id}>{u.email} ({u.role})</option>)}
        </Select>
      </div>
      {selectedUser && (
        <div>
          <div className="mb-4 flex items-center justify-between">
            <h3 className="font-medium">User Permissions</h3>
            {loadingPermissions && <span className="text-sm text-gray-500">Loading...</span>}
          </div>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
            {PERMISSION_ATOMS.map(permission => {
              const isGranted = userPermissionsState.includes(permission);
              return (
                <div key={permission} className={`flex items-center justify-between p-3 rounded-lg border ${isGranted ? 'border-green-500 bg-green-50' : 'border-gray-200'}`}>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium truncate">{PERMISSION_DESCRIPTIONS[permission]}</p>
                    <p className="text-xs text-gray-500">{permission}</p>
                  </div>
                  <button onClick={() => handleToggle(permission)} disabled={!canGrant(permission)} className={`ml-2 px-3 py-1 rounded text-sm font-medium ${isGranted ? 'bg-green-500 text-white' : 'bg-gray-200'} ${!canGrant(permission) ? 'opacity-50 cursor-not-allowed' : ''}`}>
                    {isGranted ? 'ON' : 'OFF'}
                  </button>
                </div>
              );
            })}
          </div>
          <p className="mt-4 text-xs text-gray-500">Toggle is disabled if you dont have permission (Grant Ceiling enforced)</p>
        </div>
      )}
    </div>
  );
}