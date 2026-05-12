'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useAuthStore } from '@/store/auth.store';

export function Sidebar() {
  const pathname = usePathname();
  const { user, logout } = useAuthStore();

  const navigation = [
    { name: 'Dashboard', href: '/dashboard' },
    { name: 'Users', href: '/users', roles: ['ADMIN', 'MANAGER'] },
    { name: 'Roles', href: '/roles', roles: ['ADMIN', 'MANAGER'] },
    { name: 'Permissions', href: '/permissions', roles: ['ADMIN', 'MANAGER'] },
    { name: 'Audit Logs', href: '/audit', roles: ['ADMIN', 'MANAGER'] },
  ];

  const filteredNav = navigation.filter((item) => {
    if (!item.roles) return true;
    return user && item.roles.includes(user.role);
  });

  return (
    <div className="flex flex-col w-64 bg-gray-900">
      <div className="flex flex-col flex-grow pt-5 pb-4 overflow-y-auto">
        <div className="flex items-center px-4 mb-6">
          <span className="text-xl font-bold text-white">RBAC Admin</span>
        </div>

        <nav className="flex-1 px-2 space-y-1">
          {filteredNav.map((item) => {
            const isActive = pathname === item.href;
            return (
              <Link
                key={item.name}
                href={item.href}
                className={`
                  flex items-center px-4 py-2 text-sm font-medium rounded-md
                  ${isActive
                    ? 'bg-gray-800 text-white'
                    : 'text-gray-300 hover:bg-gray-700 hover:text-white'
                  }
                `}
              >
                {item.name}
              </Link>
            );
          })}
        </nav>
      </div>

      <div className="flex-shrink-0 p-4 border-t border-gray-800">
        <div className="flex items-center justify-between">
          <div className="text-sm text-gray-300">
            <p>{user?.firstName} {user?.lastName}</p>
            <p className="text-xs text-gray-500">{user?.role}</p>
          </div>
          <button
            onClick={logout}
            className="px-3 py-1 text-sm text-white bg-red-600 rounded hover:bg-red-700"
          >
            Logout
          </button>
        </div>
      </div>
    </div>
  );
}