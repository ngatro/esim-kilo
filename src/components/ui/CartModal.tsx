"use client";

import { useUI } from "@/components/providers/UIProvider";
import { useCart } from "@/components/providers/CartProvider";
import { useRouter } from "next/navigation";
import { useEffect } from "react";

export default function CartModal() {
  const { isCartOpen, closeCart } = useUI();
  const { items, removeItem, updateQuantity, total, clearCart, isLoading, isSyncing, isProcessing } = useCart();
  const router = useRouter();

  useEffect(() => {
    if (isCartOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "unset";
    }
    return () => {
      document.body.style.overflow = "unset";
    };
  }, [isCartOpen]);

  if (!isCartOpen) return null;

  function handleCheckout() {
    closeCart();
    router.push("/checkout");
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={closeCart} />
      <div className="relative bg-slate-800 rounded-2xl w-full max-w-lg max-h-[80vh] mx-4 shadow-2xl border border-slate-700 flex flex-col">
        <div className="flex items-center justify-between p-6 border-b border-slate-700">
          <h2 className="text-xl font-bold text-white">Shopping Cart</h2>
          <button onClick={closeCart} className="text-slate-400 hover:text-white">
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Syncing indicator */}
        {isSyncing && (
          <div className="mx-6 mt-4 p-3 bg-blue-900/30 border border-blue-500/30 rounded-lg flex items-center gap-2 text-blue-300 text-sm">
            <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
            </svg>
            Syncing your cart...
          </div>
        )}

        <div className="flex-1 overflow-y-auto p-6">
          {isLoading ? (
            <div className="space-y-4">
              {[1, 2, 3].map((i) => (
                <div key={i} className="flex items-center justify-between bg-slate-900/50 rounded-xl p-4 animate-pulse">
                  <div className="flex-1">
                    <div className="h-4 bg-slate-700 rounded w-32 mb-2"></div>
                    <div className="h-3 bg-slate-700 rounded w-20"></div>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="h-8 w-20 bg-slate-700 rounded-lg"></div>
                    <div className="h-4 w-12 bg-slate-700 rounded"></div>
                    <div className="h-5 w-5 bg-slate-700 rounded"></div>
                  </div>
                </div>
              ))}
            </div>
          ) : items.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-slate-400 mb-4">Your cart is empty</p>
              <button onClick={closeCart} className="text-sky-400 hover:text-sky-300">
                Continue Shopping
              </button>
            </div>
          ) : (
            <div className="space-y-4">
              {items.map((item) => (
                <div key={item.id} className="flex items-center justify-between bg-slate-900/50 rounded-xl p-4">
                  <div className="flex-1">
                    <h3 className="font-medium text-white">{item.planName}</h3>
                    <p className="text-sm text-slate-400">${item.price.toFixed(2)} each</p>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className={`flex items-center bg-slate-700 rounded-lg ${isProcessing ? 'opacity-50 cursor-not-allowed' : ''}`}>
                      <button
                        onClick={() => updateQuantity(item.id, item.quantity - 1)}
                        disabled={isProcessing}
                        className="px-3 py-1 text-slate-300 hover:text-white disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        -
                      </button>
                      <span className="px-2 text-white">{item.quantity}</span>
                      <button
                        onClick={() => updateQuantity(item.id, item.quantity + 1)}
                        disabled={isProcessing}
                        className="px-3 py-1 text-slate-300 hover:text-white disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        +
                      </button>
                    </div>
                    <p className="text-white font-medium w-16 text-right">${(item.price * item.quantity).toFixed(2)}</p>
                    <button 
                      onClick={() => removeItem(item.id)} 
                      disabled={isProcessing}
                      className="text-red-400 hover:text-red-300 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                      </svg>
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {items.length > 0 && (
          <div className="p-6 border-t border-slate-700 space-y-4">
            <div className="flex justify-between items-center">
              <span className="text-lg font-semibold text-white">Total:</span>
              <span className="text-2xl font-bold text-white">${total.toFixed(2)}</span>
            </div>
            <div className="flex gap-3">
              <button
                onClick={clearCart}
                disabled={isProcessing || isSyncing}
                className="flex-1 py-3 border border-slate-600 text-slate-300 rounded-lg hover:bg-slate-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                Clear Cart
              </button>
              <button
                onClick={handleCheckout}
                disabled={isProcessing || isSyncing}
                className="flex-1 py-3 bg-sky-500 text-white rounded-lg hover:bg-sky-400 font-semibold disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                Checkout
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
