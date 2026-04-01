"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import Link from "next/link";
import { useAuth } from "@/components/providers/AuthProvider";
import { useRouter } from "next/navigation";

interface Stats {
  totalUsers: number;
  totalOrders: number;
  totalPlans: number;
  activePlans: number;
  totalRevenue: number;
  balance: number;
  currency: string;
}

interface RecentOrder {
  id: number;
  totalAmount: number;
  status: string;
  customerEmail: string | null;
  createdAt: string;
}

interface RegionStat {
  id: string;
  name: string;
  emoji: string;
  _count: { plans: number };
}

interface AdminData {
  stats: Stats;
  recentOrders: RecentOrder[];
  regions: RegionStat[];
}

export default function AdminDashboardPage() {
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();
  const [data, setData] = useState<AdminData | null>(null);
  const [loading, setLoading] = useState(true);
  const [syncing, setSyncing] = useState(false);
  const [syncResult, setSyncResult] = useState<string | null>(null);

  useEffect(() => {
    if (!authLoading && (!user || user.role !== "admin")) {
      router.push("/");
    }
  }, [user, authLoading, router]);

  useEffect(() => {
    if (user?.role === "admin") {
      fetchStats();
    }
  }, [user]);

  async function fetchStats() {
    try {
      const res = await fetch("/api/admin/stats");
      const result = await res.json();
      setData(result);
    } catch (error) {
      console.error("Failed to fetch stats:", error);
    } finally {
      setLoading(false);
    }
  }

  async function syncPlans() {
    setSyncing(true);
    setSyncResult("Fetching packages from eSIM Access...");
    try {
      const res = await fetch("/api/plans?sync=true");
      const data = await res.json();
      if (data.success) {
        setSyncResult(`Done! ${data.synced} plans synced, ${data.deleted} old plans deleted (${data.elapsed})`);
      } else {
        setSyncResult(`Error: ${data.error || "Unknown"}`);
      }
      await fetchStats();
    } catch (error) {
      console.error("Sync failed:", error);
      setSyncResult("Sync failed - check console");
    } finally {
      setSyncing(false);
    }
  }

  if (authLoading || (!user && !authLoading)) {
    return (
      <div className="min-h-screen bg-slate-900 flex items-center justify-center">
        <div className="animate-spin w-8 h-8 border-2 border-sky-500 border-t-transparent rounded-full" />
      </div>
    );
  }

  if (!user || user.role !== "admin") return null;

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-900 flex items-center justify-center">
        <div className="animate-spin w-8 h-8 border-2 border-sky-500 border-t-transparent rounded-full" />
      </div>
    );
  }

  const stats = data?.stats;

  return (
    <div className="min-h-screen bg-slate-900 text-white py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-white">Admin Dashboard</h1>
            <p className="text-slate-400 text-sm mt-1">Welcome back, {user.name}</p>
          </div>
          <div className="flex items-center gap-3">
            {syncResult && (
              <span className="text-xs text-slate-400 bg-slate-800 px-3 py-1.5 rounded-lg">{syncResult}</span>
            )}
            <button
              onClick={syncPlans}
              disabled={syncing}
              className="bg-emerald-500 hover:bg-emerald-400 disabled:bg-slate-600 text-white font-semibold px-5 py-2.5 rounded-xl text-sm transition-colors"
            >
              {syncing ? (
                <span className="flex items-center gap-2">
                  <div className="animate-spin w-4 h-4 border-2 border-white border-t-transparent rounded-full" />
                  Syncing...
                </span>
              ) : "🔄 Sync Plans"}
            </button>
          </div>
        </div>

        {stats && (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4 mb-8">
            {[
              { label: "Users", value: stats.totalUsers, icon: "👥", color: "from-blue-500/20 to-blue-600/10" },
              { label: "Orders", value: stats.totalOrders, icon: "📦", color: "from-green-500/20 to-green-600/10" },
              { label: "Plans", value: stats.activePlans, icon: "📱", color: "from-purple-500/20 to-purple-600/10" },
              { label: "Revenue", value: `$${(stats.totalRevenue || 0).toFixed(2)}`, icon: "💰", color: "from-amber-500/20 to-amber-600/10" },
              { label: "Balance", value: `$${(stats.balance || 0).toFixed(2)}`, icon: "🏦", color: "from-sky-500/20 to-sky-600/10" },
              { label: "Total Plans", value: stats.totalPlans, icon: "📋", color: "from-pink-500/20 to-pink-600/10" },
            ].map((stat) => (
              <motion.div
                key={stat.label}
                className={`bg-gradient-to-br ${stat.color} border border-slate-700/50 rounded-2xl p-5`}
                whileHover={{ scale: 1.02 }}
              >
                <p className="text-2xl mb-2">{stat.icon}</p>
                <p className="text-2xl font-bold text-white">{stat.value}</p>
                <p className="text-xs text-slate-400 uppercase tracking-wider">{stat.label}</p>
              </motion.div>
            ))}
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
          <Link href="/admin/plans">
            <motion.div className="bg-slate-800/50 border border-slate-700/50 rounded-2xl p-6 hover:border-sky-500/30 transition-colors cursor-pointer" whileHover={{ y: -3 }}>
              <div className="flex items-center gap-3 mb-3">
                <div className="w-10 h-10 bg-sky-500/20 rounded-xl flex items-center justify-center text-xl">📱</div>
                <h3 className="text-lg font-semibold text-white">Plans Management</h3>
              </div>
              <p className="text-slate-400 text-sm mb-3">Set Hot, Best Seller, Popular labels. Toggle active status.</p>
              <span className="text-sky-400 text-sm font-medium">Manage Plans →</span>
            </motion.div>
          </Link>

          <Link href="/admin/blog">
            <motion.div className="bg-slate-800/50 border border-slate-700/50 rounded-2xl p-6 hover:border-sky-500/30 transition-colors cursor-pointer" whileHover={{ y: -3 }}>
              <div className="flex items-center gap-3 mb-3">
                <div className="w-10 h-10 bg-purple-500/20 rounded-xl flex items-center justify-center text-xl">📝</div>
                <h3 className="text-lg font-semibold text-white">Blog Management</h3>
              </div>
              <p className="text-slate-400 text-sm mb-3">Create and manage blog posts, travel tips, eSIM guides.</p>
              <span className="text-sky-400 text-sm font-medium">Manage Blog →</span>
            </motion.div>
          </Link>

          <Link href="/admin/orders">
            <motion.div className="bg-slate-800/50 border border-slate-700/50 rounded-2xl p-6 hover:border-sky-500/30 transition-colors cursor-pointer" whileHover={{ y: -3 }}>
              <div className="flex items-center gap-3 mb-3">
                <div className="w-10 h-10 bg-green-500/20 rounded-xl flex items-center justify-center text-xl">📦</div>
                <h3 className="text-lg font-semibold text-white">Orders</h3>
              </div>
              <p className="text-slate-400 text-sm mb-3">View all customer orders, track eSIM delivery status.</p>
              <span className="text-sky-400 text-sm font-medium">View Orders →</span>
            </motion.div>
          </Link>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="bg-slate-800/50 border border-slate-700/50 rounded-2xl p-6">
            <h2 className="text-lg font-semibold text-white mb-4">Recent Orders</h2>
            {data?.recentOrders && data.recentOrders.length > 0 ? (
              <div className="space-y-3">
                {data.recentOrders.slice(0, 8).map((order) => (
                  <div key={order.id} className="flex items-center justify-between py-2 border-b border-slate-700/30 last:border-0">
                    <div>
                      <p className="text-white text-sm font-medium">#{order.id}</p>
                      <p className="text-slate-500 text-xs">{order.customerEmail || "Guest"}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-white text-sm font-semibold">${(order.totalAmount || 0).toFixed(2)}</p>
                      <span className={`text-xs ${order.status === "completed" ? "text-green-400" : "text-yellow-400"}`}>
                        {order.status}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-slate-500 text-sm">No orders yet</p>
            )}
          </div>

          <div className="bg-slate-800/50 border border-slate-700/50 rounded-2xl p-6">
            <h2 className="text-lg font-semibold text-white mb-4">Plans by Region</h2>
            {data?.regions && data.regions.length > 0 ? (
              <div className="space-y-3">
                {data.regions.map((region) => (
                  <div key={region.id} className="flex items-center justify-between py-2 border-b border-slate-700/30 last:border-0">
                    <div className="flex items-center gap-3">
                      <span className="text-xl">{region.emoji}</span>
                      <span className="text-white text-sm">{region.name}</span>
                    </div>
                    <span className="bg-sky-500/20 text-sky-400 text-xs font-medium px-2.5 py-1 rounded-full">
                      {region._count.plans} plans
                    </span>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-slate-500 text-sm">No data. Click Sync Plans to import from eSIM Access.</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}