import type { Metadata } from 'next';
import './globals.css';
import { AuthProvider, PermissionProvider } from '@/context';
import { QueryProvider } from '@/providers/QueryProvider';
import { Toaster } from 'react-hot-toast';
import { LoadingGuard } from '@/components/LoadingGuard';

export const metadata: Metadata = {
  title: 'RBAC Admin',
  description: 'Role-Based Access Control System',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className="min-h-screen bg-gray-50">
        <AuthProvider>
          <PermissionProvider>
            <QueryProvider>
              <LoadingGuard />
              {children}
              <Toaster
                position="top-right"
                toastOptions={{
                  duration: 4000,
                  style: {
                    background: 'var(--color-gray-800)',
                    color: 'white',
                    borderRadius: 'var(--radius-lg)',
                    padding: 'var(--spacing-3) var(--spacing-4)',
                  },
                  success: {
                    style: {
                      background: 'var(--color-success)',
                    },
                  },
                  error: {
                    style: {
                      background: 'var(--color-danger)',
                    },
                  },
                }}
              />
            </QueryProvider>
          </PermissionProvider>
        </AuthProvider>
      </body>
    </html>
  );
}