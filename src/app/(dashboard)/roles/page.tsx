'use client';

import { useEffect, useState } from 'react';
import api from '@/lib/api';
import { RoleInfo } from '@/types';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

export default function RolesPage() {
  const [roles, setRoles] = useState<RoleInfo[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchRoles() {
      try {
        const response = await api.get('/roles');
        setRoles(response.data);
      } catch (error) {
        console.error('Failed to fetch roles', error);
      } finally {
        setLoading(false);
      }
    }

    fetchRoles();
  }, []);

  if (loading) {
    return <div className="text-center py-10">Loading...</div>;
  }

  const getRoleBadgeVariant = (role: string) => {
    switch (role) {
      case 'ADMIN': return 'danger';
      case 'MANAGER': return 'warning';
      case 'AGENT': return 'info';
      case 'CUSTOMER': return 'default';
      default: return 'default';
    }
  };

  return (
    <div>
      <h1 className="text-3xl font-bold text-gray-900 mb-6">Roles</h1>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {roles.map((role) => (
          <Card key={role.name}>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle>{role.name}</CardTitle>
                <Badge variant={getRoleBadgeVariant(role.name) as any}>
                  Level {role.level}
                </Badge>
              </div>
            </CardHeader>
            <CardContent>
              <p className="text-gray-600 mb-4">{role.description}</p>
              <div>
                <h4 className="text-sm font-medium text-gray-700 mb-2">Permissions:</h4>
                <div className="flex flex-wrap gap-2">
                  {role.permissions.map((perm) => (
                    <Badge key={perm} variant="info">
                      {perm === '*' ? 'All Permissions' : perm}
                    </Badge>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <Card className="mt-8">
        <CardHeader>
          <CardTitle>Role Hierarchy</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center space-x-4">
            <div className="text-center">
              <div className="w-24 h-24 rounded-full bg-red-100 flex items-center justify-center mb-2">
                <span className="text-2xl font-bold text-red-700">0</span>
              </div>
              <p className="font-medium">Admin</p>
              <p className="text-sm text-gray-500">Highest</p>
            </div>
            <span className="text-2xl text-gray-400">→</span>
            <div className="text-center">
              <div className="w-24 h-24 rounded-full bg-yellow-100 flex items-center justify-center mb-2">
                <span className="text-2xl font-bold text-yellow-700">1</span>
              </div>
              <p className="font-medium">Manager</p>
              <p className="text-sm text-gray-500">Medium</p>
            </div>
            <span className="text-2xl text-gray-400">→</span>
            <div className="text-center">
              <div className="w-24 h-24 rounded-full bg-blue-100 flex items-center justify-center mb-2">
                <span className="text-2xl font-bold text-blue-700">2</span>
              </div>
              <p className="font-medium">Agent</p>
              <p className="text-sm text-gray-500">Low</p>
            </div>
            <span className="text-2xl text-gray-400">→</span>
            <div className="text-center">
              <div className="w-24 h-24 rounded-full bg-gray-100 flex items-center justify-center mb-2">
                <span className="text-2xl font-bold text-gray-700">3</span>
              </div>
              <p className="font-medium">Customer</p>
              <p className="text-sm text-gray-500">Lowest</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}