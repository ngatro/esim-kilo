"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useAuth } from "@/components/providers/AuthProvider";
import { useI18n } from "@/components/providers/I18nProvider";

interface Plan {
  id: string;
  name: string;
  destination: string;
  dataAmount: number;
  durationDays: number;
  priceUsd: number;
  retailPriceUsd: number;
  coverageCount: number;
  speed: string | null;
  networkType: string | null;
  locationLogo: string | null;
  region: { id: string; name: string; emoji: string } | null;
  country: { id: string; name: string; emoji: string } | null;
}

type PaymentMethod = "paypal" | "lemonsqueezy" | "gumroad" | "payoneer";

import { convertFromUSD } from "@/lib/currency";

export default function CheckoutPage() {
  const { user } = useAuth();
  const router = useRouter();
  const searchParams = useSearchParams();
  const { formatPrice, currency, rates } = useI18n();
  const planId = searchParams.get("planId");

  const [plan, setPlan] = useState<Plan | null>(null);
  const [loading, setLoading] = useState(true);
  const [processing, setProcessing] = useState(false);
  const [quantity, setQuantity] = useState(1);
  const [customerName, setCustomerName] = useState("");
  const [customerEmail, setCustomerEmail] = useState("");
  const [error, setError] = useState("");
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>("paypal");
  const [success, setSuccess] = useState<{ orderId: number; qrCode?: string; activationCode?: string } | null>(null);

  // Handle PayPal success redirect
  useEffect(() => {
    const paypalSuccess = searchParams.get("success");
    const paypalOrderId = searchParams.get("token"); // PayPal sends order ID as 'token'
    const cancelled = searchParams.get("cancelled");

    if (cancelled) {
      setError("Payment was cancelled");
      return;
    }

    if (paypalSuccess === "true" && paypalOrderId) {
      // Get planId from localStorage (saved before redirect) or URL
      const savedPlanId = localStorage.getItem("paypal_planId") || planId;
      const savedQty = parseInt(localStorage.getItem("paypal_qty") || "1");

      if (!savedPlanId) {
        setError("Plan ID not found");
        return;
      }

      setProcessing(true);
      // Confirm payment and create order
      fetch("/api/payment/paypal/webhook", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ orderId: paypalOrderId, planId: savedPlanId, quantity: savedQty }),
      })
        .then((r) => r.json())
        .then((data) => {
          if (data.success && data.order) {
            const item = data.order.orderItems?.[0];
            if (data.alreadyProcessed) {
              // Order already processed, redirect to orders
              router.replace("/orders");
              return;
            }
            setSuccess({
              orderId: data.order.id,
              qrCode: item?.esimQrCode || item?.esimQrImage || data.esim?.qrcodeUrl,
              activationCode: item?.activationCode || data.esim?.activationCode,
            });
            // Clean up localStorage
            localStorage.removeItem("paypal_planId");
            localStorage.removeItem("paypal_qty");
            // Don't redirect, let user scan QR code
          } else {
            setError(data.error || "Payment confirmation failed");
          }
        })
        .catch((err) => setError(`Payment confirmation failed: ${err}`))
        .finally(() => setProcessing(false));
    }
  }, [searchParams, planId]);

  useEffect(() => {
    if (planId) {
      fetch(`/api/plans?id=${planId}`)
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

  async function handlePayPal() {
    // Get base price in USD - use priceUsd field or convert from displayed price
    const basePrice = plan!.priceUsd && plan!.priceUsd > 0 
      ? plan!.priceUsd 
      : convertFromUSD(plan!.priceUsd || 0, currency, rates);
    
    const priceUSD = basePrice * quantity;
    
    if (!priceUSD || priceUSD <= 0) {
      throw new Error("Invalid price");
    }
    
    const res = await fetch("/api/payment/paypal", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        planId: plan!.id,
        planName: `${plan!.destination} eSIM`,
        price: priceUSD,
        currency: "USD", // Always USD for PayPal
        customerEmail,
      }),
    });

    const data = await res.json();
    if (!res.ok) throw new Error(data.error || "PayPal failed");

    if (data.approveUrl) {
      // Save planId and quantity before redirecting to PayPal
      localStorage.setItem("paypal_planId", plan!.id);
      localStorage.setItem("paypal_qty", quantity.toString());
      window.location.href = data.approveUrl;
      return;
    }
    throw new Error("No approval URL");
  }

  async function handleLemonSqueezy() {
    const res = await fetch("/api/payment/lemonsqueezy", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        planId: plan!.id,
        planName: `${plan!.destination} eSIM`,
        price: plan!.priceUsd * quantity,
        customerEmail,
      }),
    });

    const data = await res.json();
    if (!res.ok) throw new Error(data.error || "LemonSqueezy failed");

    if (data.checkoutUrl) {
      window.location.href = data.checkoutUrl;
      return;
    }
    throw new Error("No checkout URL");
  }

  async function handleGumroad() {
    const res = await fetch("/api/payment/gumroad", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        planId: plan!.id,
        planName: `${plan!.destination} eSIM`,
        price: plan!.priceUsd * quantity,
        customerEmail,
      }),
    });

    const data = await res.json();
    if (!res.ok) throw new Error(data.error || "Gumroad failed");

    if (data.checkoutUrl) {
      window.open(data.checkoutUrl, "_blank");
      return;
    }
    throw new Error("No checkout URL");
  }

  async function handlePayoneer() {
    const res = await fetch("/api/payment/payoneer", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        planId: plan!.id,
        planName: `${plan!.destination} eSIM`,
        price: plan!.priceUsd * quantity,
        customerEmail,
      }),
    });

    const data = await res.json();
    if (!res.ok) throw new Error(data.error || "Payoneer failed");

    if (data.checkoutUrl) {
      window.location.href = data.checkoutUrl;
      return;
    }
    throw new Error("No checkout URL");
  }

  async function handleDirectCheckout() {
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

  async function handleCheckout() {
    if (!plan) return;
    if (!customerEmail) {
      setError("Email is required to receive your eSIM");
      return;
    }

    setProcessing(true);
    setError("");

    try {
      switch (paymentMethod) {
        case "paypal":
          await handlePayPal();
          break;
        case "lemonsqueezy":
          await handleLemonSqueezy();
          break;
        case "gumroad":
          await handleGumroad();
          break;
        case "payoneer":
          await handlePayoneer();
          break;
        default:
          await handleDirectCheckout();
      }
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Payment failed");
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
      <div className="min-h-screen bg-orange-50 text-slate-800 py-8 sm:py-12">
        <div className="max-w-lg mx-auto px-4 text-center">
          <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ type: "spring", duration: 0.6 }}>
            <div className="w-20 h-20 bg-green-500/20 rounded-full flex items-center justify-center mx-auto mb-6">
              <svg className="w-10 h-10 text-green-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
              </svg>
            </div>
          </motion.div>
          <h1 className="text-2xl sm:text-3xl font-bold mb-2">Order Complete!</h1>
          <p className="text-slate-600 mb-6">Order #{success.orderId}</p>

          {success.qrCode && (
            <div className="bg-white border border-slate-200 rounded-2xl p-4 sm:p-6 mb-6 inline-block shadow-sm">
              <img src={success.qrCode} alt="eSIM QR Code" className="w-48 h-48 sm:w-64 sm:h-64 mx-auto" />
            </div>
          )}

          {success.activationCode && (
            <div className="bg-white border border-slate-200 rounded-2xl p-4 mb-6">
              <p className="text-xs text-slate-500 uppercase tracking-wider mb-1">Activation Code</p>
              <code className="text-orange-500 text-xs sm:text-sm break-all">{success.activationCode}</code>
            </div>
          )}

          <p className="text-slate-600 text-sm mb-8">
            Scan this QR code in your phone&apos;s eSIM settings to activate your plan.
          </p>

          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <Link href="/orders">
              <button className="w-full sm:w-auto bg-slate-200 hover:bg-slate-300 text-slate-800 font-semibold px-6 py-3 rounded-xl transition-colors">
                View Orders
              </button>
            </Link>
            <Link href="/plans">
              <button className="w-full sm:w-auto bg-orange-500 hover:bg-orange-400 text-white font-semibold px-6 py-3 rounded-xl transition-colors">
                Buy Another Plan
              </button>
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
          <p className="text-5xl sm:text-6xl mb-4">🛒</p>
          <h1 className="text-2xl sm:text-3xl font-bold mb-3">Select a Plan First</h1>
          <p className="text-slate-400 mb-6">Browse our plans and choose the one that fits your travel needs</p>
          <Link href="/plans">
            <button className="bg-sky-500 hover:bg-sky-400 text-white font-semibold px-8 py-3 rounded-xl transition-colors">
              Browse Plans
            </button>
          </Link>
        </div>
      </div>
    );
  }

  const totalPrice = (plan.retailPriceUsd || plan.retailPriceUsd && plan.retailPriceUsd > 0 ? plan.retailPriceUsd : plan.priceUsd) * quantity;
  const isUnlimited = plan.dataAmount >= 999;

  return (
    <div className="min-h-screen bg-orange-50 text-slate-800 py-6 sm:py-12">
      <div className="max-w-5xl mx-auto px-3 sm:px-6 lg:px-8">
        <nav className="flex items-center gap-2 text-xs sm:text-sm text-slate-500 mb-6 sm:mb-8">
          <Link href="/" className="hover:text-orange-600">Home</Link>
          <span>/</span>
          <Link href="/plans" className="hover:text-orange-600">Plans</Link>
          <span>/</span>
          <span className="text-slate-600">Checkout</span>
        </nav>

        <h1 className="text-2xl sm:text-3xl font-bold text-slate-800 mb-6 sm:mb-8">Checkout</h1>

        <div className="grid grid-cols-1 lg:grid-cols-5 gap-6 lg:gap-8">
          <div className="lg:col-span-3 space-y-5">
            {/* Plan Summary */}
            <div className="bg-white border border-slate-200 rounded-2xl p-4 sm:p-6 shadow-sm">
              <h2 className="text-base sm:text-lg font-semibold text-slate-800 mb-3">Your eSIM Plan</h2>
              <div className="flex items-center gap-3 sm:gap-4">
                {plan.locationLogo ? (
                  <img src={plan.locationLogo} alt={plan.destination} className="w-10 h-10 sm:w-12 sm:h-12 object-contain" />
                ) : (
                  <span className="text-3xl sm:text-4xl">{plan.country?.emoji || plan.region?.emoji || "🌍"}</span>
                )}
                <div className="flex-1 min-w-0">
                  <h3 className="text-slate-800 font-semibold text-sm sm:text-base truncate">{plan.destination} eSIM</h3>
                  <p className="text-slate-500 text-xs sm:text-sm">
                    {isUnlimited ? "Unlimited" : `${plan.dataAmount}GB`} · {plan.durationDays} days · {plan.speed || "4G LTE"}
                  </p>
                </div>
                <p className="text-xl sm:text-2xl font-bold text-slate-800 flex-shrink-0">{formatPrice(plan.retailPriceUsd && plan.retailPriceUsd > 0 ? plan.retailPriceUsd : plan.priceUsd)}</p>
              </div>
            </div>

            {/* Contact Info */}
            <div className="bg-white border border-slate-200 rounded-2xl p-4 sm:p-6 shadow-sm">
              <h2 className="text-base sm:text-lg font-semibold text-slate-800 mb-3">Contact Information</h2>
              <div className="space-y-3">
                <div>
                  <label className="block text-xs sm:text-sm text-slate-600 mb-1.5">Name (optional)</label>
                  <input
                    type="text"
                    value={customerName}
                    onChange={(e) => setCustomerName(e.target.value)}
                    placeholder="Your name"
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 sm:px-4 py-2.5 sm:py-3 text-slate-800 text-sm placeholder:text-slate-400 focus:outline-none focus:border-orange-400 transition-colors"
                  />
                </div>
                <div>
                  <label className="block text-xs sm:text-sm text-slate-600 mb-1.5">Email *</label>
                  <input
                    type="email"
                    value={customerEmail}
                    onChange={(e) => setCustomerEmail(e.target.value)}
                    placeholder="you@example.com"
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 sm:px-4 py-2.5 sm:py-3 text-slate-800 text-sm placeholder:text-slate-400 focus:outline-none focus:border-orange-400 transition-colors"
                  />
                  <p className="text-slate-400 text-xs mt-1">eSIM QR code will be sent to this email</p>
                </div>
              </div>
            </div>

            {/* Quantity */}
            <div className="bg-white border border-slate-200 rounded-2xl p-4 sm:p-6 shadow-sm">
              <h2 className="text-base sm:text-lg font-semibold text-slate-800 mb-3">Quantity</h2>
              <div className="flex items-center gap-4">
                <button onClick={() => setQuantity(Math.max(1, quantity - 1))}
                  className="w-10 h-10 bg-slate-100 hover:bg-slate-200 rounded-xl text-slate-800 font-bold text-lg transition-colors">-</button>
                <span className="text-2xl font-bold text-slate-800 w-12 text-center">{quantity}</span>
                <button onClick={() => setQuantity(Math.min(10, quantity + 1))}
                  className="w-10 h-10 bg-slate-100 hover:bg-slate-200 rounded-xl text-slate-800 font-bold text-lg transition-colors">+</button>
                <span className="text-slate-500 text-sm">eSIM{quantity > 1 ? "s" : ""}</span>
              </div>
            </div>

            {/* Payment Method */}
            <div className="bg-white border border-slate-200 rounded-2xl p-4 sm:p-6 shadow-sm">
              <h2 className="text-base sm:text-lg font-semibold text-slate-800 mb-4">Payment Method</h2>
              <div className="space-y-3">
                {/* PayPal */}
                <button
                  onClick={() => setPaymentMethod("paypal")}
                  className={`w-full flex items-center gap-4 p-4 rounded-xl border transition-all ${
                    paymentMethod === "paypal"
                      ? "bg-orange-50 border-orange-400 ring-1 ring-orange-200"
                      : "bg-white border-slate-200 hover:border-slate-300"
                  }`}
                >
                  <div className="w-12 h-8 bg-blue-600 rounded-lg flex items-center justify-center flex-shrink-0">
                    <span className="text-white text-xs font-bold">PayPal</span>
                  </div>
                  <div className="text-left flex-1">
                    <p className="text-slate-800 font-medium text-sm">PayPal</p>
                    <p className="text-slate-500 text-xs">Credit Card, Apple Pay, Google Pay</p>
                  </div>
                  <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${
                    paymentMethod === "paypal" ? "border-orange-500" : "border-slate-300"
                  }`}>
                    {paymentMethod === "paypal" && <div className="w-2.5 h-2.5 bg-orange-500 rounded-full" />}
                  </div>
                </button>

                {/* LemonSqueezy */}
                <button
                  onClick={() => setPaymentMethod("lemonsqueezy")}
                  className={`w-full flex items-center gap-4 p-4 rounded-xl border transition-all ${
                    paymentMethod === "lemonsqueezy"
                      ? "bg-orange-50 border-orange-400 ring-1 ring-orange-200"
                      : "bg-white border-slate-200 hover:border-slate-300"
                  }`}
                >
                  <div className="w-12 h-8 bg-yellow-400 rounded-lg flex items-center justify-center flex-shrink-0">
                    <span className="text-slate-900 text-xs font-bold">LS</span>
                  </div>
                  <div className="text-left flex-1">
                    <p className="text-slate-800 font-medium text-sm">LemonSqueezy</p>
                    <p className="text-slate-500 text-xs">Credit Card, Apple Pay, Google Pay, Crypto</p>
                  </div>
                  <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${
                    paymentMethod === "lemonsqueezy" ? "border-orange-500" : "border-slate-300"
                  }`}>
                    {paymentMethod === "lemonsqueezy" && <div className="w-2.5 h-2.5 bg-orange-500 rounded-full" />}
                  </div>
                </button>

                {/* Gumroad */}
                <button
                  onClick={() => setPaymentMethod("gumroad")}
                  className={`w-full flex items-center gap-4 p-4 rounded-xl border transition-all ${
                    paymentMethod === "gumroad"
                      ? "bg-orange-50 border-orange-400 ring-1 ring-orange-200"
                      : "bg-white border-slate-200 hover:border-slate-300"
                  }`}
                >
                  <div className="w-12 h-8 bg-pink-500 rounded-lg flex items-center justify-center flex-shrink-0">
                    <span className="text-white text-xs font-bold">G</span>
                  </div>
                  <div className="text-left flex-1">
                    <p className="text-slate-800 font-medium text-sm">Gumroad</p>
                    <p className="text-slate-500 text-xs">Credit Card, PayPal</p>
                  </div>
                  <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${
                    paymentMethod === "gumroad" ? "border-orange-500" : "border-slate-300"
                  }`}>
                    {paymentMethod === "gumroad" && <div className="w-2.5 h-2.5 bg-orange-500 rounded-full" />}
                  </div>
                </button>

                {/* Payoneer */}
                <button
                  onClick={() => setPaymentMethod("payoneer")}
                  className={`w-full flex items-center gap-4 p-4 rounded-xl border transition-all ${
                    paymentMethod === "payoneer"
                      ? "bg-orange-50 border-orange-400 ring-1 ring-orange-200"
                      : "bg-white border-slate-200 hover:border-slate-300"
                  }`}
                >
                  <div className="w-12 h-8 bg-orange-500 rounded-lg flex items-center justify-center flex-shrink-0">
                    <span className="text-white text-xs font-bold">P</span>
                  </div>
                  <div className="text-left flex-1">
                    <p className="text-slate-800 font-medium text-sm">Payoneer</p>
                    <p className="text-slate-500 text-xs">Bank Transfer, Credit Card</p>
                  </div>
                  <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${
                    paymentMethod === "payoneer" ? "border-orange-500" : "border-slate-300"
                  }`}>
                    {paymentMethod === "payoneer" && <div className="w-2.5 h-2.5 bg-orange-500 rounded-full" />}
                  </div>
                </button>
              </div>
            </div>
          </div>

          {/* Order Summary Sidebar */}
          <div className="lg:col-span-2">
            <motion.div
              className="sticky top-20 sm:top-24 bg-white border border-slate-200 rounded-2xl sm:rounded-3xl p-5 sm:p-7 shadow-lg"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
            >
              <h2 className="text-base sm:text-lg font-semibold text-slate-800 mb-4 sm:mb-5">Order Summary</h2>

              <div className="space-y-2 sm:space-y-3 mb-4 sm:mb-6">
                <div className="flex justify-between text-slate-600 text-sm">
                  <span>{plan.destination} eSIM × {quantity}</span>
                  <span>{formatPrice((plan.retailPriceUsd && plan.retailPriceUsd > 0 ? plan.retailPriceUsd : plan.priceUsd) * quantity)}</span>
                </div>
                <div className="flex justify-between text-slate-600 text-sm">
                  <span>Activation</span>
                  <span className="text-green-600">Free</span>
                </div>
              </div>

              <div className="border-t border-slate-200 pt-3 sm:pt-4 mb-4 sm:mb-6">
                <div className="flex justify-between">
                  <span className="text-base sm:text-lg font-semibold text-slate-800">Total</span>
                  <span className="text-xl sm:text-2xl font-bold text-slate-800">{formatPrice(totalPrice)}</span>
                </div>
              </div>

              {error && (
                <div className="bg-red-50 border border-red-200 rounded-xl p-3 mb-4">
                  <p className="text-red-600 text-sm">{error}</p>
                </div>
              )}

              <motion.button
                onClick={handleCheckout}
                disabled={processing}
                className="w-full bg-orange-500 hover:bg-orange-600 disabled:bg-slate-400 disabled:cursor-not-allowed text-white font-semibold py-3 sm:py-4 rounded-xl text-base sm:text-lg transition-all shadow-lg"
                whileHover={!processing ? { scale: 1.02 } : {}}
                whileTap={!processing ? { scale: 0.98 } : {}}
              >
                {processing ? (
                  <span className="flex items-center justify-center gap-2">
                    <div className="animate-spin w-5 h-5 border-2 border-white border-t-transparent rounded-full" />
                    Processing...
                  </span>
                ) : (
                  `Pay ${formatPrice(totalPrice)}`
                )}
              </motion.button>

              <div className="mt-4 sm:mt-5 space-y-2">
                {[
                  "Instant QR code delivery",
                  "Secure payment",
                  "7-day money back guarantee",
                ].map((text) => (
                  <div key={text} className="flex items-center gap-2 text-xs text-slate-500">
                    <svg className="w-3.5 h-3.5 text-green-500 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                    </svg>
                    {text}
                  </div>
                ))}
              </div>

              <div className="mt-4 pt-4 border-t border-slate-100 flex items-center justify-center gap-3">
                <div className="flex items-center gap-1 text-slate-400 text-[10px]">
                  <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z" clipRule="evenodd" /></svg>
                  SSL Encrypted
                </div>
                <div className="flex items-center gap-1 text-slate-400 text-[10px]">
                  <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" /></svg>
                  Verified
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </div>
    </div>
  );
}