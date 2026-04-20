"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import Link from "next/link";
import { useAuth } from "@/components/providers/AuthProvider";

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
  orderItems?: { planName: string }[];
}

interface RegionStat {
  id: string;
  name: string;
  emoji: string;
  planCount: number;
}

interface AdminData {
  stats: Stats;
  recentOrders: RecentOrder[];
  regions: RegionStat[];
}

function formatDate(dateStr: string) {
  const d = new Date(dateStr);
  return d.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
}

export default function AdminDashboardPage() {
  const { user, loading: authLoading } = useAuth();
  const [data, setData] = useState<AdminData | null>(null);
  const [loading, setLoading] = useState(true);
  const [syncingPlans, setSyncingPlans] = useState(false);
  const [syncingTopup, setSyncingTopup] = useState(false);
  const [syncResult, setSyncResult] = useState<string | null>(null);

  useEffect(() => {
    if (!authLoading && user?.role === "admin") {
      fetchStats();
    }
  }, [user, authLoading]);

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
    setSyncingPlans(true);
    setSyncResult("");
    try {
      await fetch("/api/plans?sync=true");
      setSyncResult("🔄 Syncing plans... (check terminal)");
      // Keep button disabled - user can refresh page to reset
    } catch (error) {
      console.error("Sync failed:", error);
      setSyncResult("✗ Sync failed");
      setSyncingPlans(false);
    }
  }

  async function syncTopup() {
    setSyncingTopup(true);
    setSyncResult("");
    try {
      await fetch("/api/plans", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ type: "topup" })
      });
      setSyncResult("📦 Syncing topup... (check terminal)");
      // Keep button disabled - user can refresh page to reset
    } catch (error) {
      console.error("Topup sync failed:", error);
      setSyncResult("✗ Topup sync failed");
      setSyncingTopup(false);
    }
  }

  if (authLoading || loading) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="animate-spin w-8 h-8 border-3 border-orange-500 border-t-transparent rounded-full" />
      </div>
    );
  }

  if (!user || user.role !== "admin") {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="text-center">
          <p className="text-slate-600 text-lg">Access denied</p>
          <Link href="/" className="text-orange-500 hover:underline mt-2 inline-block">Go to Home</Link>
        </div>
      </div>
    );
  }

  const stats = data?.stats;

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Top Bar */}
      <div className="bg-white border-b border-slate-200 px-6 py-4">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Link href="/admin" className="text-xl font-bold text-slate-800">Admin Dashboard</Link>
            <span className="text-slate-400">|</span>
            <span className="text-sm text-slate-500">Welcome, {user.name}</span>
          </div>
          <div className="flex items-center gap-3">
            <button
              onClick={syncPlans}
              disabled={syncingPlans || syncingTopup}
              className="bg-orange-500 hover:bg-orange-600 disabled:bg-slate-300 text-white font-medium px-4 py-2 rounded-lg text-sm transition-colors flex items-center gap-2"
            >
              {syncingPlans ? (
                <>
                  <span className="animate-spin">↻</span>
                  Syncing Plans...
                </>
              ) : (
                <>
                  <span>🔄</span>
                  Sync Plans
                </>
              )}
            </button>
            <button
              onClick={syncTopup}
              disabled={syncingPlans || syncingTopup}
              className="bg-green-500 hover:bg-green-600 disabled:bg-slate-300 text-white font-medium px-4 py-2 rounded-lg text-sm transition-colors flex items-center gap-2"
            >
              {syncingTopup ? (
                <>
                  <span className="animate-spin">↻</span>
                  Syncing Topup...
                </>
              ) : (
                <>
                  <span>📦</span>
                  Sync Topup
                </>
              )}
            </button>
            <Link href="/" className="text-slate-500 hover:text-slate-700 text-sm">View Site</Link>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 py-8">
        {/* Sync Result */}
        {syncResult && (
          <div className="mb-6 p-3 bg-slate-100 rounded-lg text-sm text-slate-600">
            {syncResult}
          </div>
        )}

        {/* Stats Grid */}
        {stats && (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4 mb-8">
            {[
              { label: "Users", value: stats.totalUsers, icon: "👥", bg: "bg-blue-50" },
              { label: "Orders", value: stats.totalOrders, icon: "📦", bg: "bg-green-50" },
              { label: "Active Plans", value: stats.activePlans, icon: "📱", bg: "bg-purple-50" },
              { label: "Revenue", value: `$${(stats.totalRevenue || 0).toFixed(0)}`, icon: "💰", bg: "bg-amber-50" },
              { label: "Balance", value: `$${((stats.balance || 0) / 10000).toFixed(2)}`, icon: "🏦", bg: "bg-sky-50" },
              { label: "Total Plans", value: stats.totalPlans, icon: "📋", bg: "bg-pink-50" },
            ].map((stat) => (
              <div key={stat.label} className={`${stat.bg} rounded-xl p-4 border border-slate-200`}>
                <p className="text-2xl mb-1">{stat.icon}</p>
                <p className="text-xl font-bold text-slate-800">{stat.value}</p>
                <p className="text-xs text-slate-500">{stat.label}</p>
              </div>
            ))}
          </div>
        )}

        {/* Quick Actions */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
          <Link href="/admin/plans">
            <div className="bg-white rounded-xl p-5 border border-slate-200 hover:border-orange-300 hover:shadow-md transition-all cursor-pointer">
              <div className="flex items-center gap-3 mb-2">
                <div className="w-10 h-10 bg-orange-100 rounded-lg flex items-center justify-center text-lg">📱</div>
                <h3 className="font-semibold text-slate-800">Plans</h3>
              </div>
              <p className="text-sm text-slate-500">Manage eSIM plans & pricing</p>
            </div>
          </Link>

          <Link href="/admin/orders">
            <div className="bg-white rounded-xl p-5 border border-slate-200 hover:border-orange-300 hover:shadow-md transition-all cursor-pointer">
              <div className="flex items-center gap-3 mb-2">
                <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center text-lg">📦</div>
                <h3 className="font-semibold text-slate-800">Orders</h3>
              </div>
              <p className="text-sm text-slate-500">View & manage customer orders</p>
            </div>
          </Link>

          <Link href="/admin/blog">
            <div className="bg-white rounded-xl p-5 border border-slate-200 hover:border-orange-300 hover:shadow-md transition-all cursor-pointer">
              <div className="flex items-center gap-3 mb-2">
                <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center text-lg">📝</div>
                <h3 className="font-semibold text-slate-800">Blog</h3>
              </div>
              <p className="text-sm text-slate-500">Manage blog posts & guides</p>
            </div>
          </Link>

          <Link href="/admin/users">
            <div className="bg-white rounded-xl p-5 border border-slate-200 hover:border-orange-300 hover:shadow-md transition-all cursor-pointer">
              <div className="flex items-center gap-3 mb-2">
                <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center text-lg">👥</div>
                <h3 className="font-semibold text-slate-800">Users</h3>
              </div>
              <p className="text-sm text-slate-500">Manage registered users</p>
            </div>
          </Link>

          <Link href="/admin/affiliate">
            <div className="bg-white rounded-xl p-5 border border-slate-200 hover:border-orange-300 hover:shadow-md transition-all cursor-pointer">
              <div className="flex items-center gap-3 mb-2">
                <div className="w-10 h-10 bg-yellow-100 rounded-lg flex items-center justify-center text-lg">💰</div>
                <h3 className="font-semibold text-slate-800">Affiliate</h3>
              </div>
              <p className="text-sm text-slate-500">Manage commissions & withdrawals</p>
            </div>
          </Link>

          <Link href="/admin/settings">
            <div className="bg-white rounded-xl p-5 border border-slate-200 hover:border-orange-300 hover:shadow-md transition-all cursor-pointer">
              <div className="flex items-center gap-3 mb-2">
                <div className="w-10 h-10 bg-slate-100 rounded-lg flex items-center justify-center text-lg">⚙️</div>
                <h3 className="font-semibold text-slate-800">Settings</h3>
              </div>
              <p className="text-sm text-slate-500">Site settings & configuration</p>
            </div>
          </Link>

          <Link href="/admin/destinations">
            <div className="bg-white rounded-xl p-5 border border-slate-200 hover:border-orange-300 hover:shadow-md transition-all cursor-pointer">
              <div className="flex items-center gap-3 mb-2">
                <div className="w-10 h-10 bg-slate-100 rounded-lg flex items-center justify-center text-lg">🌍</div>
                <h3 className="font-semibold text-slate-800">Destinations</h3>
              </div>
              <p className="text-sm text-slate-500">Manage top destinations</p>
            </div>
          </Link>

          <Link href="/admin/promotions">
            <div className="bg-white rounded-xl p-5 border border-slate-200 hover:border-orange-300 hover:shadow-md transition-all cursor-pointer">
              <div className="flex items-center gap-3 mb-2">
                <div className="w-10 h-10 bg-slate-100 rounded-lg flex items-center justify-center text-lg">🎉</div>
                <h3 className="font-semibold text-slate-800">Promotions</h3>
              </div>
              <p className="text-sm text-slate-500">Manage promotional popups</p>
            </div>
          </Link>
        </div>

        {/* Recent Orders */}
        <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
          <div className="px-5 py-4 border-b border-slate-100">
            <h2 className="font-semibold text-slate-800">Recent Orders</h2>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-slate-50">
                <tr>
                  <th className="px-5 py-3 text-left text-xs font-medium text-slate-500 uppercase">Order ID</th>
                  <th className="px-5 py-3 text-left text-xs font-medium text-slate-500 uppercase">Customer</th>
                  <th className="px-5 py-3 text-left text-xs font-medium text-slate-500 uppercase">Amount</th>
                  <th className="px-5 py-3 text-left text-xs font-medium text-slate-500 uppercase">Status</th>
                  <th className="px-5 py-3 text-left text-xs font-medium text-slate-500 uppercase">Date</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {data?.recentOrders?.slice(0, 5).map((order) => (
                  <tr key={order.id} className="hover:bg-slate-50">
                    <td className="px-5 py-3 text-sm text-slate-800 font-medium">#{10000 + order.id}</td>
                    <td className="px-5 py-3 text-sm text-slate-600">{order.customerEmail || "N/A"}</td>
                    <td className="px-5 py-3 text-sm text-slate-800 font-medium">${order.totalAmount.toFixed(2)}</td>
                    <td className="px-5 py-3">
                      <span className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${
                        order.status === "completed" ? "bg-green-100 text-green-700" :
                        order.status === "pending" ? "bg-amber-100 text-amber-700" :
                        "bg-slate-100 text-slate-600"
                      }`}>
                        {order.status}
                      </span>
                    </td>
                    <td className="px-5 py-3 text-sm text-slate-500">{formatDate(order.createdAt)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}