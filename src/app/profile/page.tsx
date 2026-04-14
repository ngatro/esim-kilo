"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useUI } from "@/components/providers/UIProvider";
import { useAuth } from "@/components/providers/AuthProvider";
import { useI18n } from "@/components/providers/I18nProvider";
import Footer from "@/components/layout/Footer";

interface Order {
  id: number;
  totalAmount: number;
  currency: string;
  status: string;
  createdAt: string;
}

export default function ProfilePage() {
  const { t } = useI18n();
  const { user, loading: authLoading, refreshUser } = useAuth();
  const { openLogin } = useUI();
  
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);
  const [success, setSuccess] = useState("");
  
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [passwordError, setPasswordError] = useState("");
  const [passwordSuccess, setPasswordSuccess] = useState("");
  const [changingPassword, setChangingPassword] = useState(false);

  useEffect(() => {
    if (!authLoading && !user) {
      openLogin();
    }
    if (user) {
      setName(user.name);
      setEmail(user.email);
      fetchOrders();
    }
  }, [user, authLoading]);

  async function fetchOrders() {
    try {
      const res = await fetch("/api/orders");
      if (res.ok) {
        const data = await res.json();
        setOrders(data.orders || []);
      }
    } catch (error) {
      console.error("Failed to fetch orders:", error);
    } finally {
      setLoading(false);
    }
  }

  async function handleUpdateProfile(e: React.FormEvent) {
    e.preventDefault();
    setUpdating(true);
    setSuccess("");

    try {
      const res = await fetch("/api/auth/profile", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, email }),
      });
      const data = await res.json();

      if (res.ok) {
        setSuccess(t("profileUpdated"));
        refreshUser();
      } else {
        setSuccess("");
      }
    } catch (error) {
      console.error("Failed to update profile:", error);
    } finally {
      setUpdating(false);
    }
  }

  async function handleChangePassword(e: React.FormEvent) {
    e.preventDefault();
    setPasswordError("");
    setPasswordSuccess("");
    setChangingPassword(true);

    if (newPassword !== confirmPassword) {
      setPasswordError(t("passwordMismatch"));
      setChangingPassword(false);
      return;
    }

    if (newPassword.length < 6) {
      setPasswordError("Password must be at least 6 characters");
      setChangingPassword(false);
      return;
    }

    try {
      const res = await fetch("/api/auth/change-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ currentPassword, newPassword }),
      });
      const data = await res.json();

      if (res.ok) {
        setPasswordSuccess(t("passwordUpdated"));
        setCurrentPassword("");
        setNewPassword("");
        setConfirmPassword("");
      } else {
        setPasswordError(data.error || t("incorrectPassword"));
      }
    } catch (error) {
      setPasswordError("Something went wrong");
    } finally {
      setChangingPassword(false);
    }
  }

  if (authLoading || !user) {
    return (
      <>
        <div className="min-h-screen bg-slate-50 flex items-center justify-center">
          <div className="animate-spin h-8 w-8 border-4 border-orange-500 border-t-transparent rounded-full"></div>
        </div>
        <Footer />
      </>
    );
  }

  return (
    <>
      <div className="min-h-screen bg-slate-50 py-12">
        <div className="max-w-4xl mx-auto px-4">
          <h1 className="text-3xl font-bold text-slate-800 mb-2">{t("title")}</h1>
          <p className="text-slate-500 mb-8">{t("subtitle")}</p>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="md:col-span-2 space-y-6">
              <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6">
                <h2 className="text-xl font-semibold text-slate-800 mb-4">{t("info")}</h2>
                
                {success && (
                  <div className="bg-green-50 border border-green-200 text-green-600 px-4 py-3 rounded-xl mb-4">
                    {success}
                  </div>
                )}

                <form onSubmit={handleUpdateProfile}>
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-slate-600 mb-1.5">{t("name")}</label>
                      <input
                        type="text"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        className="w-full px-4 py-3 border border-slate-200 rounded-xl text-slate-800 focus:outline-none focus:border-orange-400"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-slate-600 mb-1.5">{t("email")}</label>
                      <input
                        type="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        className="w-full px-4 py-3 border border-slate-200 rounded-xl text-slate-800 focus:outline-none focus:border-orange-400"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-slate-600 mb-1.5">{t("role")}</label>
                      <input
                        type="text"
                        value={user.role === "admin" ? t("admin") : t("user")}
                        disabled
                        className="w-full px-4 py-3 border border-slate-200 rounded-xl text-slate-400 bg-slate-50"
                      />
                    </div>
                  </div>
                  <button
                    type="submit"
                    disabled={updating}
                    className="mt-4 bg-orange-500 hover:bg-orange-600 disabled:bg-slate-300 text-white font-semibold py-3 px-6 rounded-xl transition-colors"
                  >
                    {updating ? t("loading") : t("updateProfile")}
                  </button>
                </form>
              </div>

              <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6">
                <h2 className="text-xl font-semibold text-slate-800 mb-4">{t("changingPassword")}</h2>
                
                {passwordError && (
                  <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-xl mb-4">
                    {passwordError}
                  </div>
                )}
                
                {passwordSuccess && (
                  <div className="bg-green-50 border border-green-200 text-green-600 px-4 py-3 rounded-xl mb-4">
                    {passwordSuccess}
                  </div>
                )}

                <form onSubmit={handleChangePassword}>
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-slate-600 mb-1.5">{t("currentPassword")}</label>
                      <input
                        type="password"
                        value={currentPassword}
                        onChange={(e) => setCurrentPassword(e.target.value)}
                        className="w-full px-4 py-3 border border-slate-200 rounded-xl text-slate-800 focus:outline-none focus:border-orange-400"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-slate-600 mb-1.5">{t("newPassword")}</label>
                      <input
                        type="password"
                        value={newPassword}
                        onChange={(e) => setNewPassword(e.target.value)}
                        className="w-full px-4 py-3 border border-slate-200 rounded-xl text-slate-800 focus:outline-none focus:border-orange-400"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-slate-600 mb-1.5">{t("confirmPassword")}</label>
                      <input
                        type="password"
                        value={confirmPassword}
                        onChange={(e) => setConfirmPassword(e.target.value)}
                        className="w-full px-4 py-3 border border-slate-200 rounded-xl text-slate-800 focus:outline-none focus:border-orange-400"
                      />
                    </div>
                  </div>
                  <button
                    type="submit"
                    disabled={changingPassword}
                    className="mt-4 bg-orange-500 hover:bg-orange-600 disabled:bg-slate-300 text-white font-semibold py-3 px-6 rounded-xl transition-colors"
                  >
                    {changingPassword ? t("loading") : t("changePassword")}
                  </button>
                </form>
              </div>
            </div>

            <div>
              <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6">
                <h2 className="text-xl font-semibold text-slate-800 mb-4">{t("orderHistory")}</h2>
                
                {loading ? (
                  <div className="animate-pulse space-y-3">
                    <div className="h-20 bg-slate-100 rounded-xl"></div>
                    <div className="h-20 bg-slate-100 rounded-xl"></div>
                  </div>
                ) : orders.length === 0 ? (
                  <p className="text-slate-500 text-sm">{t("noOrders")}</p>
                ) : (
                  <div className="space-y-3">
                    {orders.slice(0, 5).map((order) => (
                      <Link
                        key={order.id}
                        href={`/orders/${order.id}`}
                        className="block p-3 border border-slate-100 rounded-xl hover:border-orange-200 transition-colors"
                      >
                        <div className="flex justify-between items-center mb-1">
                          <span className="text-sm font-medium text-slate-700">#{10000 + order.id}</span>
                          <span className={`text-xs px-2 py-0.5 rounded-full ${
                            order.status === "completed" ? "bg-green-100 text-green-700" :
                            order.status === "pending" ? "bg-yellow-100 text-yellow-700" :
                            "bg-slate-100 text-slate-700"
                          }`}>
                            {order.status}
                          </span>
                        </div>
                        <div className="text-sm text-slate-500">
                          ${order.totalAmount.toFixed(2)} · {new Date(order.createdAt).toLocaleDateString()}
                        </div>
                      </Link>
                    ))}
                    {orders.length > 5 && (
                      <Link href="/orders" className="block text-center text-sm text-orange-500 hover:text-orange-600 mt-2">
                        {t("viewAll")} ({orders.length})
                      </Link>
                    )}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
      <Footer />
    </>
  );
}