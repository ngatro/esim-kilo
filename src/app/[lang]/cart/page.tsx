"use client";

import Link from "next/link";
import { useCart } from "@/components/providers/CartProvider";
import { useI18n } from "@/components/providers/I18nProvider";

export default function CartPage() {
  const { locale } = useI18n();
  const { items, removeItem, updateQuantity, total, clearCart } = useCart();

  if (items.length === 0) {
    return (
      <div className="min-h-screen bg-orange-50 py-12">
        <div className="max-w-4xl mx-auto px-4">
          <h1 className="text-3xl font-bold text-slate-800 mb-8">Shopping Cart</h1>
          <div className="bg-white rounded-lg shadow-sm p-12 text-center">
            <p className="text-slate-600 mb-4">Your cart is empty</p>
            <Link href={`/${locale}`} className="inline-block bg-orange-500 text-white px-6 py-3 rounded-lg hover:bg-orange-400">
              Continue Shopping
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-orange-50 py-12">
      <div className="max-w-4xl mx-auto px-4">
        <h1 className="text-3xl font-bold text-slate-800 mb-8">Shopping Cart</h1>
        
        <div className="bg-white rounded-lg shadow-sm overflow-hidden">
          <div className="divide-y divide-slate-200">
            {items.map((item) => (
              <div key={item.id} className="p-6 flex items-center justify-between">
                <div className="flex-1">
                  <h3 className="text-lg font-medium text-slate-800">{item.planName}</h3>
                  <p className="text-slate-600">${item.price} each</p>
                </div>
                
                <div className="flex items-center gap-4">
                  <div className="flex items-center border border-slate-200 rounded-md">
                    <button
                      onClick={() => updateQuantity(item.id, item.quantity - 1)}
                      className="px-3 py-1 text-slate-600 hover:bg-slate-100"
                    >
                      -
                    </button>
                    <span className="px-3 py-1 text-slate-800">{item.quantity}</span>
                    <button
                      onClick={() => updateQuantity(item.id, item.quantity + 1)}
                      className="px-3 py-1 text-slate-600 hover:bg-slate-100"
                    >
                      +
                    </button>
                  </div>
                  
                  <p className="text-lg font-medium text-slate-800 w-24 text-right">
                    ${item.price * item.quantity}
                  </p>
                  
                  <button
                    onClick={() => removeItem(item.id)}
                    className="text-red-500 hover:text-red-400"
                  >
                    Remove
                  </button>
                </div>
              </div>
            ))}
          </div>
          
          <div className="p-6 bg-slate-50 border-t border-slate-200">
            <div className="flex justify-between items-center mb-4">
              <span className="text-xl font-bold text-slate-800">Total:</span>
              <span className="text-2xl font-bold text-slate-800">${total}</span>
            </div>
            
            <div className="flex gap-4">
              <button
                onClick={clearCart}
                className="px-6 py-3 border border-slate-200 text-slate-600 rounded-lg hover:bg-slate-100"
              >
                Clear Cart
              </button>
              <Link href={`/${locale}/checkout`} className="flex-1">
                <button className="w-full px-6 py-3 bg-orange-500 text-white rounded-lg hover:bg-orange-400">
                  Proceed to Checkout
                </button>
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
