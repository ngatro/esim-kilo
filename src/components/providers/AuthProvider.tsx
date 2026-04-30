"use client";

import { createContext, useContext, useState, useEffect, ReactNode } from "react";
import { SessionProvider, useSession, signOut as nextAuthSignOut } from "next-auth/react";
import type { Session } from "next-auth";

// Extend NextAuth session type to include our custom user fields
declare module "next-auth" {
  interface Session {
    user: {
      id: number;
      name: string;
      email: string;
      role: string;
    };
  }
}

export interface User {
  id: number;
  name: string;
  email: string;
  role: string;
}

interface AuthContextType {
  user: User | null;
  loading: boolean;
  login: (email: string, password: string, rememberMe?: boolean) => Promise<boolean>;
  logout: () => Promise<void>;
  register: (name: string, email: string, password: string) => Promise<boolean>;
  refreshUser: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

function AuthProviderInner({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const { data: session, status } = useSession();

  // Sync NextAuth session -> custom user state immediately
  useEffect(() => {
    if (status === "authenticated" && session?.user) {
      // Session already contains user with role from server-side session callback
      setUser({
        id: session.user.id,
        name: session.user.name,
        email: session.user.email,
        role: session.user.role,
      });
      setLoading(false);
    } else if (status === "unauthenticated") {
      // Check old auth system (email/password) as fallback
      checkOldAuth();
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
      setLoading(false);
    }
  }

  async function login(email: string, password: string, rememberMe?: boolean): Promise<boolean> {
    const res = await fetch("/api/auth/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password, rememberMe }),
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

  async function refreshUser() {
    try {
      const res = await fetch("/api/auth/me");
      if (res.ok) {
        const data = await res.json();
        setUser(data.user);
      }
    } catch {
      console.error("Failed to refresh user");
    }
  }

  return (
    <AuthContext.Provider value={{ user, loading, login, logout, register, refreshUser }}>
      {children}
    </AuthContext.Provider>
  );
}

// Outer wrapper that provides both SessionProvider and AuthProvider
interface AuthProviderProps {
  children: ReactNode;
  session: Session | null;
}

export function AuthProvider({ children, session }: AuthProviderProps) {
  return (
    <SessionProvider session={session} refetchOnWindowFocus={false} refetchInterval={0}>
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