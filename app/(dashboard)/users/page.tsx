'use client';

import { useState, useEffect } from 'react';
import { apiClient } from '@/lib/api-client';
import { PaginatedResult, User } from '@/types';
import UsersClient from './UsersClient';

export default function UsersPage() {
  const [initialData, setInitialData] = useState<PaginatedResult<User> | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const response = await apiClient.get('/users?page=1&limit=20');
        setInitialData(response.data);
      } catch (error) {
        console.error('Failed to fetch users:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchUsers();
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="w-8 h-8 border-4 border-orange-500 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  return <UsersClient initialData={initialData} />;
}