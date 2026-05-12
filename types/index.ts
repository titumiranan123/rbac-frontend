export type Role = 'ADMIN' | 'MANAGER' | 'AGENT' | 'CUSTOMER';

export interface User {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  role: Role;
  isActive: boolean;
  lastLoginAt: string | null;
  createdAt: string;
  grantedPermissions?: string[];
}

export interface AuthResponse {
  accessToken: string;
  refreshToken: string;
  user: User;
}

export interface Permission {
  id: string;
  name: string;
  description: string;
  resource: string;
  action: string;
  level: number;
  isActive: boolean;
}

export interface RoleInfo {
  name: Role;
  description: string;
  level: number;
  permissions: string[];
}

export interface AuditLog {
  id: string;
  userId: string;
  userEmail: string;
  action: string;
  resource: string | null;
  resourceId: string | null;
  oldData: Record<string, unknown> | null;
  newData: Record<string, unknown> | null;
  ipAddress: string | null;
  userAgent: string | null;
  status: string | null;
  timestamp: string;
}

export interface PaginatedResponse<T> {
  data: T[];
  meta: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
}