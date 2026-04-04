"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import Link from "next/link";
import { useSearchParams, useRouter } from "next/navigation";
import { useI18n } from "@/components/providers/I18nProvider";

interface TopUpPackage {
  packageCode: string;
  name: string;
  priceUSD: number;
  volume: number;
  duration: number;
}

interface CurrentPlan {
  planName: string;
  iccid: string;
  esimStatus: string;
  totalVolume: number;
  orderUsage: number;
}

export default function TopUpPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { formatPrice } = useI18n();
  
  const initialIccid = searchParams.get("iccid") || "";
  const [iccid, setIccid] = useState(initialIccid);
  const [packages, setPackages] = useState<TopUpPackage[]>([]);
  const [currentPlan, setCurrentPlan] = useState<CurrentPlan | null>(null);
  const [loading, setLoading] = useState(true);
  const [processing, setProcessing] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);
  const [selectedPackage, setSelectedPackage] = useState<TopUpPackage | null>(null);

  useEffect(() => {
    if (iccid.length >= 19) {
      fetchPackages();
    }
  }, [iccid]);

  async function fetchPackages() {
    if (iccid.length < 19) return;
    setLoading(true);
    try {
      const res = await fetch(`/api/topup?iccid=${encodeURIComponent(iccid)}`);
      const data = await res.json();
      if (data.error) {
        setError(data.error);
      } else {
        setPackages(data.topUpPackages || []);
        setCurrentPlan(data.currentPlan);
        setError("");
      }
    } catch (err) {
      setError("Failed to fetch top-up packages");
    } finally {
      setLoading(false);
    }
  }

  async function handleTopUp() {
    if (!selectedPackage || !currentPlan) return;
    setProcessing(true);
    try {
      const res = await fetch("/api/topup", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          orderItemId: currentPlan.iccid,
          packageCode: selectedPackage.packageCode,
        }),
      });
      const data = await res.json();
      if (data.success) {
        setSuccess(true);
      } else {
        setError(data.error || "Top-up failed");
      }
    } catch (err) {
      setError("Top-up request failed");
    } finally {
      setProcessing(false);
    }
  }

  function formatData(volume: number): string {
    if (volume >= 999000) return "Unlimited";
    if (volume < 1000) return `${volume}MB`;
    return `${Math.round(volume / 1000)}GB`;
  }

  if (success) {
    return (
      <div className="min-h-screen bg-slate-900 text-white">
        <main className="pt-20 sm:pt-28 pb-16 sm:pb-24">
          <div className="max-w-lg mx-auto px-3 sm:px-6 text-center">
            <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} className="w-20 h-20 bg-green-500/20 rounded-full flex items-center justify-center mx-auto mb-6">
              <span className="text-4xl">✓</span>
            </motion.div>
            <h1 className="text-2xl sm:text-3xl font-bold mb-4">Top-up Successful!</h1>
            <p className="text-slate-400 mb-8">Your eSIM data has been extended. A new QR code has been sent to your email.</p>
            <div className="flex gap-4 justify-center">
              <Link href="/orders">
                <button className="bg-sky-500 hover:bg-sky-400 text-white font-semibold px-6 py-3 rounded-xl">
                  View Orders
                </button>
              </Link>
              <Link href="/plans">
                <button className="bg-slate-700 hover:bg-slate-600 text-white font-semibold px-6 py-3 rounded-xl">
                  Browse More Plans
                </button>
              </Link>
            </div>
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-900 text-white">
      <main className="pt-20 sm:pt-28 pb-16 sm:pb-24">
        <div className="max-w-2xl mx-auto px-3 sm:px-6">
          
          <div className="text-center mb-8">
            <h1 className="text-2xl sm:text-4xl font-bold mb-3">Top-up Your eSIM</h1>
            <p className="text-slate-400">Enter your ICCID to see available top-up packages</p>
          </div>

          {/* ICCID Input */}
          <div className="bg-slate-800/60 border border-slate-700 rounded-2xl p-5 mb-6">
            <label className="block text-sm text-slate-400 mb-2">Your eSIM ICCID</label>
            <input
              type="text"
              value={iccid}
              onChange={(e) => setIccid(e.target.value.replace(/\D/g, ""))}
              placeholder="Enter 19-20 digit ICCID"
              className="w-full bg-slate-900/50 border border-slate-700 rounded-xl px-4 py-3 text-white font-mono text-sm focus:outline-none focus:border-sky-500"
            />
            <p className="text-slate-500 text-xs mt-2">Find ICCID in your order confirmation email or in Settings → Cellular</p>
          </div>

          {error && (
            <div className="bg-red-500/10 border border-red-500/30 rounded-xl p-4 mb-6 text-red-400 text-sm">
              {error}
            </div>
          )}

          {/* Current Plan Info */}
          {currentPlan && (
            <div className="bg-slate-800/40 border border-slate-700/50 rounded-2xl p-5 mb-6">
              <h3 className="text-white font-semibold mb-3">Current Plan</h3>
              <div className="flex justify-between text-sm">
                <span className="text-slate-400">ICCID</span>
                <span className="text-sky-400 font-mono">{currentPlan.iccid}</span>
              </div>
              {currentPlan.totalVolume > 0 && (
                <div className="mt-3">
                  <div className="flex justify-between text-sm mb-1">
                    <span className="text-slate-400">Data Used</span>
                    <span className="text-white">{formatData(currentPlan.orderUsage)} / {formatData(currentPlan.totalVolume)}</span>
                  </div>
                  <div className="w-full bg-slate-700 rounded-full h-2">
                    <div className="bg-sky-500 h-2 rounded-full" style={{ width: `${Math.min(100, (currentPlan.orderUsage / currentPlan.totalVolume) * 100)}%` }} />
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Top-up Packages */}
          {loading ? (
            <div className="text-center py-12">
              <div className="animate-spin w-8 h-8 border-2 border-sky-500 border-t-transparent rounded-full mx-auto" />
            </div>
          ) : packages.length > 0 ? (
            <div className="space-y-3">
              <h3 className="text-white font-semibold mb-4">Select Top-up Package</h3>
              {packages.map((pkg) => (
                <motion.button
                  key={pkg.packageCode}
                  onClick={() => setSelectedPackage(pkg)}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  className={`w-full p-5 rounded-2xl border text-left transition-all ${
                    selectedPackage?.packageCode === pkg.packageCode
                      ? "bg-sky-500/20 border-sky-500/50"
                      : "bg-slate-800/40 border-slate-700/50 hover:border-slate-600"
                  }`}
                >
                  <div className="flex justify-between items-center">
                    <div>
                      <p className="text-white font-semibold">{formatData(pkg.volume)}</p>
                      <p className="text-slate-400 text-sm">{pkg.duration} days validity</p>
                    </div>
                    <p className="text-xl font-bold text-sky-400">{formatPrice(pkg.priceUSD)}</p>
                  </div>
                </motion.button>
              ))}

              <button
                onClick={handleTopUp}
                disabled={!selectedPackage || processing}
                className="w-full bg-sky-500 hover:bg-sky-400 disabled:bg-slate-600 disabled:cursor-not-allowed text-white font-semibold py-4 rounded-xl mt-4 transition-colors"
              >
                {processing ? "Processing..." : selectedPackage ? `Top-up for ${formatPrice(selectedPackage.priceUSD)}` : "Select a package"}
              </button>
            </div>
          ) : iccid.length >= 19 && !loading && !error ? (
            <div className="text-center py-8 text-slate-400">
              No top-up packages found for this ICCID
            </div>
          ) : null}

          <div className="mt-8 text-center">
            <Link href="/orders" className="text-sky-400 hover:text-sky-300 text-sm">
              View my orders →
            </Link>
          </div>

        </div>
      </main>
    </div>
  );
}
