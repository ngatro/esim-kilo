"use client";

import Link from "next/link";
import { useAuth } from "@/components/providers/AuthProvider";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";

interface Plan {
  id: string;
  name: string;
  packageCode: string;
  destination: string;
  dataAmount: number;
  durationDays: number;
  priceUsd: number;
  regionName: string | null;
  countryName: string | null;
}

interface User {
  id: number;
  name: string | null;
  email: string;
  role: string;
}

interface OrderItem {
  id: number;
  planId: string | null;
  planName: string;
  price: number;
  quantity: number;
  esimIccid: string | null;
  esimEid: string | null;
  esimTranNo: string | null;
  esimQrCode: string | null;
  esimQrImage: string | null;
  esimLpaString: string | null;
  activationCode: string | null;
  totalVolume: number | null;
  smdpStatus: string | null;
  esimStatus: string | null;
  orderUsage: number | null;
  enabledAt: string | null;
  plan?: { name: string; packageCode: string } | null;
}

function getEsimStatusLabel(item: OrderItem): { label: string; color: string } {
  if (item.esimStatus === "USED_UP" || item.esimStatus === "USED_EXPIRED") return { label: "Depleted", color: "text-red-400" };
  if (item.esimStatus === "CANCEL" || item.esimStatus === "REVOKED") return { label: "Terminated", color: "text-slate-500" };

  if (item.smdpStatus === "ENABLED" || item.esimStatus === "IN_USE") {
    return { label: "In Use", color: "text-green-400" };
  }

  if (item.smdpStatus === "DOWNLOAD" || item.smdpStatus === "INSTALLATION") {
    return { label: "Installing...", color: "text-sky-400" };
  }

  if (item.esimStatus === "GOT_RESOURCE") {
    return { label: "Ready to Scan", color: "text-yellow-400" };
  }
  
  if (item.esimQrImage || item.esimIccid) {
    return { label: "Issued", color: "text-yellow-400/80" };
  }

  return { label: "Processing", color: "text-slate-400" };
}

function formatBytes(bytes: number | null): string {
  if (!bytes || bytes === 0) return "0 B";
  const k = 1024;
  const sizes = ["B", "KB", "MB", "GB", "TB"];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i];
}

interface Order {
  id: number;
  totalAmount: number;
  currency: string;
  status: string;
  customerName: string | null;
  customerEmail: string | null;
  esimaccessOrderId: string | null;
  esimaccessOrderStatus: string | null;
  createdAt: string;
  orderItems: OrderItem[];
  user?: { name: string; email: string } | null;
}

