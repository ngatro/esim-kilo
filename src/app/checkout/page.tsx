"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useCart } from "@/components/providers/CartProvider";
import { useAuth } from "@/components/providers/AuthProvider";

export default function CheckoutPage() {
  const { items, total, clearCart } = useCart();
  const { user } = useAuth();
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  if (!user) {
    return (
      <div className="min-h-screen bg-slate-900 py-12">
        <div className="max-w-4xl mx-auto px-4 text-center">
          <h1 className="text-3xl font-bold text-white mb-4">Please Login to Checkout</h1>
          <Link href="/login" className="inline-block bg-sky-600 text-white px-6 py-3 rounded-lg hover:bg-sky-700">
            Login
          </Link>
        </div>
      </div>
    );
  }

  if (items.length === 0) {
    return (
      <div className="min-h-screen bg-slate-900 py-12">
        <div className="max-w-4xl mx-auto px-4 text-center">
          <h1 className="text-3xl font-bold text-white mb-4">Your cart is empty</h1>
          <Link href="/" className="inline-block bg-sky-600 text-white px-6 py-3 rounded-lg hover:bg-sky-700">
            Continue Shopping
          </Link>
        </div>
      </div>
    );
  }

  async function handleCheckout() {
    setLoading(true);
    try {
      const res = await fetch("/api/orders", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          items: items.map(item => ({
            planId: item.planId,
            planName: item.planName,
            price: item.price,
            quantity: item.quantity,
          })),
          totalAmount: total,
        }),
      });

      if (res.ok) {
        clearCart();
        router.push("/orders");
      }
    } catch (error) {
      console.error("Checkout failed:", error);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen bg-slate-900 py-12">
      <div className="max-w-4xl mx-auto px-4">
        <h1 className="text-3xl font-bold text-white mb-8">Checkout</h1>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <div>
            <h2 className="text-xl font-semibold text-white mb-4">Order Summary</h2>
            <div className="bg-slate-800 rounded-lg shadow-sm p-6">
              {items.map((item) => (
                <div key={item.id} className="flex justify-between py-2 text-slate-300">
                  <span>{item.planName} x {item.quantity}</span>
                  <span>${item.price * item.quantity}</span>
                </div>
              ))}
              <div className="border-t pt-4 mt-4">
                <div className="flex justify-between text-xl font-bold text-white">
                  <span>Total</span>
                  <span>${total}</span>
                </div>
              </div>
            </div>
          </div>
          
          <div>
            <h2 className="text-xl font-semibold text-white mb-4">Payment</h2>
            <div className="bg-slate-800 rounded-lg shadow-sm p-6">
              <p className="text-slate-400 mb-4">Demo mode - no real payment required</p>
              <button
                onClick={handleCheckout}
                disabled={loading}
                className="w-full bg-sky-600 text-white py-3 rounded-lg hover:bg-sky-700 disabled:bg-slate-600"
              >
                {loading ? "Processing..." : "Complete Order"}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
