"use client";

import Link from "next/link";
import { useAuth } from "@/components/providers/AuthProvider";
import { useCart } from "@/components/providers/CartProvider";
import LanguageSwitcher from "@/components/ui/LanguageSwitcher";

export default function Header() {
  const { user, logout } = useAuth();
  const { items } = useCart();
  const cartCount = items.reduce((sum, item) => sum + item.quantity, 0);

  return (
    <header className="sticky top-0 z-50 bg-slate-900/90 backdrop-blur-md border-b border-slate-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        <Link href="/" className="flex items-center gap-2">
          <span className="text-2xl">📡</span>
          <span className="text-xl font-bold text-white tracking-tight">
            Sim<span className="text-sky-400">Pal</span>
          </span>
        </Link>

        <nav className="hidden md:flex items-center gap-8 text-sm font-medium text-slate-400">
          <Link href="/" className="hover:text-white transition-colors">Home</Link>
          <Link href="/#plans" className="hover:text-white transition-colors">Plans</Link>
          <Link href="/#how-it-works" className="hover:text-white transition-colors">How It Works</Link>
          {user && (
            <Link href="/orders" className="hover:text-white transition-colors">My Orders</Link>
          )}
          {user?.role === "admin" && (
            <Link href="/admin" className="hover:text-white transition-colors">Admin</Link>
          )}
        </nav>

        <div className="flex items-center gap-4">
          <LanguageSwitcher />
          
          <Link href="/cart" className="relative text-slate-300 hover:text-white">
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" />
            </svg>
            {cartCount > 0 && (
              <span className="absolute -top-2 -right-2 bg-sky-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
                {cartCount}
              </span>
            )}
          </Link>

          {user ? (
            <div className="flex items-center gap-4">
              <span className="text-sm text-slate-300">{user.name}</span>
              <button
                onClick={() => logout()}
                className="text-sm font-medium text-slate-300 hover:text-white transition-colors"
              >
                Logout
              </button>
            </div>
          ) : (
            <div className="flex items-center gap-3">
              <Link href="/login" className="text-sm font-medium text-slate-300 hover:text-white transition-colors">
                Login
              </Link>
              <Link href="/register" className="bg-sky-500 hover:bg-sky-400 text-white text-sm font-semibold px-4 py-2 rounded-lg transition-colors">
                Register
              </Link>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
