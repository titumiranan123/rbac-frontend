'use client';
import { useState, useEffect } from 'react';
import { apiClient } from '@/lib/api-client';
import { User, PaginatedResult } from '@/types';
import { PERMISSION_ATOMS, PERMISSION_DESCRIPTIONS, PermissionAtom } from '@/lib/permissions';
import { usePermissions } from '@/context/PermissionContext';
import { Select, Input, Button } from '@/components/ui';

interface PermissionEditorProps {
  targetUserId?: string;
}

export function PermissionEditor({ targetUserId }: PermissionEditorProps) {
  const { userPermissions, grantPermission, revokePermission, canGrant } = usePermissions();
  const [users, setUsers] = useState<User[]>([]);
  const [selectedUser, setSelectedUser] = useState<string>(targetUserId || '');
  const [loading, setLoading] = useState(false);
  const [userPermissionsState, setUserPermissionsState] = useState<string[]>([]);
  const [loadingPermissions, setLoadingPermissions] = useState(false);

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const response = await apiClient.get('/users?page=1&limit=100');
        setUsers(response.data.data);
      } catch {
        // Ignore
      }
    };
    fetchUsers();
  }, []);

  useEffect(() => {
    if (selectedUser) {
      const fetchUserPermissions = async () => {
        setLoadingPermissions(true);
        try {
          const response = await apiClient.get(`/users/${selectedUser}`);
          setUserPermissionsState(response.data.grantedPermissions || []);
        } catch {
          setUserPermissionsState([]);
        } finally {
          setLoadingPermissions(false);
        }
      };
      fetchUserPermissions();
    }
  }, [selectedUser]);

  const handleToggle = async (permission: PermissionAtom) => {
    if (!canGrant(permission)) return;
    if (!selectedUser) return;

    const isGranted = userPermissionsState.includes(permission);
    if (isGranted) {
      const success = await revokePermission(selectedUser, permission);
      if (success) {
        setUserPermissionsState(prev => prev.filter(p => p !== permission));
      }
    } else {
      const success = await grantPermission(selectedUser, permission);
      if (success) {
        setUserPermissionsState(prev => [...prev, permission]);
      }
    }
  };

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
      <h2 className="text-xl font-semibold mb-4">Permission Editor</h2>

      <div className="mb-6">
        <Select
          label="Select User"
          value={selectedUser}
          onChange={(e) => setSelectedUser(e.target.value)}
        >
          <option value="">-- Select User --</option>
          {users.map(u => (
            <option key={u.id} value={u.id}>{u.email} ({u.role})</option>
          ))}
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
              const canToggle = canGrant(permission);
              return (
                <div
                  key={permission}
                  className={`flex items-center justify-between p-3 rounded-lg border ${isGranted ? 'border-green-500 bg-green-50' : 'border-gray-200'}`}
                >
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium truncate">{PERMISSION_DESCRIPTIONS[permission]}</p>
                    <p className="text-xs text-gray-500">{permission}</p>
                  </div>
                  <button
                    onClick={() => handleToggle(permission)}
                    disabled={!canToggle}
                    className={`ml-2 px-3 py-1 rounded text-sm font-medium transition-colors ${
                      isGranted
                        ? 'bg-green-500 text-white hover:bg-green-600'
                        : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                    } ${!canToggle ? 'opacity-50 cursor-not-allowed' : ''}`}
                    title={!canToggle ? 'You do not have permission to grant this' : ''}
                  >
                    {isGranted ? 'ON' : 'OFF'}
                  </button>
                </div>
              );
            })}
          </div>

          <p className="mt-4 text-xs text-gray-500">
            Note: Toggle is disabled if you don't have permission to grant/revoke it (Grant Ceiling enforced)
          </p>
        </div>
      )}
    </div>
  );
}