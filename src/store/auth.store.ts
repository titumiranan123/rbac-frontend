import { create } from 'zustand';
import { User, Role } from '@/types';
import { authService } from '@/lib/auth-service';
import { clearTokens } from '@/lib/auth';

interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  permissions: string[];
}

interface AuthActions {
  login: (user: User, accessToken: string, refreshToken: string) => void;
  logout: () => Promise<void>;
  setUser: (user: User | null) => void;
  setLoading: (loading: boolean) => void;
  addPermission: (permission: string) => void;
  removePermission: (permission: string) => void;
  clearPermissions: () => void;
  checkAuth: () => Promise<void>;
}

type AuthStore = AuthState & AuthActions;

const RolePermissions: Record<Role, string[]> = {
  ADMIN: ['*'],
  MANAGER: ['users:read', 'users:update', 'reports:read', 'audit:read'],
  AGENT: ['tickets:read', 'tickets:update', 'customers:read'],
  CUSTOMER: ['profile:read', 'profile:update'],
};

export const useAuthStore = create<AuthStore>((set) => ({
  user: null,
  isAuthenticated: false,
  isLoading: true,
  permissions: [],

  login: (user) => {
    clearTokens();
    const rolePerms = RolePermissions[user.role as Role] || [];
    const extraPerms = user.grantedPermissions || [];

    set({
      user,
      isAuthenticated: true,
      isLoading: false,
      permissions: [...rolePerms, ...extraPerms],
    });
  },

  logout: async () => {
    try {
      await authService.logout();
    } finally {
      clearTokens();
      set({
        user: null,
        isAuthenticated: false,
        isLoading: false,
        permissions: [],
      });
    }
  },

  setUser: (user) => {
    if (!user) {
      set({ user: null, permissions: [] });
      return;
    }
    const rolePerms = RolePermissions[user.role as Role] || [];
    const extraPerms = user.grantedPermissions || [];

    set({
      user,
      permissions: [...rolePerms, ...extraPerms],
    });
  },

  setLoading: (loading) => set({ isLoading: loading }),

  addPermission: (permission) => {
    set((state) => ({
      permissions: [...state.permissions, permission],
    }));
  },

  removePermission: (permission) => {
    set((state) => ({
      permissions: state.permissions.filter((p) => p !== permission),
    }));
  },

  clearPermissions: () => set({ permissions: [] }),

  checkAuth: async () => {
    set({ isLoading: true });

    try {
      const user = await authService.me();
      const rolePerms = RolePermissions[user.role as Role] || [];
      const extraPerms = user.grantedPermissions || [];

      set({
        user,
        isAuthenticated: true,
        isLoading: false,
        permissions: [...rolePerms, ...extraPerms],
      });
    } catch {
      clearTokens();
      set({
        user: null,
        isAuthenticated: false,
        isLoading: false,
        permissions: [],
      });
    }
  },
}));

export const hasPermission = (permissions: string[], required: string): boolean => {
  if (permissions.includes('*')) return true;

  const [resource, action] = required.split(':');

  return permissions.some((perm) => {
    if (perm === '*') return true;
    if (perm === required) return true;
    if (perm === resource + ':*') return true;
    if (perm === '*:' + action) return true;
    return false;
  });
};

export const hasRole = (userRole: Role | undefined, requiredRoles: Role[]): boolean => {
  if (!userRole) return false;

  const RoleHierarchy: Record<Role, number> = {
    ADMIN: 0,
    MANAGER: 1,
    AGENT: 2,
    CUSTOMER: 3,
  };

  const userLevel = RoleHierarchy[userRole] ?? 999;

  return requiredRoles.some((role) => {
    const requiredLevel = RoleHierarchy[role] ?? 999;
    return userLevel <= requiredLevel;
  });
};