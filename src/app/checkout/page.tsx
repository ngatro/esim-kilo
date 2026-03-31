"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useAuth } from "@/components/providers/AuthProvider";

interface Plan {
  id: string;
  name: string;
  destination: string;
  dataAmount: number;
  validityDays: number;
  priceUsd: number;
  coverageCountries: number;
  networkType: string | null;
  isPopular: boolean;
  isBestSeller: boolean;
  isHot: boolean;
  badge: string | null;
  features: unknown;
  region: { id: string; name: string; emoji: string } | null;
  country: { id: string; name: string; emoji: string } | null;
}

function formatData(gb: number): string {
  if (gb >= 999) return "Unlimited";
  return `${gb}GB`;
}

export default function CheckoutPage() {
  const { user } = useAuth();
  const router = useRouter();
  const searchParams = useSearchParams();
  const planId = searchParams.get("planId");

  const [plan, setPlan] = useState<Plan | null>(null);
  const [loading, setLoading] = useState(true);
  const [processing, setProcessing] = useState(false);
  const [quantity, setQuantity] = useState(1);
  const [customerName, setCustomerName] = useState("");
  const [customerEmail, setCustomerEmail] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState<{ orderId: number; qrCode?: string; activationCode?: string } | null>(null);

  useEffect(() => {
    if (planId) {
      fetch(`/api/plans?search=${planId}`)
        .then((r) => r.json())
        .then((data) => {
          const found = (data.plans || []).find((p: Plan) => p.id === planId);
          setPlan(found || null);
        })
        .catch(() => setPlan(null))
        .finally(() => setLoading(false));
    } else {
      setLoading(false);
    }
  }, [planId]);

  useEffect(() => {
    if (user) {
      setCustomerName(user.name || "");
      setCustomerEmail(user.email || "");
    }
  }, [user]);

  async function handleCheckout() {
    if (!plan) return;
    if (!customerEmail) {
      setError("Email is required to receive your eSIM");
      return;
    }

    setProcessing(true);
    setError("");

    try {
      const res = await fetch("/api/orders", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          items: [{ planId: plan.id, quantity }],
          customerName,
          customerEmail,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error || "Order failed");
        return;
      }

      const orderItem = data.order?.orderItems?.[0];
      setSuccess({
        orderId: data.order.id,
        qrCode: orderItem?.esimQrCode || orderItem?.esimQrImage,
        activationCode: orderItem?.activationCode,
      });
    } catch {
      setError("Something went wrong. Please try again.");
    } finally {
      setProcessing(false);
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-900 flex items-center justify-center">
        <div className="animate-spin w-8 h-8 border-2 border-sky-500 border-t-transparent rounded-full" />
      </div>
    );
  }

  if (success) {
    return (
      <div className="min-h-screen bg-slate-900 text-white py-12">
        <div className="max-w-lg mx-auto px-4 text-center">
          <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ type: "spring", duration: 0.6 }}>
            <div className="w-20 h-20 bg-green-500/20 rounded-full flex items-center justify-center mx-auto mb-6">
              <svg className="w-10 h-10 text-green-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
              </svg>
            </div>
          </motion.div>
          <h1 className="text-3xl font-bold mb-2">Order Complete!</h1>
          <p className="text-slate-400 mb-6">Order #{success.orderId}</p>

          {success.qrCode && (
            <div className="bg-white rounded-2xl p-6 mb-6 inline-block">
              <img src={success.qrCode} alt="eSIM QR Code" className="w-64 h-64 mx-auto" />
            </div>
          )}

          {success.activationCode && (
            <div className="bg-slate-800 border border-slate-700 rounded-2xl p-4 mb-6">
              <p className="text-xs text-slate-500 uppercase tracking-wider mb-1">Activation Code</p>
              <code className="text-sky-400 text-sm break-all">{success.activationCode}</code>
            </div>
          )}

          <p className="text-slate-400 text-sm mb-8">
            Scan this QR code in your phone&apos;s eSIM settings to activate your plan.
          </p>

          <div className="flex gap-3 justify-center">
            <Link href="/orders">
              <motion.button className="bg-slate-700 hover:bg-slate-600 text-white px-6 py-3 rounded-xl transition-colors" whileHover={{ scale: 1.02 }}>
                View Orders
              </motion.button>
            </Link>
            <Link href="/plans">
              <motion.button className="bg-sky-500 hover:bg-sky-400 text-white font-semibold px-6 py-3 rounded-xl transition-colors" whileHover={{ scale: 1.02 }}>
                Buy Another Plan
              </motion.button>
            </Link>
          </div>
        </div>
      </div>
    );
  }

  if (!planId || !plan) {
    return (
      <div className="min-h-screen bg-slate-900 text-white py-12">
        <div className="max-w-4xl mx-auto px-4 text-center">
          <p className="text-6xl mb-4">🛒</p>
          <h1 className="text-3xl font-bold mb-3">Select a Plan First</h1>
          <p className="text-slate-400 mb-6">Browse our plans and choose the one that fits your travel needs</p>
          <Link href="/plans">
            <motion.button className="bg-sky-500 hover:bg-sky-400 text-white font-semibold px-8 py-3 rounded-xl transition-colors" whileHover={{ scale: 1.02 }}>
              Browse Plans
            </motion.button>
          </Link>
        </div>
      </div>
    );
  }

  const totalPrice = plan.priceUsd * quantity;
  const isUnlimited = plan.dataAmount >= 999;

  return (
    <div className="min-h-screen bg-slate-900 text-white py-12">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
        <nav className="flex items-center gap-2 text-sm text-slate-500 mb-8">
          <Link href="/" className="hover:text-slate-300">Home</Link>
          <span>/</span>
          <Link href="/plans" className="hover:text-slate-300">Plans</Link>
          <span>/</span>
          <span className="text-slate-300">Checkout</span>
        </nav>

        <h1 className="text-3xl font-bold text-white mb-8">Checkout</h1>

        <div className="grid grid-cols-1 lg:grid-cols-5 gap-8">
          <div className="lg:col-span-3 space-y-6">
            <div className="bg-slate-800/50 border border-slate-700/50 rounded-2xl p-6">
              <h2 className="text-lg font-semibold text-white mb-4">Your eSIM Plan</h2>
              <div className="flex items-center gap-4">
                <span className="text-4xl">{plan.country?.emoji || plan.region?.emoji || "🌍"}</span>
                <div className="flex-1">
                  <h3 className="text-white font-semibold">{plan.destination} eSIM</h3>
                  <p className="text-slate-400 text-sm">
                    {isUnlimited ? "Unlimited" : `${plan.dataAmount}GB`} · {plan.validityDays} days · {plan.networkType || "4G LTE"}
                  </p>
                </div>
                <p className="text-2xl font-bold text-white">${plan.priceUsd.toFixed(2)}</p>
              </div>

              {plan.coverageCountries > 1 && (
                <p className="text-slate-500 text-xs mt-3">Coverage: {plan.coverageCountries} countries</p>
              )}
            </div>

            <div className="bg-slate-800/50 border border-slate-700/50 rounded-2xl p-6">
              <h2 className="text-lg font-semibold text-white mb-4">Contact Information</h2>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm text-slate-400 mb-1.5">Name (optional)</label>
                  <input
                    type="text"
                    value={customerName}
                    onChange={(e) => setCustomerName(e.target.value)}
                    placeholder="Your name"
                    className="w-full bg-slate-900/50 border border-slate-700 rounded-xl px-4 py-3 text-white placeholder:text-slate-600 focus:outline-none focus:border-sky-500 transition-colors"
                  />
                </div>
                <div>
                  <label className="block text-sm text-slate-400 mb-1.5">Email *</label>
                  <input
                    type="email"
                    value={customerEmail}
                    onChange={(e) => setCustomerEmail(e.target.value)}
                    placeholder="you@example.com"
                    className="w-full bg-slate-900/50 border border-slate-700 rounded-xl px-4 py-3 text-white placeholder:text-slate-600 focus:outline-none focus:border-sky-500 transition-colors"
                  />
                  <p className="text-slate-500 text-xs mt-1">eSIM QR code will be sent to this email</p>
                </div>
              </div>
            </div>

            <div className="bg-slate-800/50 border border-slate-700/50 rounded-2xl p-6">
              <h2 className="text-lg font-semibold text-white mb-4">Quantity</h2>
              <div className="flex items-center gap-4">
                <button
                  onClick={() => setQuantity(Math.max(1, quantity - 1))}
                  className="w-10 h-10 bg-slate-700 hover:bg-slate-600 rounded-xl text-white font-bold text-lg transition-colors"
                >
                  -
                </button>
                <span className="text-2xl font-bold text-white w-12 text-center">{quantity}</span>
                <button
                  onClick={() => setQuantity(Math.min(10, quantity + 1))}
                  className="w-10 h-10 bg-slate-700 hover:bg-slate-600 rounded-xl text-white font-bold text-lg transition-colors"
                >
                  +
                </button>
                <span className="text-slate-500 text-sm">eSIM{quantity > 1 ? "s" : ""}</span>
              </div>
            </div>
          </div>

          <div className="lg:col-span-2">
            <motion.div
              className="sticky top-24 bg-slate-800/70 border border-slate-700/60 rounded-3xl p-7"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
            >
              <h2 className="text-lg font-semibold text-white mb-5">Order Summary</h2>

              <div className="space-y-3 mb-6">
                <div className="flex justify-between text-slate-300">
                  <span>{plan.destination} eSIM × {quantity}</span>
                  <span>${(plan.priceUsd * quantity).toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-slate-300">
                  <span>Activation</span>
                  <span className="text-green-400">Free</span>
                </div>
              </div>

              <div className="border-t border-slate-700 pt-4 mb-6">
                <div className="flex justify-between">
                  <span className="text-lg font-semibold text-white">Total</span>
                  <span className="text-2xl font-bold text-white">${totalPrice.toFixed(2)}</span>
                </div>
              </div>

              {error && (
                <div className="bg-red-500/10 border border-red-500/30 rounded-xl p-3 mb-4">
                  <p className="text-red-400 text-sm">{error}</p>
                </div>
              )}

              <motion.button
                onClick={handleCheckout}
                disabled={processing}
                className="w-full bg-sky-500 hover:bg-sky-400 disabled:bg-slate-600 disabled:cursor-not-allowed text-white font-semibold py-4 rounded-xl text-lg transition-colors shadow-lg shadow-sky-900/30"
                whileHover={!processing ? { scale: 1.02 } : {}}
                whileTap={!processing ? { scale: 0.98 } : {}}
              >
                {processing ? (
                  <span className="flex items-center justify-center gap-2">
                    <div className="animate-spin w-5 h-5 border-2 border-white border-t-transparent rounded-full" />
                    Processing...
                  </span>
                ) : (
                  `Pay $${totalPrice.toFixed(2)}`
                )}
              </motion.button>

              <div className="mt-5 space-y-2">
                {[
                  "Instant QR code delivery",
                  "Secure payment via eSIM Access",
                  "7-day money back guarantee",
                ].map((text) => (
                  <div key={text} className="flex items-center gap-2 text-xs text-slate-500">
                    <svg className="w-3.5 h-3.5 text-green-500" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                    </svg>
                    {text}
                  </div>
                ))}
              </div>
            </motion.div>
          </div>
        </div>
      </div>
    </div>
  );
}