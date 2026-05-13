"use client";
import { createContext, useContext, useState, useCallback, ReactNode } from "react";
import { setAccessToken } from "@/lib/api-client";
import { User } from "@/types";

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (email: string, password: string, firstName: string, lastName: string, role?: string) => Promise<void>;
  logout: () => Promise<void>;
  refreshUser: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUserState] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const saveAccessTokenToCookie = (token: string) => {
    document.cookie = `accessToken=${token}; path=/; SameSite=Lax`;
  };

  const clearAccessTokenCookie = () => {
    document.cookie = "accessToken=; path=/; max-age=0";
  };

  const login = async (email: string, password: string) => {
    setIsLoading(true);
    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/auth/login`, {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.message || "Login failed");

      setAccessToken(data.accessToken);
      saveAccessTokenToCookie(data.accessToken);
      setUserState({ ...data.user, grantedPermissions: data.user.grantedPermissions || [] });
    } finally {
      setIsLoading(false);
    }
  };

  const register = async (email: string, password: string, firstName: string, lastName: string, role?: string) => {
    setIsLoading(true);
    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/auth/register`, {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password, firstName, lastName, role }),
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.message || "Registration failed");

      setAccessToken(data.accessToken);
      saveAccessTokenToCookie(data.accessToken);
      setUserState({ ...data.user, grantedPermissions: data.user.grantedPermissions || [] });
    } finally {
      setIsLoading(false);
    }
  };

  const logout = async () => {
    try {
      await fetch(`${process.env.NEXT_PUBLIC_API_URL}/auth/logout`, {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
      });
    } finally {
      setAccessToken(null);
      clearAccessTokenCookie();
      setUserState(null);
    }
  };

  const refreshUser = useCallback(async () => {
    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/auth/me`, {
        credentials: "include",
        headers: { "Content-Type": "application/json" },
      });
      if (response.ok) {
        const userData = await response.json();
        setUserState(userData);
      }
    } catch {
      // Ignore
    }
  }, []);

  return (
    <AuthContext.Provider value={{ user, isAuthenticated: !!user, isLoading, login, register, logout, refreshUser }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) throw new Error("useAuth must be used within AuthProvider");
  return context;
}