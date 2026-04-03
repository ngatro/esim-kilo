"use client";

import Link from "next/link";
import { useAuth } from "@/components/providers/AuthProvider";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";

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
  plan?: { name: string; packageCode: string } | null;
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
  const [statusFilter, setStatusFilter] = useState("");

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
                              <span className={order.orderItems.some(i => i.esimQrCode || i.esimQrImage) ? "text-green-400" : order.orderItems.some(i => i.esimStatus === "GOT_RESOURCE") ? "text-yellow-400" : "text-slate-400"}>
                                {order.orderItems.some(i => i.esimStatus === "ACTIVATED") ? "Active" : order.orderItems.some(i => i.esimStatus === "GOT_RESOURCE") ? "Ready" : order.orderItems.some(i => i.esimQrCode || i.esimQrImage) ? "Activated" : "Waiting"}
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
                              {!item.esimQrCode && !item.esimQrImage && order.status === "completed" && (
                                <button onClick={() => activateEsim(item.id)} disabled={activating === item.id}
                                  className="bg-sky-500 hover:bg-sky-400 disabled:bg-slate-600 text-white text-xs px-3 py-1.5 rounded-lg font-medium transition-colors">
                                  {activating === item.id ? "Activating..." : "Activate eSIM"}
                                </button>
                              )}
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
                                  {item.esimStatus && (
                                    <div><p className="text-slate-500 text-xs">Status</p><p className={"text-xs font-medium " + (item.esimStatus === "ACTIVATED" ? "text-green-400" : item.esimStatus === "GOT_RESOURCE" ? "text-yellow-400" : "text-slate-400")}>{item.esimStatus}</p></div>
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
    </div>
  );
}