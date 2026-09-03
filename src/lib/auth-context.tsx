"use client";

import React, { createContext, useContext, useEffect, useState } from "react";
import { apiClient } from "./api-client";

export interface User {
  id: string;
  name: string;
  email: string;
  role: "STUDENT" | "ADMIN";
  avatar?: string | null;
  bio?: string | null;
}

interface AuthContextType {
  user: User | null;
  token: string | null;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<{ success: boolean; error?: string }>;
  register: (name: string, email: string, password: string) => Promise<{ success: boolean; error?: string }>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    try {
      const storedToken = localStorage.getItem("patterniq_access_token");
      const storedUser = localStorage.getItem("patterniq_user");
      if (storedToken && storedUser) {
        setToken(storedToken);
        setUser(JSON.parse(storedUser));
      }
    } catch (e) {
      console.error("Failed to load auth state", e);
    } finally {
      setIsLoading(false);
    }
  }, []);

  const login = async (email: string, password: string) => {
    const res = await apiClient<{ user: User; accessToken: string; refreshToken: string }>("/auth/login", {
      method: "POST",
      body: JSON.stringify({ email, password }),
    });

    if (res.success && res.data) {
      setUser(res.data.user);
      setToken(res.data.accessToken);
      localStorage.setItem("patterniq_access_token", res.data.accessToken);
      localStorage.setItem("patterniq_refresh_token", res.data.refreshToken);
      localStorage.setItem("patterniq_user", JSON.stringify(res.data.user));
      return { success: true };
    }

    return {
      success: false,
      error: res.error?.message || "Invalid email or password",
    };
  };

  const register = async (name: string, email: string, password: string) => {
    const res = await apiClient<{ user: User; accessToken: string; refreshToken: string }>("/auth/register", {
      method: "POST",
      body: JSON.stringify({ name, email, password }),
    });

    if (res.success && res.data) {
      setUser(res.data.user);
      setToken(res.data.accessToken);
      localStorage.setItem("patterniq_access_token", res.data.accessToken);
      localStorage.setItem("patterniq_refresh_token", res.data.refreshToken);
      localStorage.setItem("patterniq_user", JSON.stringify(res.data.user));
      return { success: true };
    }

    return {
      success: false,
      error: res.error?.message || "Failed to create account",
    };
  };

  const logout = async () => {
    const refreshToken = localStorage.getItem("patterniq_refresh_token");
    if (refreshToken) {
      await apiClient("/auth/logout", {
        method: "POST",
        body: JSON.stringify({ refreshToken }),
      }).catch(() => {});
    }
    setUser(null);
    setToken(null);
    localStorage.removeItem("patterniq_access_token");
    localStorage.removeItem("patterniq_refresh_token");
    localStorage.removeItem("patterniq_user");
  };

  return (
    <AuthContext.Provider value={{ user, token, isLoading, login, register, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
