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

  // Check old auth system (email/password) on mount
  useEffect(() => {
    checkOldAuth();
  }, []);

  // Sync NextAuth session -> custom user state
  useEffect(() => {
    console.log("[AuthProvider] useEffect triggered", { status, session, user });
    if (status === "authenticated" && session?.user?.email) {
      console.log("[AuthProvider] NextAuth authenticated, session.user.email:", session.user.email);
      // If NextAuth is authenticated but custom user is null, fetch from DB
      if (!user) {
        console.log("[AuthProvider] Fetching user from DB");
        fetchUserFromNextAuth(session.user.email);
      } else {
        console.log("[AuthProvider] User already set:", user);
      }
    } else if (status === "unauthenticated" && !user) {
      console.log("[AuthProvider] Unauthenticated, setting loading to false");
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
      console.log("[AuthProvider] Fetching user from /api/auth/me?email=", email);
      const res = await fetch(`/api/auth/me?email=${encodeURIComponent(email)}`);
      console.log("[AuthProvider] Response status:", res.status);
      if (res.ok) {
        const data = await res.json();
        console.log("[AuthProvider] User data:", data.user);
        setUser(data.user);
      } else {
        console.log("[AuthProvider] Response not ok");
      }
    } catch (error) {
      console.error("Failed to fetch user from NextAuth session", error);
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