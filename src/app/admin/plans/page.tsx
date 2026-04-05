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
  retailPriceUsd: number;
  regionName: string | null;
  isActive: boolean;
  isPopular: boolean;
  isBestSeller: boolean;
  isHot: boolean;
  badge: string | null;
}

function formatData(gb: number): string {
  if (gb >= 999) return "∞";
  if (gb < 1) return `${Math.round(gb * 1024)}MB`;
  return `${gb}GB`;
}

export default function AdminPlansPage() {
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();
  const [plans, setPlans] = useState<Plan[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("");
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editPrice, setEditPrice] = useState("");
  const [editRetail, setEditRetail] = useState("");
  const [saving, setSaving] = useState(false);

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

  function startEdit(plan: Plan) {
    setEditingId(plan.id);
    setEditPrice(plan.priceUsd.toString());
    setEditRetail(plan.retailPriceUsd.toString());
  }

  async function savePrice(id: string) {
    setSaving(true);
    const priceUsd = parseFloat(editPrice) || 0;
    const retailPriceUsd = parseFloat(editRetail) || 0;
    await fetch("/api/admin/plans", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        id,
        priceUsd,
        priceRaw: Math.round(priceUsd * 10000),
        retailPriceUsd,
        retailPriceRaw: Math.round(retailPriceUsd * 10000),
      }),
    });
    setPlans(plans.map((p) => (p.id === id ? { ...p, priceUsd, retailPriceUsd } : p)));
    setEditingId(null);
    setSaving(false);
  }

  if (authLoading || !user || user.role !== "admin") {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="animate-spin w-8 h-8 border-3 border-orange-500 border-t-transparent rounded-full" />
      </div>
    );
  }

  const filtered = plans.filter((p) =>
    !filter || p.destination.toLowerCase().includes(filter.toLowerCase()) || p.name.toLowerCase().includes(filter.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Top Bar */}
      <div className="bg-white border-b border-slate-200 px-6 py-4">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Link href="/admin" className="text-xl font-bold text-slate-800">Plans Management</Link>
            <span className="text-slate-400">|</span>
            <span className="text-sm text-slate-500">{plans.length} plans</span>
          </div>
          <Link href="/admin" className="text-orange-500 hover:text-orange-600 text-sm font-medium">← Back to Dashboard</Link>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 py-6">
        {/* Search */}
        <div className="mb-6">
          <input 
            type="text" 
            value={filter} 
            onChange={(e) => setFilter(e.target.value)} 
            placeholder="Search plans..." 
            className="w-full sm:w-80 bg-white border border-slate-200 rounded-xl px-4 py-2.5 text-slate-800 text-sm placeholder:text-slate-400 focus:outline-none focus:border-orange-400" 
          />
        </div>

        {loading ? (
          <div className="text-center py-20"><div className="animate-spin w-8 h-8 border-3 border-orange-500 border-t-transparent rounded-full mx-auto" /></div>
        ) : (
          <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="min-w-full">
                <thead className="bg-slate-50">
                  <tr>
                    <th className="px-4 py-3 text-left text-xs font-medium text-slate-500 uppercase">Plan</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-slate-500 uppercase">Region</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-slate-500 uppercase">Data</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-slate-500 uppercase">Days</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-slate-500 uppercase">Cost</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-slate-500 uppercase">Price</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-slate-500 uppercase">Labels</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-slate-500 uppercase">Active</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {filtered.slice(0, 100).map((plan) => (
                    <tr key={plan.id} className="hover:bg-slate-50">
                      <td className="px-4 py-3">
                        <p className="text-sm font-medium text-slate-800">{plan.destination}</p>
                        <p className="text-xs text-slate-500 truncate max-w-[200px]">{plan.name}</p>
                      </td>
                      <td className="px-4 py-3">
                        <span className="text-xs bg-slate-100 text-slate-600 px-2 py-1 rounded-full">{plan.regionName || "Global"}</span>
                      </td>
                      <td className="px-4 py-3 text-sm text-slate-600">{formatData(plan.dataAmount)}</td>
                      <td className="px-4 py-3 text-sm text-slate-600">{plan.durationDays}</td>
                      <td className="px-4 py-3">
                        <span className="text-sm text-slate-400">${plan.priceUsd.toFixed(2)}</span>
                      </td>
                      <td className="px-4 py-3">
                        {editingId === plan.id ? (
                          <div className="flex items-center gap-2">
                            <input 
                              type="number" 
                              value={editRetail} 
                              onChange={(e) => setEditRetail(e.target.value)} 
                              className="bg-white border border-slate-300 rounded px-2 py-1 text-slate-800 text-sm w-20" 
                              step="0.01" 
                            />
                            <button onClick={() => savePrice(plan.id)} disabled={saving} className="bg-green-500 hover:bg-green-600 text-white text-xs px-2 py-1 rounded">✓</button>
                            <button onClick={() => setEditingId(null)} className="bg-slate-200 hover:bg-slate-300 text-slate-600 text-xs px-2 py-1 rounded">✕</button>
                          </div>
                        ) : (
                          <div className="flex items-center gap-2">
                            <span className="text-sm font-semibold text-slate-800">${plan.retailPriceUsd.toFixed(2)}</span>
                            <button onClick={() => startEdit(plan)} className="text-orange-500 hover:text-orange-600 text-xs">Edit</button>
                          </div>
                        )}
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex gap-1">
                          {plan.isBestSeller && <span className="text-[10px] bg-amber-100 text-amber-700 px-2 py-0.5 rounded-full">★ Best</span>}
                          {plan.isHot && <span className="text-[10px] bg-red-100 text-red-700 px-2 py-0.5 rounded-full">🔥 Hot</span>}
                          {plan.isPopular && <span className="text-[10px] bg-cyan-100 text-cyan-700 px-2 py-0.5 rounded-full">Popular</span>}
                          {plan.badge === "unlimited" && <span className="text-[10px] bg-green-100 text-green-700 px-2 py-0.5 rounded-full">∞ Unlimited</span>}
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        <button onClick={() => toggleField(plan.id, "isActive", plan.isActive)} className={`w-10 h-5 rounded-full transition-colors ${plan.isActive ? "bg-green-500" : "bg-slate-300"}`}>
                          <span className={`block w-4 h-4 bg-white rounded-full transition-transform ${plan.isActive ? "translate-x-5" : "translate-x-0.5"}`} />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            {filtered.length > 100 && (
              <div className="px-4 py-3 border-t border-slate-100 text-sm text-slate-500 text-center">
                Showing 100 of {filtered.length} plans
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}