export default function AdminOrdersPage() {
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [expandedOrder, setExpandedOrder] = useState<number | null>(null);
  const [activating, setActivating] = useState<number | null>(null);
  const [syncing, setSyncing] = useState<number | null>(null);
  const [statusFilter, setStatusFilter] = useState("");
  const [showGiftModal, setShowGiftModal] = useState(false);
  const [giftLoading, setGiftLoading] = useState(false);
  const [giftForm, setGiftForm] = useState({
    userId: "",
    userEmail: "",
    packageCode: "",
    quantity: 1,
    customerName: "",
  });
  const [userSearch, setUserSearch] = useState("");
  const [userResults, setUserResults] = useState<User[]>([]);
  const [searchingUsers, setSearchingUsers] = useState(false);

  useEffect(() => {
    if (!authLoading && (!user || user.role !== "admin")) router.push("/");
  }, [user, authLoading, router]);

  useEffect(() => {
    if (user?.role === "admin") {
      fetchOrders();
    }
  }, [user, statusFilter]);

  async function fetchOrders() {
    try {
      const params = statusFilter ? `?status=${statusFilter}` : "";
      const res = await fetch(`/api/admin/orders${params}`);
      const data = await res.json();
      setOrders(data.orders || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }

  async function activateEsim(orderItemId: number) {
    setActivating(orderItemId);
    try {
      const res = await fetch("/api/admin/orders", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ orderItemId }),
      });
      const data = await res.json();
      if (data.success) {
        await fetchOrders();
      }
    } catch (err) {
      console.error("Activation failed:", err);
    } finally {
      setActivating(null);
    }
  }

  async function syncEsim(orderItemId: number) {
    setSyncing(orderItemId);
    try {
      const res = await fetch("/api/admin/orders/sync", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ orderItemId }),
      });
      const data = await res.json();
      if (data.success) {
        await fetchOrders();
      }
    } catch (err) {
      console.error("Sync failed:", err);
    } finally {
      setSyncing(null);
    }
  }

  async function openGiftModal() {
    setShowGiftModal(true);
    setGiftLoading(true);
    // No longer need to fetch plans - admin will input packageCode directly
    setGiftLoading(false);
  }

  async function searchUsers(query: string) {
    setUserSearch(query);
    if (query.length < 2) {
      setUserResults([]);
      return;
    }
    setSearchingUsers(true);
    try {
      const res = await fetch(`/api/admin/users/search?search=${encodeURIComponent(query)}`);
      const data = await res.json();
      setUserResults(data.users || []);
    } catch (err) {
      console.error("User search failed:", err);
    } finally {
      setSearchingUsers(false);
    }
  }

  function selectUser(user: User) {
    setGiftForm({ ...giftForm, userId: String(user.id), userEmail: user.email, customerName: user.name || "" });
    setUserSearch(user.email);
    setUserResults([]);
  }

  async function submitGift(e: React.FormEvent) {
    e.preventDefault();
    if (!giftForm.packageCode) {
      alert("Please enter package code");
      return;
    }
    if (!giftForm.userId && !giftForm.userEmail) {
      alert("Please select or enter a user email");
      return;
    }
    setGiftLoading(true);
    try {
      const res = await fetch("/api/admin/orders/gift", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(giftForm),
      });
      const data = await res.json();
      if (data.success) {
        alert("Gift eSIM created successfully!\nICCID: " + data.esim.iccid);
        setShowGiftModal(false);
        setGiftForm({ userId: "", userEmail: "", packageCode: "", quantity: 1, customerName: "" });
        setUserSearch("");
        await fetchOrders();
      } else {
        alert("Failed: " + (data.error || "Unknown error"));
      }
    } catch (err) {
      console.error("Gift creation failed:", err);
      alert("Failed to create gift");
    } finally {
      setGiftLoading(false);
    }
  }

  if (authLoading || !user || user.role !== "admin") {
    return (
      <div className="min-h-screen bg-slate-900 flex items-center justify-center">
        <div className="animate-spin w-8 h-8 border-2 border-sky-500 border-t-transparent rounded-full" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-900 py-8 sm:py-12">
      <div className="max-w-7xl mx-auto px-3 sm:px-6">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold text-white">Orders</h1>
            <p className="text-slate-400 text-sm mt-1">{orders.length} orders</p>
          </div>
          <div className="flex gap-3 items-center">
            <button onClick={openGiftModal}
              className="bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-400 hover:to-pink-400 text-white text-sm px-4 py-2 rounded-lg font-medium transition-all flex items-center gap-2">
              🎁 Give Free Plan
            </button>
            <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)}
              className="bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-white text-sm">
              <option value="">All Status</option>
              <option value="completed">Completed</option>
              <option value="pending">Pending</option>
              <option value="refunded">Refunded</option>
            </select>
            <Link href="/admin" className="text-sky-400 hover:text-sky-300 text-sm">← Dashboard</Link>
          </div>
        </div>

        {loading ? (
          <div className="text-center py-20"><div className="animate-spin w-8 h-8 border-2 border-sky-500 border-t-transparent rounded-full mx-auto" /></div>
        ) : orders.length === 0 ? (
          <div className="text-center py-20">
            <p className="text-5xl mb-4">📦</p>
            <p className="text-slate-400">No orders yet</p>
          </div>
        ) : (
          <div className="space-y-3">
            {orders.map((order) => (
              <motion.div key={order.id} className="bg-slate-800/50 border border-slate-700/50 rounded-2xl overflow-hidden" layout>
                <button onClick={() => setExpandedOrder(expandedOrder === order.id ? null : order.id)}
                  className="w-full p-4 sm:p-5 flex items-center justify-between hover:bg-slate-800/80 transition-colors text-left">
                  <div className="flex items-center gap-3 sm:gap-4">
                    <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${
                      order.status === "completed" ? "bg-green-500/20" : "bg-yellow-500/20"
                    }`}>
                      <span className="text-lg">{order.status === "completed" ? "✅" : "⏳"}</span>
                    </div>
                    <div>
                      <p className="text-white font-semibold text-sm">Order #{order.id}</p>
                      <p className="text-slate-500 text-xs">
                        {order.customerEmail || order.customerName || "Guest"} · {new Date(order.createdAt).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3 sm:gap-4">
                    <div className="text-right">
                      <p className="text-white font-bold text-sm sm:text-base">${order.totalAmount.toFixed(2)}</p>
                      <span className={`text-[10px] px-2 py-0.5 rounded-full font-medium ${
                        order.status === "completed" ? "bg-green-500/20 text-green-400" : "bg-yellow-500/20 text-yellow-400"
                      }`}>{order.status}</span>
                    </div>
                    <svg className={`w-4 h-4 text-slate-500 transition-transform ${expandedOrder === order.id ? "rotate-180" : ""}`}
                      fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" /></svg>
                  </div>
                </button>

                <AnimatePresence>
                  {expandedOrder === order.id && (
                    <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: "auto", opacity: 1 }} exit={{ height: 0, opacity: 0 }}
                      className="overflow-hidden">
                      <div className="border-t border-slate-700/50 p-4 sm:p-5 space-y-4">
                        {/* Payment Info */}
                        <div className="bg-slate-900/50 rounded-xl p-4">
                          <h4 className="text-white font-medium text-sm mb-3">Transaction Log</h4>
                          <div className="space-y-2">
                            <div className="flex items-center gap-3 text-xs">
                              <div className="w-6 h-6 rounded-full bg-green-500/20 flex items-center justify-center text-green-400">✓</div>
                              <div className="flex-1"><p className="text-white">PayPal Payment</p><p className="text-slate-500">${order.totalAmount.toFixed(2)} - {order.esimaccessOrderId || "N/A"}</p></div>
                              <span className="text-green-400">{order.status}</span>
                            </div>
                            <div className="flex items-center gap-3 text-xs">
                              <div className={`w-6 h-6 rounded-full flex items-center justify-center ${
                                order.orderItems.some(i => i.esimQrCode || i.esimQrImage) ? "bg-green-500/20 text-green-400" : "bg-yellow-500/20 text-yellow-400"
                              }`}>{order.orderItems.some(i => i.esimQrCode || i.esimQrImage) ? "✓" : "⏳"}</div>
                              <div className="flex-1"><p className="text-white">eSIM Access</p><p className="text-slate-500">{order.orderItems[0]?.esimStatus || order.esimaccessOrderStatus || "Pending"}</p></div>
                              <span className={order.orderItems[0] ? getEsimStatusLabel(order.orderItems[0]).color : "text-slate-400"}>
                                {order.orderItems[0] ? getEsimStatusLabel(order.orderItems[0]).label : "Waiting"}
                              </span>
                            </div>
                            <div className="flex items-center gap-3 text-xs">
                              <div className={`w-6 h-6 rounded-full flex items-center justify-center ${
                                order.customerEmail ? "bg-green-500/20 text-green-400" : "bg-slate-600 text-slate-400"
                              }`}>{order.customerEmail ? "✓" : "-"}</div>
                              <div className="flex-1"><p className="text-white">Email Sent</p><p className="text-slate-500">{order.customerEmail || "No email"}</p></div>
                            </div>
                          </div>
                        </div>

                        {/* Customer Info */}
                        <div className="bg-slate-900/50 rounded-xl p-4">
                          <h4 className="text-white font-medium text-sm mb-2">Customer</h4>
                          <p className="text-slate-300 text-sm">{order.customerName || "-"}</p>
                          <p className="text-slate-400 text-xs">{order.customerEmail || "-"}</p>
                        </div>

                        {/* Order Items */}
                        {order.orderItems.map((item) => (
                          <div key={item.id} className="bg-slate-900/50 rounded-xl p-4">
                            <div className="flex items-center justify-between mb-3">
                              <div>
                                <h4 className="text-white font-medium text-sm">{item.planName}</h4>
                                <p className="text-slate-500 text-xs">${item.price.toFixed(2)} × {item.quantity}</p>
                              </div>
                              <div className="flex gap-2">
                                {(item.esimQrCode || item.esimQrImage) && (
                                  <button onClick={() => syncEsim(item.id)} disabled={syncing === item.id}
                                    className="bg-slate-700 hover:bg-slate-600 disabled:bg-slate-800 text-white text-xs px-3 py-1.5 rounded-lg font-medium transition-colors flex items-center gap-1">
                                    {syncing === item.id ? "↻" : "↻"} Sync
                                  </button>
                                )}
                                {!item.esimQrCode && !item.esimQrImage && order.status === "completed" && (
                                  <button onClick={() => activateEsim(item.id)} disabled={activating === item.id}
                                    className="bg-sky-500 hover:bg-sky-400 disabled:bg-slate-600 text-white text-xs px-3 py-1.5 rounded-lg font-medium transition-colors">
                                    {activating === item.id ? "Activating..." : "Activate eSIM"}
                                  </button>
                                )}
                              </div>
                            </div>

                            {(item.esimQrCode || item.esimQrImage) && (
                              <div className="flex flex-col sm:flex-row items-start gap-4 mt-3">
                                <div className="bg-white rounded-xl p-3 flex-shrink-0">
                                  <img src={item.esimQrImage || item.esimQrCode || ""} alt="QR" className="w-32 h-32" />
                                </div>
                                <div className="space-y-2 flex-1">
                                  {item.esimIccid && (
                                    <div><p className="text-slate-500 text-xs">ICCID</p><p className="text-sky-400 text-xs font-mono">{item.esimIccid}</p></div>
                                  )}
                                  {item.esimEid && (
                                    <div><p className="text-slate-500 text-xs">EID (Device ID)</p><p className="text-purple-400 text-xs font-mono break-all">{item.esimEid}</p></div>
                                  )}
                                  {item.smdpStatus && (
                                    <div><p className="text-slate-500 text-xs">SM-DP+</p><p className={"text-xs font-medium " + getEsimStatusLabel(item).color}>{item.smdpStatus}</p></div>
                                  )}
                                  {item.esimStatus && (
                                    <div><p className="text-slate-500 text-xs">Status</p><p className={"text-xs font-medium " + getEsimStatusLabel(item).color}>{getEsimStatusLabel(item).label}</p></div>
                                  )}
                                  {item.totalVolume && item.totalVolume > 0 && (
                                    <div>
                                      <p className="text-slate-500 text-xs">Data Usage</p>
                                      <div className="flex items-center gap-2">
                                        <div className="flex-1 h-2 bg-slate-700 rounded-full overflow-hidden">
                                          <div className="h-full bg-sky-500 rounded-full" style={{ width: `${Math.min(100, (item.orderUsage || 0) / item.totalVolume * 100)}%` }} />
                                        </div>
                                        <span className="text-xs text-slate-400">{formatBytes(item.orderUsage)} / {formatBytes(item.totalVolume)}</span>
                                      </div>
                                    </div>
                                  )}
                                  {item.enabledAt && (
                                    <div><p className="text-green-400/70 text-xs">✓ Enabled: {new Date(item.enabledAt).toLocaleString()}</p></div>
                                  )}
                                  {item.activationCode && (
                                    <div><p className="text-slate-500 text-xs">Activation Code</p><p className="text-sky-400 text-xs font-mono break-all">{item.activationCode}</p></div>
                                  )}
                                </div>
                              </div>
                            )}
                          </div>
                        ))}
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.div>
            ))}
          </div>
        )}
      </div>

      {/* Gift Modal - moved inside return */}
      <AnimatePresence>
        {showGiftModal && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4"
            onClick={() => setShowGiftModal(false)}>
            <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.9, opacity: 0 }}
              className="bg-slate-800 border border-slate-700 rounded-2xl p-6 w-full max-w-md max-h-[90vh] overflow-y-auto"
              onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-bold text-white flex items-center gap-2">🎁 Give Free eSIM Plan</h2>
              <button onClick={() => setShowGiftModal(false)} className="text-slate-400 hover:text-white text-2xl">&times;</button>
            </div>

            <form onSubmit={submitGift} className="space-y-4">
              {/* User Search */}
              <div>
                <label className="block text-slate-300 text-sm mb-2">User (search by email)</label>
                <div className="relative">
                  <input type="text" value={userSearch} onChange={(e) => searchUsers(e.target.value)}
                    placeholder="Search user by email..."
                    className="w-full bg-slate-900 border border-slate-700 rounded-lg px-4 py-2.5 text-white text-sm" />
                  {userResults.length > 0 && (
                    <div className="absolute top-full left-0 right-0 bg-slate-700 border border-slate-600 rounded-lg mt-1 max-h-48 overflow-y-auto z-10">
                      {userResults.map((user) => (
                        <button key={user.id} type="button" onClick={() => selectUser(user)}
                          className="w-full text-left px-4 py-2 hover:bg-slate-600 text-white text-sm">
                          <span className="font-medium">{user.email}</span>
                          <span className="text-slate-400 text-xs ml-2">{user.name || "(no name)"}</span>
                        </button>
                      ))}
                    </div>
                  )}
                  {searchingUsers && <p className="text-slate-400 text-xs mt-1">Searching...</p>}
                </div>
              </div>

              {/* Plan Selection - Package Code Input */}
              <div>
                <label className="block text-slate-300 text-sm mb-2">Package Code</label>
                <input type="text" value={giftForm.packageCode}
                  onChange={(e) => setGiftForm({ ...giftForm, packageCode: e.target.value })}
                  placeholder="Enter package code (e.g., JP-500MB-30D)"
                  className="w-full bg-slate-900 border border-slate-700 rounded-lg px-4 py-2.5 text-white text-sm" />
              </div>

              {/* Quantity */}
              <div>
                <label className="block text-slate-300 text-sm mb-2">Quantity</label>
                <input type="number" min="1" max="10" value={giftForm.quantity}
                  onChange={(e) => setGiftForm({ ...giftForm, quantity: parseInt(e.target.value) || 1 })}
                  className="w-full bg-slate-900 border border-slate-700 rounded-lg px-4 py-2.5 text-white text-sm" />
              </div>

              {/* Submit */}
              <button type="submit" disabled={giftLoading}
                className="w-full bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-400 hover:to-pink-400 text-white font-medium py-3 rounded-lg transition-all disabled:opacity-50">
                {giftLoading ? "Creating..." : "🎁 Give Free eSIM"}
              </button>
            </form>
          </motion.div>
        </motion.div>
      )}
      </AnimatePresence>
    </div>
  );
}