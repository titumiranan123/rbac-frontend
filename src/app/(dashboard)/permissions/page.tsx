'use client';

import { useEffect, useState } from 'react';
import api from '@/lib/api';
import { Permission } from '@/types';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

export default function PermissionsPage() {
  const [permissions, setPermissions] = useState<Permission[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchPermissions() {
      try {
        const response = await api.get('/permissions');
        setPermissions(response.data);
      } catch (error) {
        console.error('Failed to fetch permissions', error);
      } finally {
        setLoading(false);
      }
    }

    fetchPermissions();
  }, []);

  if (loading) {
    return <div className="text-center py-10">Loading...</div>;
  }

  const groupedPermissions = permissions.reduce((acc, perm) => {
    if (!acc[perm.resource]) {
      acc[perm.resource] = [];
    }
    acc[perm.resource].push(perm);
    return acc;
  }, {} as Record<string, Permission[]>);

  return (
    <div>
      <h1 className="text-3xl font-bold text-gray-900 mb-6">Permissions</h1>

      <Card className="mb-6">
        <CardContent className="pt-6">
          <p className="text-gray-600">
            Total Permissions: <span className="font-bold">{permissions.length}</span>
          </p>
        </CardContent>
      </Card>

      <div className="space-y-6">
        {Object.entries(groupedPermissions).map(([resource, perms]) => (
          <Card key={resource}>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="capitalize">{resource}</CardTitle>
                <Badge variant="info">{perms.length} permissions</Badge>
              </div>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b">
                      <th className="text-left py-2 px-4">Name</th>
                      <th className="text-left py-2 px-4">Description</th>
                      <th className="text-left py-2 px-4">Action</th>
                      <th className="text-left py-2 px-4">Level</th>
                      <th className="text-left py-2 px-4">Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {perms.map((perm) => (
                      <tr key={perm.id} className="border-b hover:bg-gray-50">
                        <td className="py-3 px-4 font-mono text-sm">{perm.name}</td>
                        <td className="py-3 px-4">{perm.description}</td>
                        <td className="py-3 px-4">
                          <Badge variant="default">{perm.action}</Badge>
                        </td>
                        <td className="py-3 px-4">
                          <Badge variant={perm.level === 0 ? 'danger' : perm.level === 1 ? 'warning' : 'info'}>
                            Level {perm.level}
                          </Badge>
                        </td>
                        <td className="py-3 px-4">
                          <Badge variant={perm.isActive ? 'success' : 'default'}>
                            {perm.isActive ? 'Active' : 'Inactive'}
                          </Badge>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}