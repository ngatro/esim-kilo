"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { useAuth } from "@/components/providers/AuthProvider";
import { useCart } from "@/components/providers/CartProvider";
import { useUI } from "@/components/providers/UIProvider";
import { useI18n, SUPPORTED_LOCALES } from "@/components/providers/I18nProvider";
import { useState, useEffect } from "react";

const HOT_COUNTRIES = [
  { code: "JP", name: "Japan", emoji: "🇯🇵" },
  { code: "KR", name: "Korea", emoji: "🇰🇷" },
  { code: "TH", name: "Thailand", emoji: "🇹🇭" },
  { code: "SG", name: "Singapore", emoji: "🇸🇬" },
  { code: "VN", name: "Vietnam", emoji: "🇻🇳" },
  { code: "US", name: "USA", emoji: "🇺🇸" },
  { code: "GB", name: "UK", emoji: "🇬🇧" },
  { code: "FR", name: "France", emoji: "🇫🇷" },
  { code: "DE", name: "Germany", emoji: "🇩🇪" },
];

const REGIONS = [
  { id: "asia", name: "Asia", emoji: "🌏" },
  { id: "europe", name: "Europe", emoji: "🏰" },
  { id: "americas", name: "Americas", emoji: "🌎" },
  { id: "oceania", name: "Oceania", emoji: "🌴" },
  { id: "global", name: "Global", emoji: "🌐" },
];

