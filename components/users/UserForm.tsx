'use client';

import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { User, Role } from '@/types';
import { Button } from '@/components/ui';

const userSchema = z.object({
  firstName: z.string().min(1, 'First name is required'),
  lastName: z.string().min(1, 'Last name is required'),
  email: z.string().email('Invalid email format'),
  password: z.string().min(8, 'Password must be at least 8 characters').optional(),
  role: z.enum(['ADMIN', 'MANAGER', 'AGENT', 'CUSTOMER']),
  isActive: z.boolean(),
});

type UserFormData = z.infer<typeof userSchema>;

interface UserFormProps {
  user?: User;
  onSubmit: (data: Partial<UserFormData> & { password?: string }) => void;
  onCancel: () => void;
  loading?: boolean;
}

export function UserForm({ user, onSubmit, onCancel, loading = false }: UserFormProps) {
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<UserFormData>({
    resolver: zodResolver(userSchema),
    defaultValues: {
      firstName: user?.firstName || '',
      lastName: user?.lastName || '',
      email: user?.email || '',
      role: user?.role || 'CUSTOMER',
      isActive: user?.isActive ?? true,
    },
  });

  const onFormSubmit = (data: UserFormData) => {
    const submitData = { ...data };
    if (user) {
      delete submitData.password;
    }
    onSubmit(submitData);
  };

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
      <h2 className="text-xl font-semibold text-(--color-gray-900) mb-6">
        {user ? 'Edit User' : 'Create New User'}
      </h2>

      <form onSubmit={handleSubmit(onFormSubmit)} className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium text-(--color-gray-900) mb-2">
              First Name <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              {...register('firstName')}
              className={`w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-(--color-primary) ${
                errors.firstName ? 'border-red-500' : 'border-gray-300'
              }`}
              placeholder="John"
            />
            {errors.firstName && (
              <p className="mt-1 text-sm text-red-500">{errors.firstName.message}</p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-(--color-gray-900) mb-2">
              Last Name <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              {...register('lastName')}
              className={`w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-(--color-primary) ${
                errors.lastName ? 'border-red-500' : 'border-gray-300'
              }`}
              placeholder="Doe"
            />
            {errors.lastName && (
              <p className="mt-1 text-sm text-red-500">{errors.lastName.message}</p>
            )}
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-(--color-gray-900) mb-2">
            Email <span className="text-red-500">*</span>
          </label>
          <input
            type="email"
            {...register('email')}
            className={`w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-(--color-primary) ${
              errors.email ? 'border-red-500' : 'border-gray-300'
            }`}
            placeholder="john@example.com"
          />
          {errors.email && (
            <p className="mt-1 text-sm text-red-500">{errors.email.message}</p>
          )}
        </div>

        {!user && (
          <div>
            <label className="block text-sm font-medium text-(--color-gray-900) mb-2">
              Password <span className="text-red-500">*</span>
            </label>
            <input
              type="password"
              {...register('password')}
              className={`w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-(--color-primary) ${
                errors.password ? 'border-red-500' : 'border-gray-300'
              }`}
              placeholder="Min 8 characters"
            />
            {errors.password && (
              <p className="mt-1 text-sm text-red-500">{errors.password.message}</p>
            )}
          </div>
        )}

        <div>
          <label className="block text-sm font-medium text-(--color-gray-900) mb-2">
            Role <span className="text-red-500">*</span>
          </label>
          <select
            {...register('role')}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-(--color-primary)"
          >
            <option value="CUSTOMER">Customer</option>
            <option value="AGENT">Agent</option>
            <option value="MANAGER">Manager</option>
            <option value="ADMIN">Admin</option>
          </select>
          {errors.role && (
            <p className="mt-1 text-sm text-red-500">{errors.role.message}</p>
          )}
        </div>

        <div className="flex items-center gap-3">
          <input
            type="checkbox"
            id="isActive"
            {...register('isActive')}
            className="w-5 h-5 rounded border-gray-300 text-(--color-primary) focus:ring-(--color-primary)"
          />
          <label htmlFor="isActive" className="text-sm font-medium text-(--color-gray-900)">
            Active Account
          </label>
        </div>

        <div className="flex items-center gap-3 pt-4 border-t border-gray-100">
          <Button type="submit" isLoading={loading}>
            {user ? 'Update User' : 'Create User'}
          </Button>
          <Button type="button" variant="outline" onClick={onCancel}>
            Cancel
          </Button>
        </div>
      </form>
    </div>
  );
}