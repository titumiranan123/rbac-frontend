'use client';

import { useEffect, useState } from 'react';
import { Permission } from '@/types';
import { apiClient } from '@/lib/api-client';

export default function PermissionsPage() {
  const [permissions, setPermissions] = useState<Permission[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchPermissions = async () => {
      try {
        const response = await apiClient.get('/permissions');
        setPermissions(Array.isArray(response.data) ? response.data : []);
      } catch (error) {
        console.error('Failed to fetch permissions', error);
      } finally {
        setLoading(false);
      }
    };
    fetchPermissions();
  }, []);

  const groupedPermissions = permissions.reduce((acc, perm) => {
    if (!acc[perm.resource]) acc[perm.resource] = [];
    acc[perm.resource].push(perm);
    return acc;
  }, {} as Record<string, Permission[]>);

  return (
    <div>
      <h1 className="text-3xl font-bold text-[#1F232A] mb-6">Permissions</h1>

      {loading ? (
        <div className="text-center py-10">Loading...</div>
      ) : (
        <div className="space-y-6">
          {Object.entries(groupedPermissions).map(([resource, perms]) => (
            <div key={resource} className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
              <h2 className="text-lg font-semibold text-[#1F232A] mb-4 capitalize">{resource}</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {perms.map((perm) => (
                  <div key={perm.id} className="p-4 bg-gray-50 rounded-lg">
                    <div className="font-medium text-[#1F232A]">{perm.name}</div>
                    <div className="text-sm text-[#404857] mt-1">{perm.description}</div>
                    <div className="text-xs text-gray-400 mt-2">Level: {perm.level}</div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}