export default function Header() {
  const { t, locale, setLocale } = useI18n();
  const router = useRouter();
  const { user, logout, loading: authLoading } = useAuth();
  const { items } = useCart();
  const { openLogin } = useUI();
  const [mounted, setMounted] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [activeDropdown, setActiveDropdown] = useState<string | null>(null);

  useEffect(() => {
    setMounted(true);
  }, []);

  const handleLanguageChange = (newLocale: string) => {
    setLocale(newLocale as typeof locale);
    router.refresh();
  };

  const currentLocaleLabel = SUPPORTED_LOCALES.find(l => l.code === locale)?.code.toUpperCase() || "EN";

  const cartCount = mounted ? items.reduce((sum, item) => sum + item.quantity, 0) : 0;

  const navItems = [
    { 
      label: t("common.home"), 
      href: "/",
      children: null 
    },
    { 
      label: t("common.plans"), 
      href: "/plans",
      children: [
        { label: t("header.allPlans"), href: "/plans" },
        { label: "divider", href: "" },
        { label: t("header.popularRegions"), href: "", children: REGIONS.map(r => ({ label: r.name, href: `/plans?regionId=${r.id}`, emoji: r.emoji })) },
        { label: t("header.hotCountries"), href: "", children: HOT_COUNTRIES.map(c => ({ label: c.name, href: `/plans?countryId=${c.code}`, emoji: c.emoji })) },
      ]
    },
    { 
      label: t("header.devices"), 
      href: "/compatibility",
      children: null
    },
    { 
      label: t("common.blog"), 
      href: "/blog",
      children: null 
    },
    { 
      label: t("header.support"), 
      href: "/support",
      children: null 
    },
  ];

  const userItems = mounted && user ? [
    { label: t("header.myOrders"), href: "/orders", children: null },
    ...(user.role === "admin" ? [{ label: t("common.admin"), href: "/admin", children: null }] : []),
  ] : [];

  const allItems = [...navItems, ...userItems];

  return (
    <header className="sticky top-0 z-50 bg-white border-b border-slate-100">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-lg bg-orange-500 flex items-center justify-center">
              <svg className="w-5 h-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M21 12a9 9 0 01-9 9m9-9a9 9 0 00-9-9m9 9H3m9 9a9 9 0 01-9-9m9 9c1.657 0 3-4.03 3-9s-1.343-9-3-9m0 18c-1.657 0-3-4.03-3-9s1.343-9 3-9m-9 9a9 9 0 019-9" />
              </svg>
            </div>
            <span className="text-lg font-semibold text-slate-800">
              OpenWorld<span className="text-orange-500">eSIM</span>
            </span>
          </Link>

          {/* Desktop Nav with Dropdown */}
          <nav className="hidden md:flex items-center gap-1">
            {allItems.map((item) => (
              <div 
                key={item.href} 
                className="relative"
                onMouseEnter={() => item.children && setActiveDropdown(item.href)}
                onMouseLeave={() => setActiveDropdown(null)}
              >
                {item.children ? (
                  <button className="flex items-center gap-1 px-3 py-2 text-sm font-medium text-slate-600 hover:text-orange-500 transition-colors">
                    {item.label}
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
                    </svg>
                  </button>
                ) : (
                  <Link href={item.href} className="px-3 py-2 text-sm font-medium text-slate-600 hover:text-orange-500 transition-colors">
                    {item.label}
                  </Link>
                )}

                {/* Dropdown */}
                <AnimatePresence>
                  {item.children && activeDropdown === item.href && (
                    <motion.div
                      initial={{ opacity: 0, y: -5 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -5 }}
                      className={`absolute top-full left-0 mt-1 bg-white border border-slate-200 rounded-xl shadow-lg py-2 z-50 ${
                        item.href === "/plans" ? "w-[480px]" : "w-56"
                      }`}
                    >
                      {item.href === "/plans" ? (
                        <div className="grid grid-cols-2 gap-4 px-4">
                          <div>
                            <p className="text-xs font-semibold text-slate-400 uppercase mb-2">{t("header.popularRegions")}</p>
                            <div className="space-y-0.5">
                              {REGIONS.map((r, idx) => (
                                <Link
                                  key={idx}
                                  href={`/plans?regionId=${r.id}`}
                                  className="flex items-center gap-2 py-1.5 text-sm text-slate-600 hover:text-orange-500 transition-colors"
                                >
                                  {r.emoji && <span>{r.emoji}</span>}
                                  {r.name}
                                </Link>
                              ))}
                            </div>
                          </div>
                          <div>
                            <p className="text-xs font-semibold text-slate-400 uppercase mb-2">{t("header.hotCountries")}</p>
                            <div className="space-y-0.5">
                              {HOT_COUNTRIES.map((c, idx) => (
                                <Link
                                  key={idx}
                                  href={`/plans?countryId=${c.code}`}
                                  className="flex items-center gap-2 py-1.5 text-sm text-slate-600 hover:text-orange-500 transition-colors"
                                >
                                  {c.emoji && <span>{c.emoji}</span>}
                                  {c.name}
                                </Link>
                              ))}
                            </div>
                          </div>
                        </div>
                      ) : (
                        item.children.map((child, idx) => (
                          child.label === "divider" ? (
                            <div key={idx} className="my-1 border-t border-slate-100" />
                          ) : child.children ? (
                            <div key={idx} className="px-4 py-1">
                              <p className="text-xs font-semibold text-slate-400 uppercase mb-1">{child.label}</p>
                              <div className="space-y-0.5">
                                {child.children.map((sub: { label: string; href: string; emoji?: string }, subIdx: number) => (
                                  <Link
                                    key={subIdx}
                                    href={sub.href}
                                    className="flex items-center gap-2 py-1.5 text-sm text-slate-600 hover:text-orange-500 transition-colors"
                                  >
                                    {sub.emoji && <span>{sub.emoji}</span>}
                                    {sub.label}
                                  </Link>
                                ))}
                              </div>
                            </div>
                          ) : (
                            <Link
                              key={idx}
                              href={child.href}
                              className="block px-4 py-2 text-sm text-slate-600 hover:text-orange-500 hover:bg-orange-50 transition-colors"
                            >
                              {child.label}
                            </Link>
                          )
                        ))
                      )}
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            ))}
          </nav>

          {/* Right Side */}
          <div className="flex items-center gap-2">
            {/* Language Selector */}
            <div className="relative group">
              <button className="flex items-center gap-1 px-2 py-1.5 text-sm text-slate-600 hover:text-orange-500 transition-colors">
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M21 12a9 9 0 01-9 9m9-9a9 9 0 00-9-9m9 9H3m9 9a9 9 0 01-9-9m9 9c1.657 0 3-4.03 3-9s-1.343-9-3-9m0 18c-1.657 0-3-4.03-3-9s1.343-9 3-9m-9 9a9 9 0 019-9" />
                </svg>
                <span className="text-xs">{currentLocaleLabel}</span>
                <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
                </svg>
              </button>
              <div className="absolute right-0 top-full mt-1 bg-white border border-slate-200 rounded-lg shadow-lg py-1 z-50 hidden group-hover:block min-w-[140px]">
                {SUPPORTED_LOCALES.map((l) => (
                  <button
                    key={l.code}
                    onClick={() => handleLanguageChange(l.code)}
                    className={`w-full text-left px-4 py-2 text-sm hover:bg-orange-50 hover:text-orange-500 flex items-center gap-2 ${locale === l.code ? "text-orange-500 bg-orange-50" : "text-slate-600"}`}
                  >
                    <span>{l.flag}</span>
                    <span>{l.label}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Cart */}
            <Link href="/checkout" className="relative p-2 text-slate-600 hover:text-orange-500 transition-colors">
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
              </svg>
              {cartCount > 0 && (
                <span className="absolute -top-0.5 -right-0.5 bg-orange-500 text-white text-[10px] font-bold rounded-full h-4 w-4 flex items-center justify-center">
                  {cartCount}
                </span>
              )}
            </Link>

            {/* Auth */}
            {mounted && authLoading ? (
              <div className="hidden md:flex items-center gap-2">
                <div className="w-8 h-8 bg-slate-100 rounded-lg animate-pulse" />
              </div>
            ) : mounted && !authLoading && user ? (
              <div className="hidden md:flex items-center gap-4">
                <Link href="/profile" className="text-sm text-slate-600 hover:text-orange-500 transition-colors">Profile</Link>
                <Link href="/orders" className="text-sm text-slate-600 hover:text-orange-500 transition-colors">{t("header.myOrders")}</Link>
                <button
                  onClick={() => logout()}
                  className="text-sm font-medium text-slate-400 hover:text-orange-500 transition-colors"
                >
                  {t("header.logout")}
                </button>
              </div>
            ) : mounted && !authLoading && !user ? (
              <button 
                onClick={openLogin}
                className="hidden md:flex items-center gap-1.5 bg-orange-500 hover:bg-orange-600 text-white text-sm font-medium px-4 py-2 rounded-lg transition-colors"
              >
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                </svg>
                {t("header.login")}
              </button>
            ) : null}

            {/* Mobile Menu Toggle */}
            <button 
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="md:hidden p-2 text-slate-600"
            >
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                {mobileMenuOpen ? (
                  <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                ) : (
                  <path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M4 12h16M4 18h16" />
                )}
              </svg>
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu */}
      <AnimatePresence>
        {mobileMenuOpen && (
          <motion.div
            className="md:hidden bg-white border-t border-slate-100"
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
          >
            <div className="px-4 py-4 space-y-2">
              {navItems.map((item) => (
                <div key={item.href}>
                  {item.children ? (
                    <details className="group">
                      <summary className="flex items-center justify-between py-2.5 text-slate-600 font-medium cursor-pointer list-none">
                        <span>{item.label}</span>
                        <svg className="w-4 h-4 group-open:rotate-180 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                        </svg>
                      </summary>
                      <div className="pl-4 space-y-1 mt-1">
                        {item.children.filter(c => c.label !== "divider").map((child, idx) => (
                          <div key={idx}>
                            {child.children ? (
                              <div className="py-1">
                                <p className="text-xs font-semibold text-slate-400 uppercase mb-1">{child.label}</p>
                                {child.children.map((sub: { label: string; href: string; emoji?: string }, subIdx: number) => (
                                  <Link
                                    key={subIdx}
                                    href={sub.href}
                                    onClick={() => setMobileMenuOpen(false)}
                                    className="flex items-center gap-2 py-1.5 text-sm text-slate-500"
                                  >
                                    {sub.emoji} {sub.label}
                                  </Link>
                                ))}
                              </div>
                            ) : (
                              <Link
                                href={child.href}
                                onClick={() => setMobileMenuOpen(false)}
                                className="block py-1.5 text-sm text-slate-500"
                              >
                                {child.label}
                              </Link>
                            )}
                          </div>
                        ))}
                      </div>
                    </details>
                  ) : (
                    <Link
                      href={item.href}
                      onClick={() => setMobileMenuOpen(false)}
                      className="block py-2.5 text-slate-600 font-medium"
                    >
                      {item.label}
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
                  className="w-full py-2.5 text-left text-slate-600 font-medium"
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
                  className="w-full py-2.5 text-left text-slate-600 font-medium"
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