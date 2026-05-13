'use client';

import { useState, useEffect } from 'react';
import toast from 'react-hot-toast';
import { User } from '@/types';
import { apiClient } from '@/lib/api-client';

interface Permission {
  id: string;
  name: string;
  description: string;
  resource: string;
  action: string;
  level: number;
}

interface PermissionEditorProps {
  user: User;
  currentUserRole: string;
  onClose: () => void;
  onSuccess: () => void;
}

export function PermissionEditor({ user, currentUserRole, onClose, onSuccess }: PermissionEditorProps) {
  const [grantable, setGrantable] = useState<Permission[]>([]);
  const [userPerms, setUserPerms] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user.id) return;

    Promise.all([
      apiClient.get('/permissions/grantable'),
      apiClient.get(`/users/permissions/user/${user.id}`),
    ])
      .then(([grantRes, userRes]) => {
        const grantableArray = Array.isArray(grantRes.data) ? grantRes.data : [];
        setGrantable(grantableArray);
        setUserPerms(userRes.data.grantedPermissions || []);
      })
      .catch((error) => {
        console.error('Failed to fetch permissions:', error);
        toast.error('Failed to load permissions');
      })
      .finally(() => {
        setLoading(false);
      });
  }, [user.id]);

  const toggle = async (permName: string) => {
    const has = userPerms.includes(permName);

    try {
      const endpoint = has ? '/permissions/revoke' : '/permissions/grant';
      await apiClient.post(endpoint, {
        userId: user.id,
        permissionName: permName,
      });

      setUserPerms((prev) =>
        has ? prev.filter((p) => p !== permName) : [...prev, permName]
      );
      onSuccess();
      toast.success(has ? 'Permission revoked' : 'Permission granted');
    } catch (error: any) {
      const message = error.response?.data?.message || 'Failed to update permission';
      toast.error(message);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-xl p-6 w-full max-w-2xl max-h-[90vh] overflow-hidden flex flex-col">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-xl font-semibold text-gray-900">Manage Permissions</h2>
            <p className="text-sm text-gray-500">
              User: {user.firstName} {user.lastName} ({user.email})
            </p>
          </div>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {loading ? (
          <div className="flex justify-center py-8">
            <div className="w-8 h-8 border-4 border-orange-500 border-t-transparent rounded-full animate-spin"></div>
          </div>
        ) : grantable.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            You have no permissions to grant
          </div>
        ) : (
          <div className="space-y-2 max-h-96 overflow-y-auto">
            {grantable.map((perm) => (
              <label
                key={perm.id}
                className="flex items-center justify-between p-3 border rounded cursor-pointer hover:bg-gray-50"
              >
                <div>
                  <p className="font-medium text-gray-900">{perm.description || perm.name}</p>
                  <p className="text-sm text-gray-500">{perm.name}</p>
                </div>
                <input
                  type="checkbox"
                  className="w-4 h-4 text-orange-500 rounded focus:ring-orange-500"
                  checked={userPerms.includes(perm.name)}
                  onChange={() => toggle(perm.name)}
                />
              </label>
            ))}
          </div>
        )}

        <div className="flex justify-end pt-4 border-t mt-4">
          <button
            onClick={onClose}
            className="px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 font-medium"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}