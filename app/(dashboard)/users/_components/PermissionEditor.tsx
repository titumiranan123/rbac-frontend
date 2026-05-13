'use client';

import { useState, useEffect } from 'react';
import Cookies from 'js-cookie';
import toast from 'react-hot-toast';
import { User } from '@/types';
import { parseJwt } from '@/lib/parseJwt';

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
  const [allPermissions, setAllPermissions] = useState<Permission[]>([]);
  const [userPermissions, setUserPermissions] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [toggling, setToggling] = useState<string | null>(null);

  useEffect(() => {
    if (!user.id) return;

    const token = Cookies.get('accessToken');

    Promise.all([
      fetch(`${process.env.NEXT_PUBLIC_API_URL}/permissions`, {
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
        },
      }),
      fetch(`${process.env.NEXT_PUBLIC_API_URL}/users/permissions/user/${user.id}`, {
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
        },
      }),
    ])
      .then(([allRes, userRes]) =>
        Promise.all([allRes.json(), userRes.json()])
      )
      .then(([allData, userData]) => {
        const permissionsArray = Array.isArray(allData) ? allData : [];
        setAllPermissions(permissionsArray);
        setUserPermissions(userData.grantedPermissions || []);
      })
      .catch((error) => {
        console.error('Failed to fetch permissions:', error);
        toast.error('Failed to load permissions');
      })
      .finally(() => {
        setLoading(false);
      });
  }, [user.id]);

  const canManagePermission = (permName: string): boolean => {
    if (currentUserRole === 'ADMIN') return true;
    if (userPermissions.includes('*')) return true;
    return userPermissions.includes(permName);
  };

  const togglePermission = async (permissionName: string) => {
    const hasPermission = userPermissions.includes(permissionName);
    const isGranted = hasPermission;
    setToggling(permissionName);

    try {
      const endpoint = `${process.env.NEXT_PUBLIC_API_URL}/users/${user.id}/permissions/${permissionName}`;
      const response = await fetch(endpoint, {
        method: isGranted ? 'DELETE' : 'POST',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
      });

      if (response.ok) {
        if (isGranted) {
          setUserPermissions((prev) => prev.filter((p) => p !== permissionName));
        } else {
          setUserPermissions((prev) => [...prev, permissionName]);
        }
        onSuccess();
        toast.success(`Permission ${isGranted ? 'revoked' : 'granted'} successfully`);
      } else {
        const data = await response.json();
        toast.error(data.message || 'Failed to update permission');
      }
    } catch (error) {
      console.error('Failed to toggle permission:', error);
      toast.error('Failed to update permission');
    } finally {
      setToggling(null);
    }
  };

  const groupedPermissions = Array.isArray(allPermissions)
    ? allPermissions.reduce((acc, perm) => {
        const resource = perm.resource;
        if (!acc[resource]) acc[resource] = [];
        acc[resource].push(perm);
        return acc;
      }, {} as Record<string, Permission[]>)
    : {};

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-xl p-6 w-full max-w-4xl max-h-[90vh] overflow-hidden flex flex-col">
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
        ) : allPermissions.length === 0 ? (
          <div className="text-center py-8 text-gray-500">No permissions available</div>
        ) : (
          <div className="overflow-y-auto flex-1">
            {Object.entries(groupedPermissions).map(([resource, perms]) => (
              <div key={resource} className="mb-6">
                <h3 className="text-lg font-medium text-gray-900 mb-3 capitalize">
                  {resource.replace(/_/g, ' ')}
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                  {perms.map((perm) => {
                    const isGranted = userPermissions.includes(perm.name);
                    const canManage = canManagePermission(perm.name);
                    const isToggling = toggling === perm.name;

                    return (
                      <div
                        key={perm.id}
                        className={`p-3 rounded-lg border ${
                          isGranted ? 'border-green-500 bg-green-50' : 'border-gray-200'
                        } ${!canManage ? 'opacity-50' : ''}`}
                      >
                        <div className="flex items-center justify-between">
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium text-gray-900 truncate">
                              {perm.description || perm.name}
                            </p>
                            <p className="text-xs text-gray-500">{perm.name}</p>
                          </div>
                          <button
                            onClick={() => canManage && !isToggling && togglePermission(perm.name)}
                            disabled={!canManage || isToggling}
                            className={`ml-2 px-3 py-1 rounded text-sm font-medium transition-colors ${
                              isGranted
                                ? 'bg-green-500 text-white hover:bg-green-600'
                                : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                            } ${!canManage || isToggling ? 'opacity-50 cursor-not-allowed' : ''}`}
                          >
                            {isToggling ? '...' : isGranted ? 'ON' : 'OFF'}
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>
        )}

        <div className="flex justify-end pt-4 border-t">
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