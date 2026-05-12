import { Permission, Role } from '@/types';

const roleData = [
  { name: 'ADMIN' as Role, description: 'Full system access with all permissions', level: 0, permissions: ['*'] },
  { name: 'MANAGER' as Role, description: 'Can manage users and view reports', level: 1, permissions: ['users:read', 'users:update', 'reports:read'] },
  { name: 'AGENT' as Role, description: 'Can handle customer requests', level: 2, permissions: ['tickets:read', 'tickets:update', 'customers:read'] },
  { name: 'CUSTOMER' as Role, description: 'Basic customer access', level: 3, permissions: ['profile:read', 'profile:update'] },
];

export default function RolesPage() {
  return (
    <div>
      <h1 className="text-3xl font-bold text-[#1F232A] mb-6">Roles</h1>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {roleData.map((role) => (
          <div key={role.name} className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-semibold text-[#1F232A]">{role.name}</h2>
              <span className={`px-3 py-1 rounded-full text-xs font-medium ${role.level === 0 ? 'bg-red-100 text-red-700' : role.level === 1 ? 'bg-yellow-100 text-yellow-700' : 'bg-blue-100 text-blue-700'}`}>
                Level {role.level}
              </span>
            </div>
            <p className="text-[#404857] mb-4">{role.description}</p>
            <div className="flex flex-wrap gap-2">
              {role.permissions.map((perm) => (
                <span key={perm} className="px-3 py-1 bg-gray-100 text-[#404857] rounded-lg text-sm">
                  {perm === '*' ? 'All Permissions' : perm}
                </span>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}