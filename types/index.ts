export type User = {
  id: string; email: string; firstName: string; lastName: string;
  role: Role; isActive: boolean; lastLoginAt: string | null;
  createdAt: string; updatedAt: string; grantedPermissions?: string[];
};

export type Role = 'ADMIN' | 'MANAGER' | 'AGENT' | 'CUSTOMER';

export type AuthTokens = { accessToken: string; refreshToken: string; user: User };
export type PaginatedResult<T> = { data: T[]; meta: { total: number; page: number; limit: number; totalPages: number } };
export type Permission = { id: string; name: string; description: string; resource: string; action: string; level: number; isActive: boolean };
export type AuditLog = { id: string; userId: string; userEmail: string; action: string; resource: string | null; resourceId: string | null; ipAddress: string | null; timestamp: string; status?: string };
export type RoleInfo = { name: string; description: string; level: number; permissions: string[] };
export type Ticket = { id: string; subject: string; description: string; status: string; priority: string; createdAt: string; updatedAt: string };
export type Order = { id: string; orderNumber: string; total: number; status: string; createdAt: string; updatedAt: string };
export type GrantPermissionResult = { granted: boolean; message: string };