export const PERMISSION_ATOMS = [
  'view_dashboard',
  'view_users',
  'create_user',
  'edit_user',
  'delete_user',
  'suspend_user',
  'ban_user',
  'view_leads',
  'create_lead',
  'edit_lead',
  'delete_lead',
  'view_tasks',
  'create_task',
  'edit_task',
  'delete_task',
  'view_reports',
  'view_audit_log',
  'view_settings',
  'view_customer_portal',
  'view_orders',
  'view_tickets',
] as const;

export type PermissionAtom = typeof PERMISSION_ATOMS[number];

export const ROUTE_PERMISSION_MAP: Record<string, PermissionAtom> = {
  '/dashboard': 'view_dashboard',
  '/users': 'view_users',
  '/leads': 'view_leads',
  '/tasks': 'view_tasks',
  '/reports': 'view_reports',
  '/audit': 'view_audit_log',
  '/settings': 'view_settings',
  '/customer-portal': 'view_customer_portal',
};

export const PERMISSION_DESCRIPTIONS: Record<PermissionAtom, string> = {
  view_dashboard: 'View Dashboard',
  view_users: 'View Users',
  create_user: 'Create Users',
  edit_user: 'Edit Users',
  delete_user: 'Delete Users',
  suspend_user: 'Suspend Users',
  ban_user: 'Ban Users',
  view_leads: 'View Leads',
  create_lead: 'Create Leads',
  edit_lead: 'Edit Leads',
  delete_lead: 'Delete Leads',
  view_tasks: 'View Tasks',
  create_task: 'Create Tasks',
  edit_task: 'Edit Tasks',
  delete_task: 'Delete Tasks',
  view_reports: 'View Reports',
  view_audit_log: 'View Audit Log',
  view_settings: 'View Settings',
  view_customer_portal: 'View Customer Portal',
  view_orders: 'View Orders',
  view_tickets: 'View Tickets',
};

export function getRequiredPermission(pathname: string): PermissionAtom | null {
  for (const [route, permission] of Object.entries(ROUTE_PERMISSION_MAP)) {
    if (pathname.startsWith(route)) return permission;
  }
  return null;
}

export function hasPermission(userPermissions: string[], required: PermissionAtom): boolean {
  return userPermissions.includes(required) || userPermissions.includes('*');
}