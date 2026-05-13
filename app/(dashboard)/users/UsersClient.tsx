"use client";

import { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import toast from "react-hot-toast";
import { User } from "@/types";
import { PaginatedResult } from "@/types";
import { UserTable, UserForm } from "@/components/users";
import { apiClient } from "@/lib/api-client";

interface UsersClientProps {
  initialData: PaginatedResult<User> | null;
}

export default function UsersClient({ initialData }: UsersClientProps) {
  const queryClient = useQueryClient();
  const [pagination, setPagination] = useState({
    page: initialData?.meta?.page || 1,
    limit: initialData?.meta?.limit || 20,
    total: initialData?.meta?.total || 0,
    totalPages: initialData?.meta?.totalPages || 1,
  });
  const [editingUser, setEditingUser] = useState<User | null>(null);
  const [showCreateForm, setShowCreateForm] = useState(false);

  const updateUserMutation = useMutation({
    mutationFn: async ({
      userId,
      data,
    }: {
      userId: string;
      data: Partial<User>;
    }) => {
      const response = await apiClient.put(`/users/${userId}`, data);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["users"] });
      toast.success("User updated successfully");
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || "Failed to update user");
    },
  });

  const suspendMutation = useMutation({
    mutationFn: async (userId: string) => {
      const response = await apiClient.put(`/users/${userId}`, {
        isActive: false,
      });
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["users"] });
      toast.success("User suspended successfully");
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || "Failed to suspend user");
    },
  });

  const banMutation = useMutation({
    mutationFn: async (userId: string) => {
      const response = await apiClient.put(`/users/${userId}`, {
        isActive: false,
      });
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["users"] });
      toast.success("User banned successfully");
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || "Failed to ban user");
    },
  });

  const restoreMutation = useMutation({
    mutationFn: async (userId: string) => {
      const response = await apiClient.put(`/users/${userId}`, {
        isActive: true,
      });
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["users"] });
      toast.success("User restored successfully");
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || "Failed to restore user");
    },
  });

  const createUserMutation = useMutation({
    mutationFn: async (data: Partial<User>) => {
      const response = await apiClient.post("/users", data);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["users"] });
      toast.success("User created successfully");
      setShowCreateForm(false);
      setEditingUser(null);
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || "Failed to create user");
    },
  });

  const updateUserDataMutation = useMutation({
    mutationFn: async ({
      userId,
      data,
    }: {
      userId: string;
      data: Partial<User>;
    }) => {
      const response = await apiClient.put(`/users/${userId}`, data);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["users"] });
      toast.success("User updated successfully");
      setShowCreateForm(false);
      setEditingUser(null);
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || "Failed to update user");
    },
  });

  const handlePageChange = async (page: number) => {
    const response = await apiClient.get(
      `/users?page=${page}&limit=${pagination.limit}`,
    );
    const data = response.data as PaginatedResult<User>;
    setPagination({
      page: data.meta.page,
      limit: data.meta.limit,
      total: data.meta.total,
      totalPages: data.meta.totalPages,
    });
    queryClient.setQueryData(["users", page], data);
  };

  const handleEdit = (user: User) => {
    setEditingUser(user);
    setShowCreateForm(true);
  };

  const handleSuspend = (userId: string) => {
    if (confirm("Are you sure you want to suspend this user?")) {
      suspendMutation.mutate(userId);
    }
  };

  const handleBan = (userId: string) => {
    if (confirm("Are you sure you want to ban this user?")) {
      banMutation.mutate(userId);
    }
  };

  const handleRestore = (userId: string) => {
    restoreMutation.mutate(userId);
  };

  const handleSubmit = (data: any) => {
    if (editingUser) {
      updateUserDataMutation.mutate({ userId: editingUser.id, data });
    } else {
      createUserMutation.mutate(data);
    }
  };

  const handleCancel = () => {
    setShowCreateForm(false);
    setEditingUser(null);
  };

  const isMutating =
    suspendMutation.isPending ||
    banMutation.isPending ||
    restoreMutation.isPending ||
    createUserMutation.isPending ||
    updateUserDataMutation.isPending;

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-3xl font-bold text-(--color-gray-900)">Users</h1>
          <p className="text-secondary mt-1">
            Manage user accounts and permissions
          </p>
        </div>
        <button
          onClick={() => setShowCreateForm(true)}
          className="px-6 py-3 bg-primary text-white rounded-lg hover:bg-primary-hover font-medium transition-colors"
        >
          + Add User
        </button>
      </div>

      {showCreateForm ? (
        <UserForm
          user={editingUser || undefined}
          onSubmit={handleSubmit}
          onCancel={handleCancel}
          loading={isMutating}
        />
      ) : (
        <UserTable
          users={initialData?.data || []}
          loading={false}
          onEdit={handleEdit}
          onSuspend={handleSuspend}
          onBan={handleBan}
          onRestore={handleRestore}
          pagination={pagination}
          onPageChange={handlePageChange}
        />
      )}
    </div>
  );
}
