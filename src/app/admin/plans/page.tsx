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
  priceRaw: number;
  retailPriceUsd: number;
  retailPriceRaw: number;
  currencyCode: string;
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
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editPrice, setEditPrice] = useState("");
  const [editRetail, setEditRetail] = useState("");
  const [saving, setSaving] = useState(false);
  const [currency, setCurrency] = useState("USD");
  const [exchangeRate, setExchangeRate] = useState("1");

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

        {/* Currency Settings */}
        <div className="bg-slate-800/50 border border-slate-700/50 rounded-2xl p-4 mb-6">
          <h2 className="text-white font-semibold text-sm mb-3">Currency Settings</h2>
          <div className="flex flex-wrap gap-4 items-end">
            <div>
              <label className="block text-xs text-slate-500 mb-1">Currency</label>
              <select value={currency} onChange={(e) => setCurrency(e.target.value)} className="bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-white text-sm">
                <option value="USD">USD ($)</option>
                <option value="EUR">EUR (€)</option>
                <option value="GBP">GBP (£)</option>
                <option value="VND">VND (₫)</option>
                <option value="JPY">JPY (¥)</option>
                <option value="CNY">CNY (¥)</option>
              </select>
            </div>
            <div>
              <label className="block text-xs text-slate-500 mb-1">Exchange Rate (1 USD = ?)</label>
              <input type="number" value={exchangeRate} onChange={(e) => setExchangeRate(e.target.value)} className="bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-white text-sm w-32" />
            </div>
            <button className="bg-sky-500 hover:bg-sky-400 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors">Apply</button>
          </div>
        </div>

        <div className="mb-4">
          <input type="text" value={filter} onChange={(e) => setFilter(e.target.value)} placeholder="Filter plans..." className="w-full sm:w-64 bg-slate-800 border border-slate-700 rounded-xl px-4 py-2.5 text-white text-sm placeholder:text-slate-500 focus:outline-none focus:border-sky-500" />
        </div>

        {loading ? (
          <div className="text-center py-20"><div className="animate-spin w-8 h-8 border-2 border-sky-500 border-t-transparent rounded-full mx-auto" /></div>
        ) : (
          <div className="bg-slate-800/50 border border-slate-700/50 rounded-2xl overflow-x-auto">
            <table className="min-w-full divide-y divide-slate-700">
              <thead className="bg-slate-900/50">
                <tr>
                  <th className="px-3 py-3 text-left text-xs font-medium text-slate-400 uppercase">Plan</th>
                  <th className="px-3 py-3 text-left text-xs font-medium text-slate-400 uppercase">Region</th>
                  <th className="px-3 py-3 text-left text-xs font-medium text-slate-400 uppercase">Data</th>
                  <th className="px-3 py-3 text-left text-xs font-medium text-slate-400 uppercase">Days</th>
                  <th className="px-3 py-3 text-left text-xs font-medium text-slate-400 uppercase">Cost Price</th>
                  <th className="px-3 py-3 text-left text-xs font-medium text-slate-400 uppercase">Retail Price</th>
                  <th className="px-3 py-3 text-left text-xs font-medium text-slate-400 uppercase">Labels</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-700/50">
                {filtered.slice(0, 200).map((plan) => (
                  <tr key={plan.id} className="hover:bg-slate-800/50">
                    <td className="px-3 py-3">
                      <p className="text-sm font-medium text-white truncate max-w-[180px]">{plan.destination}</p>
                      <p className="text-xs text-slate-500 truncate max-w-[180px]">{plan.name}</p>
                    </td>
                    <td className="px-3 py-3">
                      <span className="text-xs bg-sky-500/20 text-sky-400 px-2 py-0.5 rounded-full">{plan.regionName || "Global"}</span>
                    </td>
                    <td className="px-3 py-3 text-sm text-slate-300">{formatData(plan.dataAmount)}</td>
                    <td className="px-3 py-3 text-sm text-slate-300">{plan.durationDays}</td>
                    <td className="px-3 py-3">
                      {editingId === plan.id ? (
                        <input type="number" value={editPrice} onChange={(e) => setEditPrice(e.target.value)} className="bg-slate-900 border border-slate-600 rounded px-2 py-1 text-white text-sm w-20" step="0.01" />
                      ) : (
                        <span className="text-sm text-slate-400">${plan.priceUsd.toFixed(2)}</span>
                      )}
                    </td>
                    <td className="px-3 py-3">
                      {editingId === plan.id ? (
                        <div className="flex items-center gap-2">
                          <input type="number" value={editRetail} onChange={(e) => setEditRetail(e.target.value)} className="bg-slate-900 border border-sky-500 rounded px-2 py-1 text-white text-sm w-20" step="0.01" />
                          <button onClick={() => savePrice(plan.id)} disabled={saving} className="bg-green-500 hover:bg-green-400 text-white text-xs px-2 py-1 rounded font-bold">
                            {saving ? "..." : "✓"}
                          </button>
                          <button onClick={() => setEditingId(null)} className="bg-slate-600 hover:bg-slate-500 text-white text-xs px-2 py-1 rounded">✕</button>
                        </div>
                      ) : (
                        <div className="flex items-center gap-2">
                          <span className="text-sm text-white font-semibold">${plan.retailPriceUsd.toFixed(2)}</span>
                          <button onClick={() => startEdit(plan)} className="text-sky-400 hover:text-sky-300 text-xs">Edit</button>
                        </div>
                      )}
                    </td>
                    <td className="px-3 py-3">
                      <div className="flex gap-1 flex-wrap">
                        <button onClick={() => toggleField(plan.id, "isBestSeller", plan.isBestSeller)} className={`text-[10px] px-2 py-0.5 rounded-full font-bold ${plan.isBestSeller ? "bg-amber-500 text-white" : "bg-slate-700 text-slate-400"}`}>BEST</button>
                        <button onClick={() => toggleField(plan.id, "isPopular", plan.isPopular)} className={`text-[10px] px-2 py-0.5 rounded-full font-bold ${plan.isPopular ? "bg-sky-500 text-white" : "bg-slate-700 text-slate-400"}`}>POP</button>
                        <button onClick={() => toggleField(plan.id, "isHot", plan.isHot)} className={`text-[10px] px-2 py-0.5 rounded-full font-bold ${plan.isHot ? "bg-red-500 text-white" : "bg-slate-700 text-slate-400"}`}>HOT</button>
                        <button onClick={() => toggleField(plan.id, "isActive", plan.isActive)} className={`text-[10px] px-2 py-0.5 rounded-full font-bold ${plan.isActive ? "bg-green-500 text-white" : "bg-slate-600 text-slate-400"}`}>{plan.isActive ? "ON" : "OFF"}</button>
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