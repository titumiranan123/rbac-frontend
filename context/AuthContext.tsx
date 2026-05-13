"use client";
import { createContext, useContext, useState, useEffect, ReactNode } from "react";
import { User } from "@/types";

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  login: (email: string, password: string) => Promise<void>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

function getToken(): string | null {
  if (typeof document === "undefined") return null;
  const match = document.cookie.match(/(?:^|;\s*)accessToken=([^;]*)/);
  return match ? decodeURIComponent(match[1]) : null;
}

function clearCookies() {
  document.cookie = "accessToken=; path=/; max-age=0";
  document.cookie = "refreshToken=; path=/; max-age=0";
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);

  useEffect(() => {
    const token = getToken();
    if (token) {
      try {
        const payload = JSON.parse(atob(token.split(".")[1]));
        if (payload.exp * 1000 > Date.now()) {
          setUser(payload as User);
        } else {
          clearCookies();
        }
      } catch {
        clearCookies();
      }
    }
  }, []);

  const login = async (email: string, password: string) => {
    const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/auth/login`, {
      method: "POST",
      credentials: "include",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password }),
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.message || "Login failed");
    
    document.cookie = `accessToken=${data.accessToken}; path=/; max-age=${60 * 15}; SameSite=Lax`;
    setUser({ ...data.user, grantedPermissions: data.user.grantedPermissions || [] });
    window.location.href = "/dashboard";
  };

  const logout = () => {
    fetch(`${process.env.NEXT_PUBLIC_API_URL}/auth/logout`, {
      method: "POST",
      credentials: "include",
    }).catch(() => {});
    clearCookies();
    window.location.href = "/login";
  };

  return (
    <AuthContext.Provider value={{ user, isAuthenticated: !!user, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) throw new Error("useAuth must be used within AuthProvider");
  return context;
}