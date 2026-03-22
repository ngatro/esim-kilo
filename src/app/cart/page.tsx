"use client";

import Link from "next/link";
import { useCart } from "@/components/providers/CartProvider";

export default function CartPage() {
  const { items, removeItem, updateQuantity, total, clearCart } = useCart();

  if (items.length === 0) {
    return (
      <div className="min-h-screen bg-slate-900 py-12">
        <div className="max-w-4xl mx-auto px-4">
          <h1 className="text-3xl font-bold text-white mb-8">Shopping Cart</h1>
          <div className="bg-slate-800 rounded-lg shadow-sm p-12 text-center">
            <p className="text-slate-400 mb-4">Your cart is empty</p>
            <Link href="/" className="inline-block bg-sky-600 text-white px-6 py-3 rounded-lg hover:bg-sky-700">
              Continue Shopping
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-900 py-12">
      <div className="max-w-4xl mx-auto px-4">
        <h1 className="text-3xl font-bold text-white mb-8">Shopping Cart</h1>
        
        <div className="bg-slate-800 rounded-lg shadow-sm overflow-hidden">
          <div className="divide-y divide-slate-700">
            {items.map((item) => (
              <div key={item.id} className="p-6 flex items-center justify-between">
                <div className="flex-1">
                  <h3 className="text-lg font-medium text-white">{item.planName}</h3>
                  <p className="text-slate-400">${item.price} each</p>
                </div>
                
                <div className="flex items-center gap-4">
                  <div className="flex items-center border border-slate-600 rounded-md">
                    <button
                      onClick={() => updateQuantity(item.id, item.quantity - 1)}
                      className="px-3 py-1 text-slate-300 hover:bg-slate-700"
                    >
                      -
                    </button>
                    <span className="px-3 py-1 text-white">{item.quantity}</span>
                    <button
                      onClick={() => updateQuantity(item.id, item.quantity + 1)}
                      className="px-3 py-1 text-slate-300 hover:bg-slate-700"
                    >
                      +
                    </button>
                  </div>
                  
                  <p className="text-lg font-medium text-white w-24 text-right">
                    ${item.price * item.quantity}
                  </p>
                  
                  <button
                    onClick={() => removeItem(item.id)}
                    className="text-red-400 hover:text-red-300"
                  >
                    Remove
                  </button>
                </div>
              </div>
            ))}
          </div>
          
          <div className="p-6 bg-slate-900 border-t border-slate-700">
            <div className="flex justify-between items-center mb-4">
              <span className="text-xl font-bold text-white">Total:</span>
              <span className="text-2xl font-bold text-white">${total}</span>
            </div>
            
            <div className="flex gap-4">
              <button
                onClick={clearCart}
                className="px-6 py-3 border border-slate-600 text-slate-300 rounded-lg hover:bg-slate-800"
              >
                Clear Cart
              </button>
              <Link href="/checkout" className="flex-1">
                <button className="w-full px-6 py-3 bg-sky-600 text-white rounded-lg hover:bg-sky-700">
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
