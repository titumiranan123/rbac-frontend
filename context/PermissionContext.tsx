'use client';
import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { useAuth } from './AuthContext';
import { apiClient } from '@/lib/api-client';
import { PERMISSION_ATOMS, PermissionAtom } from '@/lib/permissions';

interface PermissionContextType {
  userPermissions: string[];
  allPermissions: string[];
  hasPermission: (permission: PermissionAtom) => boolean;
  grantPermission: (userId: string, permission: string) => Promise<boolean>;
  revokePermission: (userId: string, permission: string) => Promise<boolean>;
  canGrant: (permission: PermissionAtom) => boolean;
  refreshPermissions: () => Promise<void>;
}

const PermissionContext = createContext<PermissionContextType | undefined>(undefined);

export function PermissionProvider({ children }: { children: ReactNode }) {
  const { user } = useAuth();
  const [userPermissions, setUserPermissions] = useState<string[]>([]);

  useEffect(() => {
    if (user?.grantedPermissions) {
      setUserPermissions(user.grantedPermissions);
    }
  }, [user?.grantedPermissions]);

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

  const hasPermission = (permission: PermissionAtom): boolean => {
    return userPermissions.includes(permission) || userPermissions.includes('*');
  };

  const canGrant = (permission: PermissionAtom): boolean => {
    return userPermissions.includes(permission) || userPermissions.includes('*') || userPermissions.includes(permission.replace('view_', ''));
  };

  const grantPermission = async (userId: string, permission: string): Promise<boolean> => {
    try {
      await apiClient.post(`/users/${userId}/permissions/${permission}`);
      return true;
    } catch (error: unknown) {
      const err = error as { response?: { status?: number } };
      return err.response?.status !== 403;
    }
  };

  const revokePermission = async (userId: string, permission: string): Promise<boolean> => {
    try {
      await apiClient.delete(`/users/${userId}/permissions/${permission}`);
      return true;
    } catch (error: unknown) {
      const err = error as { response?: { status?: number } };
      return err.response?.status !== 403;
    }
  };

  return (
    <PermissionContext.Provider value={{
      userPermissions,
      allPermissions: PERMISSION_ATOMS as unknown as string[],
      hasPermission,
      grantPermission,
      revokePermission,
      canGrant,
      refreshPermissions,
    }}>
      {children}
    </PermissionContext.Provider>
  );
}

export function usePermissions() {
  const context = useContext(PermissionContext);
  if (!context) throw new Error('usePermissions must be used within PermissionProvider');
  return context;
}