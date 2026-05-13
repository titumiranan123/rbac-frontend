'use client';
import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { useAuth } from './AuthContext';
import { apiClient } from '@/lib/api-client';

interface Permission {
  id: string;
  name: string;
  description: string;
  resource: string;
  action: string;
  level: number;
}

interface PermissionContextType {
  userPermissions: string[];
  allPermissions: Permission[];
  isLoading: boolean;
  hasPermission: (permission: string) => boolean;
  grantPermission: (userId: string, permission: string) => Promise<boolean>;
  revokePermission: (userId: string, permission: string) => Promise<boolean>;
  canGrant: (permission: string) => boolean;
  refreshPermissions: () => Promise<void>;
  refreshAllPermissions: () => Promise<void>;
}

const PermissionContext = createContext<PermissionContextType | undefined>(undefined);

export function PermissionProvider({ children }: { children: ReactNode }) {
  const { user } = useAuth();
  const [userPermissions, setUserPermissions] = useState<string[]>([]);
  const [allPermissions, setAllPermissions] = useState<Permission[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (user?.grantedPermissions) {
      setUserPermissions(user.grantedPermissions);
    }
    refreshAllPermissions();
  }, [user?.grantedPermissions]);

  const refreshAllPermissions = async () => {
    setIsLoading(true);
    try {
      const response = await apiClient.get('/permissions');
      if (response.data && Array.isArray(response.data)) {
        setAllPermissions(response.data);
      }
    } catch {
      // Ignore
    } finally {
      setIsLoading(false);
    }
  };

  const refreshPermissions = async () => {
    try {
      const response = await apiClient.get('/users/me');
      if (response.data.grantedPermissions) {
        setUserPermissions(response.data.grantedPermissions);
      }
    } catch {
      // Ignore
    }
  };

  const hasPermission = (permission: string): boolean => {
    return userPermissions.includes(permission) || userPermissions.includes('*');
  };

  const canGrant = (permission: string): boolean => {
    if (userPermissions.includes('*')) return true;
    if (userPermissions.includes(permission)) return true;
    const relatedPerms = [
      permission.replace('view_', ''),
      permission.replace('create_', ''),
      permission.replace('edit_', ''),
      permission.replace('delete_', ''),
    ];
    return relatedPerms.some((p) => userPermissions.includes(p));
  };

  const grantPermission = async (userId: string, permission: string): Promise<boolean> => {
    try {
      await apiClient.post(`/permissions/grant`, { userId, permission });
      return true;
    } catch (error: unknown) {
      const err = error as { response?: { status?: number } };
      return err.response?.status !== 403;
    }
  };

  const revokePermission = async (userId: string, permission: string): Promise<boolean> => {
    try {
      await apiClient.delete(`/permissions/revoke`, { data: { userId, permission } });
      return true;
    } catch (error: unknown) {
      const err = error as { response?: { status?: number } };
      return err.response?.status !== 403;
    }
  };

  return (
    <PermissionContext.Provider
      value={{
        userPermissions,
        allPermissions,
        isLoading,
        hasPermission,
        grantPermission,
        revokePermission,
        canGrant,
        refreshPermissions,
        refreshAllPermissions,
      }}
    >
      {children}
    </PermissionContext.Provider>
  );
}

export function usePermissions() {
  const context = useContext(PermissionContext);
  if (!context) throw new Error('usePermissions must be used within PermissionProvider');
  return context;
}