import { useState, useCallback, useEffect } from 'react';
import { apiClient } from '@/lib/api-client';
import { useAuthStore } from '@/store/auth.store';
import { Permission, Role } from '@/types';

const RolePermissions: Record<Role, string[]> = {
  ADMIN: ['*'],
  MANAGER: ['users:read', 'users:update', 'reports:read', 'audit:read'],
  AGENT: ['tickets:read', 'tickets:update', 'customers:read'],
  CUSTOMER: ['profile:read', 'profile:update'],
};

const RoleHierarchy: Record<string, number> = {
  ADMIN: 0,
  MANAGER: 1,
  AGENT: 2,
  CUSTOMER: 3,
};

export function usePermissions() {
  const { user } = useAuthStore();
  const [permissions, setPermissions] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (user?.role) {
      const rolePerms = RolePermissions[user.role as Role] || [];
      setPermissions(rolePerms);

      if (user.grantedPermissions && user.grantedPermissions.length > 0) {
        setPermissions((prev) => [...prev, ...user.grantedPermissions!]);
      }
    }
  }, [user]);

  const hasPermission = useCallback(
    (permission: string): boolean => {
      if (permissions.includes('*')) return true;

      const [resource, action] = permission.split(':');

      return permissions.some((perm) => {
        if (perm === '*') return true;
        if (perm === permission) return true;
        if (perm === resource + ':*') return true;
        if (perm === '*:' + action) return true;
        return false;
      });
    },
    [permissions]
  );

  const hasRole = useCallback(
    (roles: Role[]): boolean => {
      if (!user?.role) return false;
      return roles.includes(user.role as Role);
    },
    [user]
  );

  const canAccessRoute = useCallback(
    (requiredRoles?: Role[]): boolean => {
      if (!requiredRoles || requiredRoles.length === 0) return true;

      const userLevel = RoleHierarchy[user?.role as Role] ?? 999;

      return requiredRoles.some((role) => {
        const requiredLevel = RoleHierarchy[role] ?? 999;
        return userLevel <= requiredLevel;
      });
    },
    [user]
  );

  const fetchPermissions = useCallback(async () => {
    if (!user) return;

    setIsLoading(true);
    try {
      const response = await apiClient.get('/permissions');
      const allPerms = response.data as Permission[];
      const userPerms = allPerms
        .filter((p) => p.level >= (RoleHierarchy[user.role as Role] ?? 999))
        .map((p) => p.name);

      setPermissions((prev) => [...new Set([...prev, ...userPerms])]);
    } catch (error) {
      console.error('Failed to fetch permissions', error);
    } finally {
      setIsLoading(false);
    }
  }, [user]);

  return {
    permissions,
    isLoading,
    hasPermission,
    hasRole,
    canAccessRoute,
    fetchPermissions,
  };
}