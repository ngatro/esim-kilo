"use client";

import Link from "next/link";
import { useAuth } from "@/components/providers/AuthProvider";
import { useRouter } from "next/navigation";
import { useEffect } from "react";

export default function AdminDashboardPage() {
  const { user, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading && (!user || user.role !== "admin")) {
      router.push("/");
    }
  }, [user, loading, router]);

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-900 flex items-center justify-center">
        <p className="text-white">Loading...</p>
      </div>
    );
  }

  if (!user || user.role !== "admin") {
    return null;
  }

  return (
    <div className="min-h-screen bg-slate-900 py-12">
      <div className="max-w-6xl mx-auto px-4">
        <h1 className="text-3xl font-bold text-white mb-8">Admin Dashboard</h1>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <div className="bg-slate-800 rounded-lg shadow-sm p-6">
            <h3 className="text-lg font-semibold text-white mb-2">Blog Management</h3>
            <p className="text-slate-400 text-sm mb-4">Create and manage blog posts</p>
            <Link href="/admin/blog" className="text-sky-400 hover:text-sky-300">
              Manage Blog →
            </Link>
          </div>
          
          <div className="bg-slate-800 rounded-lg shadow-sm p-6">
            <h3 className="text-lg font-semibold text-white mb-2">Plans Management</h3>
            <p className="text-slate-400 text-sm mb-4">Manage eSIM data plans</p>
            <Link href="/admin/plans" className="text-sky-400 hover:text-sky-300">
              Manage Plans →
            </Link>
          </div>
          
          <div className="bg-slate-800 rounded-lg shadow-sm p-6">
            <h3 className="text-lg font-semibold text-white mb-2">Orders</h3>
            <p className="text-slate-400 text-sm mb-4">View all customer orders</p>
            <Link href="/admin/orders" className="text-sky-400 hover:text-sky-300">
              View Orders →
            </Link>
          </div>
          
          <div className="bg-slate-800 rounded-lg shadow-sm p-6">
            <h3 className="text-lg font-semibold text-white mb-2">Users</h3>
            <p className="text-slate-400 text-sm mb-4">Manage user accounts</p>
            <Link href="/admin/users" className="text-sky-400 hover:text-sky-300">
              Manage Users →
            </Link>
          </div>
          
          <div className="bg-slate-800 rounded-lg shadow-sm p-6">
            <h3 className="text-lg font-semibold text-white mb-2">Analytics</h3>
            <p className="text-slate-400 text-sm mb-4">View sales analytics</p>
            <Link href="/admin/analytics" className="text-sky-400 hover:text-sky-300">
              View Analytics →
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
