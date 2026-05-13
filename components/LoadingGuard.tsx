"use client";
import { useAuth } from "@/context/AuthContext";
import { useEffect, useState } from "react";
import { usePermissions } from "@/context/PermissionContext";

function LoadingSkeleton() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="flex flex-col items-center gap-4">
        <div className="w-12 h-12 border-4 border-orange-500 border-t-transparent rounded-full animate-spin" />
        <p className="text-gray-500 text-sm">Loading...</p>
      </div>
    </div>
  );
}

export function LoadingGuard() {
  const { isLoading: authLoading } = useAuth();
  const { isLoading: permLoading } = usePermissions();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) return null;

  if (authLoading || permLoading) {
    return <LoadingSkeleton key="loading" />;
  }

  return null;
}