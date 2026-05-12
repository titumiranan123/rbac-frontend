'use client';

import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { createUserSchema, CreateUserInput, updateUserSchema, UpdateUserInput } from '@/lib/schemas';
import api from '@/lib/api';
import { User, Role } from '@/types';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

export default function UsersPage() {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingUser, setEditingUser] = useState<User | null>(null);

  const createForm = useForm<CreateUserInput>({
    resolver: zodResolver(createUserSchema),
  });

  const updateForm = useForm<UpdateUserInput>({
    resolver: zodResolver(updateUserSchema),
  });

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      const response = await api.get('/users');
      setUsers(response.data.data);
    } catch (error) {
      console.error('Failed to fetch users', error);
    } finally {
      setLoading(false);
    }
  };

  const onCreateSubmit = async (data: CreateUserInput) => {
    try {
      await api.post('/users', data);
      setShowModal(false);
      createForm.reset();
      fetchUsers();
    } catch (error: any) {
      createForm.setError('root', { message: error.response?.data?.message || 'Failed to create user' });
    }
  };

  const onUpdateSubmit = async (data: UpdateUserInput) => {
    if (!editingUser) return;
    try {
      await api.put(`/users/${editingUser.id}`, data);
      setEditingUser(null);
      updateForm.reset();
      fetchUsers();
    } catch (error: any) {
      updateForm.setError('root', { message: error.response?.data?.message || 'Failed to update user' });
    }
  };

  const deleteUser = async (id: string) => {
    if (!confirm('Are you sure you want to delete this user?')) return;
    try {
      await api.delete(`/users/${id}`);
      fetchUsers();
    } catch (error: any) {
      alert(error.response?.data?.message || 'Failed to delete user');
    }
  };

  const assignRole = async (userId: string, role: Role) => {
    try {
      await api.post(`/users/${userId}/role`, { role });
      fetchUsers();
    } catch (error: any) {
      alert(error.response?.data?.message || 'Failed to assign role');
    }
  };

  if (loading) {
    return <div className="text-center py-10">Loading...</div>;
  }

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold text-gray-900">Users</h1>
        <Button onClick={() => setShowModal(true)}>Add User</Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>All Users ({users.length})</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b">
                  <th className="text-left py-3 px-4">Name</th>
                  <th className="text-left py-3 px-4">Email</th>
                  <th className="text-left py-3 px-4">Role</th>
                  <th className="text-left py-3 px-4">Status</th>
                  <th className="text-left py-3 px-4">Actions</th>
                </tr>
              </thead>
              <tbody>
                {users.map((user) => (
                  <tr key={user.id} className="border-b hover:bg-gray-50">
                    <td className="py-3 px-4">
                      {user.firstName} {user.lastName}
                    </td>
                    <td className="py-3 px-4">{user.email}</td>
                    <td className="py-3 px-4">
                      <select
                        value={user.role}
                        onChange={(e) => assignRole(user.id, e.target.value as Role)}
                        className="border rounded px-2 py-1"
                      >
                        <option value="ADMIN">Admin</option>
                        <option value="MANAGER">Manager</option>
                        <option value="AGENT">Agent</option>
                        <option value="CUSTOMER">Customer</option>
                      </select>
                    </td>
                    <td className="py-3 px-4">
                      <Badge variant={user.isActive ? 'success' : 'danger'}>
                        {user.isActive ? 'Active' : 'Inactive'}
                      </Badge>
                    </td>
                    <td className="py-3 px-4">
                      <div className="flex gap-2">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => {
                            setEditingUser(user);
                            updateForm.reset({
                              firstName: user.firstName,
                              lastName: user.lastName,
                              isActive: user.isActive,
                            });
                          }}
                        >
                          Edit
                        </Button>
                        <Button
                          size="sm"
                          variant="danger"
                          onClick={() => deleteUser(user.id)}
                        >
                          Delete
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <Card className="w-full max-w-md mx-4">
            <CardHeader>
              <CardTitle>Add New User</CardTitle>
            </CardHeader>
            <CardContent>
              <form onSubmit={createForm.handleSubmit(onCreateSubmit)} className="space-y-4">
                <Input
                  label="First Name"
                  error={createForm.formState.errors.firstName?.message}
                  {...createForm.register('firstName')}
                />
                <Input
                  label="Last Name"
                  error={createForm.formState.errors.lastName?.message}
                  {...createForm.register('lastName')}
                />
                <Input
                  label="Email"
                  type="email"
                  error={createForm.formState.errors.email?.message}
                  {...createForm.register('email')}
                />
                <Input
                  label="Password"
                  type="password"
                  error={createForm.formState.errors.password?.message}
                  {...createForm.register('password')}
                />
                <select
                  className="w-full border rounded px-3 py-2"
                  {...createForm.register('role')}
                >
                  <option value="CUSTOMER">Customer</option>
                  <option value="AGENT">Agent</option>
                  <option value="MANAGER">Manager</option>
                  <option value="ADMIN">Admin</option>
                </select>
                {createForm.formState.errors.root && (
                  <p className="text-sm text-red-500">{createForm.formState.errors.root.message}</p>
                )}
                <div className="flex justify-end gap-2">
                  <Button type="button" variant="outline" onClick={() => setShowModal(false)}>
                    Cancel
                  </Button>
                  <Button type="submit">Create</Button>
                </div>
              </form>
            </CardContent>
          </Card>
        </div>
      )}

      {editingUser && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <Card className="w-full max-w-md mx-4">
            <CardHeader>
              <CardTitle>Edit User</CardTitle>
            </CardHeader>
            <CardContent>
              <form onSubmit={updateForm.handleSubmit(onUpdateSubmit)} className="space-y-4">
                <Input
                  label="First Name"
                  error={updateForm.formState.errors.firstName?.message}
                  {...updateForm.register('firstName')}
                />
                <Input
                  label="Last Name"
                  error={updateForm.formState.errors.lastName?.message}
                  {...updateForm.register('lastName')}
                />
                <label className="flex items-center gap-2">
                  <input type="checkbox" {...updateForm.register('isActive')} />
                  Active
                </label>
                {updateForm.formState.errors.root && (
                  <p className="text-sm text-red-500">{updateForm.formState.errors.root.message}</p>
                )}
                <div className="flex justify-end gap-2">
                  <Button type="button" variant="outline" onClick={() => setEditingUser(null)}>
                    Cancel
                  </Button>
                  <Button type="submit">Update</Button>
                </div>
              </form>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}