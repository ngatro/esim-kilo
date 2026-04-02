"use client";

import { createContext, useContext, useState, useEffect, ReactNode } from "react";
import { SessionProvider, useSession, signOut as nextAuthSignOut } from "next-auth/react";

interface User {
  id: number;
  name: string;
  email: string;
  role: string;
}

interface AuthContextType {
  user: User | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<boolean>;
  logout: () => Promise<void>;
  register: (name: string, email: string, password: string) => Promise<boolean>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

function AuthProviderInner({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const { data: session, status } = useSession();

  // Check old auth system (email/password) on mount
  useEffect(() => {
    checkOldAuth();
  }, []);

  // Sync NextAuth session -> custom user state
  useEffect(() => {
    if (status === "authenticated" && session?.user?.email) {
      // If NextAuth is authenticated but custom user is null, fetch from DB
      if (!user) {
        fetchUserFromNextAuth(session.user.email);
      }
    } else if (status === "unauthenticated" && !user) {
      setLoading(false);
    }
  }, [status, session]);

  async function checkOldAuth() {
    try {
      const res = await fetch("/api/auth/me");
      if (res.ok) {
        const data = await res.json();
        setUser(data.user);
      }
    } catch {
      // Ignore - user might be using NextAuth
    } finally {
      // Only set loading false if NextAuth is also done
      if (status !== "loading") {
        setLoading(false);
      }
    }
  }

  async function fetchUserFromNextAuth(email: string) {
    try {
      const res = await fetch(`/api/auth/me?email=${encodeURIComponent(email)}`);
      if (res.ok) {
        const data = await res.json();
        setUser(data.user);
      }
    } catch {
      console.error("Failed to fetch user from NextAuth session");
    } finally {
      setLoading(false);
    }
  }

  // Update loading state when NextAuth status changes
  useEffect(() => {
    if (status !== "loading" && !user) {
      setLoading(false);
    }
  }, [status]);

  async function login(email: string, password: string): Promise<boolean> {
    const res = await fetch("/api/auth/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password }),
    });

    if (res.ok) {
      const data = await res.json();
      setUser(data.user);
      return true;
    }
    return false;
  }

  async function logout() {
    // Logout from BOTH systems
    await Promise.all([
      fetch("/api/auth/logout", { method: "POST" }).catch(() => {}),
      nextAuthSignOut({ redirect: false }).catch(() => {}),
    ]);
    setUser(null);
  }

  async function register(name: string, email: string, password: string): Promise<boolean> {
    const res = await fetch("/api/auth/register", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name, email, password }),
    });

    if (res.ok) {
      const data = await res.json();
      setUser(data.user);
      return true;
    }
    return false;
  }

  return (
    <AuthContext.Provider value={{ user, loading, login, logout, register }}>
      {children}
    </AuthContext.Provider>
  );
}

// Outer wrapper that provides both SessionProvider and AuthProvider
export function AuthProvider({ children }: { children: ReactNode }) {
  return (
    <SessionProvider>
      <AuthProviderInner>{children}</AuthProviderInner>
    </SessionProvider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within AuthProvider");
  }
  return context;
}