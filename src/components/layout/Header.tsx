"use client";

import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { useAuth } from "@/components/providers/AuthProvider";
import { useCart } from "@/components/providers/CartProvider";
import { useUI } from "@/components/providers/UIProvider";
import LanguageSwitcher from "@/components/ui/LanguageSwitcher";
import { useState, useEffect } from "react";

interface NavItem {
  href: string;
  label: string;
  children?: { href: string; label: string }[];
}

export default function Header() {
  const { user, logout, loading: authLoading } = useAuth();
  const { items } = useCart();
  const { openLogin, openCart } = useUI();
  const [mounted, setMounted] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [openDropdown, setOpenDropdown] = useState<string | null>(null);

  useEffect(() => {
    setMounted(true);
  }, []);

  const cartCount = mounted ? items.reduce((sum, item) => sum + item.quantity, 0) : 0;

  const navLinks: NavItem[] = [
    { href: "/", label: "Home" },
    { href: "/plans", label: "Plans" },
    { href: "/blog", label: "Blog" },
    ...(mounted && user ? [{ href: "/orders", label: "My Orders" }] : []),
    ...(mounted && user?.role === "admin" ? [{ href: "/admin", label: "Admin", children: [
      { href: "/admin/plans", label: "Manage Plans" },
      { href: "/admin/orders", label: "Manage Orders" },
      { href: "/admin/blog", label: "Manage Blog" },
    ] }] : []),
  ];

  return (
    <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-slate-200 shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        <Link href="/" className="flex items-center gap-2">
          <div className="w-10 h-10 rounded-xl bg-orange-500 flex items-center justify-center">
            <span className="text-xl">🌍</span>
          </div>
          <span className="text-xl font-bold text-slate-800 tracking-tight">
            OpenWorld <span className="text-orange-500">eSIM</span>
          </span>
        </Link>

        <nav className="hidden md:flex items-center gap-6 text-sm font-medium text-slate-600">
          {navLinks.map((link) => (
            <div key={link.href} className="relative group">
              {link.children && link.children.length > 0 ? (
                <>
                  <button
                    onMouseEnter={() => setOpenDropdown(link.href)}
                    onMouseLeave={() => setOpenDropdown(null)}
                    className="flex items-center gap-1 hover:text-orange-500 transition-colors py-4"
                  >
                    {link.label}
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                    </svg>
                  </button>
                  <AnimatePresence>
                    {openDropdown === link.href && (
                      <motion.div
                        initial={{ opacity: 0, y: -10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -10 }}
                        onMouseEnter={() => setOpenDropdown(link.href)}
                        onMouseLeave={() => setOpenDropdown(null)}
                        className="absolute top-full left-0 mt-1 w-48 bg-white border border-slate-200 rounded-xl shadow-xl py-2 z-50"
                      >
                        {link.children.map((child) => (
                          <Link
                            key={child.href}
                            href={child.href}
                            className="block px-4 py-2 text-slate-600 hover:text-orange-500 hover:bg-orange-50 transition-colors"
                          >
                            {child.label}
                          </Link>
                        ))}
                      </motion.div>
                    )}
                  </AnimatePresence>
                </>
              ) : (
                <Link href={link.href} className="hover:text-orange-500 transition-colors py-4">
                  {link.label}
                </Link>
              )}
            </div>
          ))}
        </nav>

        <div className="flex items-center gap-2">
          <LanguageSwitcher />
          
          <button onClick={openCart} className="relative text-slate-600 hover:text-orange-500 p-2">
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" />
            </svg>
            {cartCount > 0 && (
              <span className="absolute -top-1 -right-1 bg-orange-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
                {cartCount}
              </span>
            )}
          </button>

          {mounted && !authLoading && user && (
            <div className="hidden md:flex items-center gap-4">
              <span className="text-sm text-slate-600">{user.name}</span>
              <button
                onClick={() => logout()}
                className="text-sm font-medium text-slate-500 hover:text-orange-500 transition-colors"
              >
                Logout
              </button>
            </div>
          )}

          {mounted && !authLoading && !user && (
            <motion.button 
              onClick={openLogin}
              className="hidden md:block bg-orange-500 hover:bg-orange-600 text-white text-sm font-semibold px-4 py-2 rounded-lg transition-colors"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              Login
            </motion.button>
          )}

          {/* Mobile Menu Button */}
          <button 
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="md:hidden text-slate-600 hover:text-orange-500 p-2"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              {mobileMenuOpen ? (
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              ) : (
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              )}
            </svg>
          </button>
        </div>
      </div>

      {/* Mobile Menu */}
      <AnimatePresence>
        {mobileMenuOpen && (
          <motion.div
            className="md:hidden bg-white border-t border-slate-200"
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
          >
            <div className="px-4 py-4 space-y-3">
              {navLinks.map((link) => (
                <div key={link.href}>
                  {link.children && link.children.length > 0 ? (
                    <details className="group">
                      <summary className="flex items-center justify-between py-2 text-slate-600 hover:text-orange-500 font-medium cursor-pointer list-none">
                        <span>{link.label}</span>
                        <svg className="w-4 h-4 group-open:rotate-180 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                        </svg>
                      </summary>
                      <div className="pl-4 space-y-2 mt-2">
                        {link.children.map((child) => (
                          <Link
                            key={child.href}
                            href={child.href}
                            onClick={() => setMobileMenuOpen(false)}
                            className="block py-2 text-slate-500 hover:text-orange-500 font-medium"
                          >
                            {child.label}
                          </Link>
                        ))}
                      </div>
                    </details>
                  ) : (
                    <Link
                      key={link.href}
                      href={link.href}
                      onClick={() => setMobileMenuOpen(false)}
                      className="block py-2 text-slate-600 hover:text-orange-500 font-medium"
                    >
                      {link.label}
                    </Link>
                  )}
                </div>
              ))}
              
              {mounted && !authLoading && !user && (
                <button
                  onClick={() => {
                    setMobileMenuOpen(false);
                    openLogin();
                  }}
                  className="w-full bg-orange-500 hover:bg-orange-600 text-white font-semibold px-4 py-3 rounded-lg transition-colors"
                >
                  Login
                </button>
              )}

              {mounted && !authLoading && user && (
                <button
                  onClick={() => {
                    logout();
                    setMobileMenuOpen(false);
                  }}
                  className="w-full bg-slate-200 hover:bg-slate-300 text-slate-700 font-semibold px-4 py-3 rounded-lg transition-colors"
                >
                  Logout
                </button>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
}
