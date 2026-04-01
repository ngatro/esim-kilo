"use client";

import Link from "next/link";
import { useAuth } from "@/components/providers/AuthProvider";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

interface Plan {
  id: string;
  name: string;
  destination: string;
  dataAmount: number;
  durationDays: number;
  priceUsd: number;
  regionId: string | null;
  regionName: string | null;
  isActive: boolean;
  isPopular: boolean;
  isBestSeller: boolean;
  isHot: boolean;
  badge: string | null;
  priority: number;
}

function formatData(gb: number): string {
  if (gb >= 999) return "Unlimited";
  if (gb < 1) return `${Math.round(gb * 1024)}MB`;
  return `${gb}GB`;
}

export default function AdminPlansPage() {
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();
  const [plans, setPlans] = useState<Plan[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("");

  useEffect(() => {
    if (!authLoading && (!user || user.role !== "admin")) router.push("/");
  }, [user, authLoading, router]);

  useEffect(() => {
    if (user?.role === "admin") {
      fetch("/api/plans")
        .then((r) => r.json())
        .then((data) => setPlans(data.plans || []))
        .catch(console.error)
        .finally(() => setLoading(false));
    }
  }, [user]);

  async function toggleField(id: string, field: string, value: boolean) {
    await fetch("/api/admin/plans", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id, [field]: !value }),
    });
    setPlans(plans.map((p) => (p.id === id ? { ...p, [field]: !value } : p)));
  }

  if (authLoading || !user || user.role !== "admin") {
    return (
      <div className="min-h-screen bg-slate-900 flex items-center justify-center">
        <div className="animate-spin w-8 h-8 border-2 border-sky-500 border-t-transparent rounded-full" />
      </div>
    );
  }

  const filtered = plans.filter((p) =>
    !filter || p.destination.toLowerCase().includes(filter.toLowerCase()) || p.name.toLowerCase().includes(filter.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-slate-900 py-8 sm:py-12">
      <div className="max-w-7xl mx-auto px-3 sm:px-6">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold text-white">Manage Plans</h1>
            <p className="text-slate-400 text-sm mt-1">{plans.length} plans from eSIM Access</p>
          </div>
          <Link href="/admin" className="text-sky-400 hover:text-sky-300 text-sm">← Back to Dashboard</Link>
        </div>

        <div className="mb-4">
          <input
            type="text"
            value={filter}
            onChange={(e) => setFilter(e.target.value)}
            placeholder="Filter plans..."
            className="w-full sm:w-64 bg-slate-800 border border-slate-700 rounded-xl px-4 py-2.5 text-white text-sm placeholder:text-slate-500 focus:outline-none focus:border-sky-500"
          />
        </div>

        {loading ? (
          <div className="text-center py-20">
            <div className="animate-spin w-8 h-8 border-2 border-sky-500 border-t-transparent rounded-full mx-auto" />
          </div>
        ) : (
          <div className="bg-slate-800/50 border border-slate-700/50 rounded-2xl overflow-x-auto">
            <table className="min-w-full divide-y divide-slate-700">
              <thead className="bg-slate-900/50">
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-medium text-slate-400 uppercase">Plan</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-slate-400 uppercase">Region</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-slate-400 uppercase">Data</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-slate-400 uppercase">Price</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-slate-400 uppercase">Days</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-slate-400 uppercase">Labels</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-700/50">
                {filtered.slice(0, 100).map((plan) => (
                  <tr key={plan.id} className="hover:bg-slate-800/50">
                    <td className="px-4 py-3">
                      <p className="text-sm font-medium text-white truncate max-w-[200px]">{plan.destination}</p>
                      <p className="text-xs text-slate-500 truncate max-w-[200px]">{plan.name}</p>
                    </td>
                    <td className="px-4 py-3">
                      <span className="text-xs bg-sky-500/20 text-sky-400 px-2 py-0.5 rounded-full">{plan.regionName || "Global"}</span>
                    </td>
                    <td className="px-4 py-3 text-sm text-slate-300">{formatData(plan.dataAmount)}</td>
                    <td className="px-4 py-3 text-sm text-white font-semibold">${plan.priceUsd.toFixed(2)}</td>
                    <td className="px-4 py-3 text-sm text-slate-300">{plan.durationDays}</td>
                    <td className="px-4 py-3">
                      <div className="flex gap-1.5 flex-wrap">
                        <button
                          onClick={() => toggleField(plan.id, "isBestSeller", plan.isBestSeller)}
                          className={`text-[10px] px-2 py-1 rounded-full font-bold transition-colors ${
                            plan.isBestSeller ? "bg-amber-500 text-white" : "bg-slate-700 text-slate-400 hover:bg-slate-600"
                          }`}
                        >
                          BEST
                        </button>
                        <button
                          onClick={() => toggleField(plan.id, "isPopular", plan.isPopular)}
                          className={`text-[10px] px-2 py-1 rounded-full font-bold transition-colors ${
                            plan.isPopular ? "bg-sky-500 text-white" : "bg-slate-700 text-slate-400 hover:bg-slate-600"
                          }`}
                        >
                          POPULAR
                        </button>
                        <button
                          onClick={() => toggleField(plan.id, "isHot", plan.isHot)}
                          className={`text-[10px] px-2 py-1 rounded-full font-bold transition-colors ${
                            plan.isHot ? "bg-red-500 text-white" : "bg-slate-700 text-slate-400 hover:bg-slate-600"
                          }`}
                        >
                          HOT
                        </button>
                        <button
                          onClick={() => toggleField(plan.id, "isActive", plan.isActive)}
                          className={`text-[10px] px-2 py-1 rounded-full font-bold transition-colors ${
                            plan.isActive ? "bg-green-500 text-white" : "bg-slate-600 text-slate-400"
                          }`}
                        >
                          {plan.isActive ? "ON" : "OFF"}
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}