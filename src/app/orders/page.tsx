"use client";

import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Link from "next/link";
import { useAuth } from "@/components/providers/AuthProvider";

interface OrderItem {
  id: number;
  planId: string | null;
  planName: string;
  price: number;
  quantity: number;
  esimIccid: string | null;
  esimQrCode: string | null;
  esimQrImage: string | null;
  activationCode: string | null;
}

interface Order {
  id: number;
  totalAmount: number;
  status: string;
  currency: string;
  customerEmail: string | null;
  esimaccessOrderId: string | null;
  esimaccessOrderStatus: string | null;
  createdAt: string;
  orderItems: OrderItem[];
}

export default function OrdersPage() {
  const { user } = useAuth();
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [expandedOrder, setExpandedOrder] = useState<number | null>(null);
  const [guestEmail, setGuestEmail] = useState("");
  const [searched, setSearched] = useState(false);
  const [newlyReady, setNewlyReady] = useState<number[]>([]);

  useEffect(() => {
    if (user) {
      fetchOrders();
    } else {
      setLoading(false);
    }
  }, [user]);

  useEffect(() => {
    const hasPendingOrders = orders.some(o => o.orderItems.every(i => !i.esimIccid));
    if (!hasPendingOrders || orders.length === 0) return;

    const interval = setInterval(() => {
      fetchOrders();
    }, 30000);

    return () => clearInterval(interval);
  }, [orders, user]);

  useEffect(() => {
    const previousOrders = orders.filter(o => !newlyReady.includes(o.id));
    const newlyActivated = orders.filter(o => 
      o.orderItems.every(i => i.esimIccid) && 
      !previousOrders.some(p => p.id === o.id && p.orderItems.every(i => i.esimIccid))
    );
    if (newlyActivated.length > 0) {
      setNewlyReady(prev => [...prev, ...newlyActivated.map(o => o.id)]);
    }
  }, [orders]);

  async function fetchOrders(email?: string) {
    setLoading(true);
    try {
      const url = email ? `/api/orders?email=${encodeURIComponent(email)}` : "/api/orders";
      const res = await fetch(url);
      const data = await res.json();
      setOrders(data.orders || []);
      setSearched(true);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }

  function handleGuestSearch() {
    if (guestEmail) {
      fetchOrders(guestEmail);
    }
  }

  if (loading && !searched) {
    return (
      <div className="min-h-screen bg-slate-900 flex items-center justify-center">
        <div className="animate-spin w-8 h-8 border-2 border-sky-500 border-t-transparent rounded-full" />
      </div>
    );
  }

  // Not logged in - show email search
  if (!user && !searched) {
    return (
      <div className="min-h-screen bg-slate-900 text-white py-12">
        <div className="max-w-md mx-auto px-4 text-center">
          <p className="text-5xl mb-4">📱</p>
          <h1 className="text-2xl font-bold mb-3">View Your Orders</h1>
          <p className="text-slate-400 text-sm mb-6">Enter the email you used during checkout</p>
          <div className="flex gap-2">
            <input type="email" value={guestEmail} onChange={(e) => setGuestEmail(e.target.value)}
              placeholder="your@email.com" onKeyDown={(e) => e.key === "Enter" && handleGuestSearch()}
              className="flex-1 bg-slate-800 border border-slate-700 rounded-xl px-4 py-3 text-white text-sm placeholder:text-slate-500 focus:outline-none focus:border-sky-500" />
            <button onClick={handleGuestSearch}
              className="bg-sky-500 hover:bg-sky-400 text-white font-semibold px-6 py-3 rounded-xl text-sm transition-colors">
              View
            </button>
          </div>
          <p className="text-slate-500 text-xs mt-4">or <Link href="/login" className="text-sky-400 hover:text-sky-300">Login</Link> to see all orders</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-900 text-white py-8 sm:py-12">
      <div className="max-w-4xl mx-auto px-3 sm:px-6">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6">
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold text-white">My Orders</h1>
            <p className="text-slate-400 text-sm mt-1">{orders.length} order{orders.length !== 1 ? "s" : ""}</p>
          </div>
          <Link href="/plans">
            <motion.button className="bg-sky-500 hover:bg-sky-400 text-white font-semibold px-5 py-2.5 rounded-xl text-sm transition-colors" whileHover={{ scale: 1.02 }}>
              Buy New eSIM
            </motion.button>
          </Link>
        </div>

        {newlyReady.length > 0 && (
          <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}
            className="bg-green-500/20 border border-green-500/40 rounded-xl p-4 mb-4 flex items-center gap-3">
            <span className="text-2xl">🎉</span>
            <div>
              <p className="text-green-400 font-medium">Your eSIM is ready!</p>
              <p className="text-green-300/70 text-sm">Check your email or expand the order to view QR code.</p>
            </div>
          </motion.div>
        )}

        {orders.length === 0 ? (
          <div className="bg-slate-800/50 border border-slate-700/50 rounded-2xl p-12 sm:p-16 text-center">
            <p className="text-5xl mb-4">📱</p>
            <h3 className="text-xl font-semibold text-white mb-2">No orders found</h3>
            <p className="text-slate-400 mb-6 text-sm">Your eSIM orders will appear here after purchase</p>
            <Link href="/plans">
              <button className="bg-sky-500 hover:bg-sky-400 text-white font-semibold px-8 py-3 rounded-xl transition-colors text-sm">
                Browse Plans
              </button>
            </Link>
          </div>
        ) : (
          <div className="space-y-3 sm:space-y-4">
            {orders.map((order) => (
              <motion.div key={order.id} className="bg-slate-800/50 border border-slate-700/50 rounded-2xl overflow-hidden" layout>
                <button onClick={() => setExpandedOrder(expandedOrder === order.id ? null : order.id)}
                  className="w-full p-4 sm:p-5 flex items-center justify-between hover:bg-slate-800/60 transition-colors text-left">
                  <div className="flex items-center gap-3 sm:gap-4">
                    <div className={`w-10 h-10 sm:w-12 sm:h-12 rounded-xl flex items-center justify-center ${
                      order.status === "completed" ? "bg-green-500/20" : "bg-yellow-500/20"
                    }`}>
                      <span className="text-lg sm:text-xl">{order.status === "completed" ? "✅" : "⏳"}</span>
                    </div>
                    <div>
                      <p className="text-white font-semibold text-sm sm:text-base">Order #{order.id}</p>
                      <p className="text-slate-500 text-xs sm:text-sm">
                        {new Date(order.createdAt).toLocaleDateString("en-US", { year: "numeric", month: "short", day: "numeric", hour: "2-digit", minute: "2-digit" })}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3 sm:gap-4">
                    <div className="text-right">
                      <p className="text-base sm:text-lg font-bold text-white">${order.totalAmount.toFixed(2)}</p>
                      <div className="flex gap-1 mt-1">
                        <span className={`inline-block px-2 py-0.5 text-[10px] sm:text-xs font-medium rounded-full ${
                          order.status === "completed" ? "bg-green-500/20 text-green-400" :
                          order.status === "pending" ? "bg-yellow-500/20 text-yellow-400" :
                          "bg-red-500/20 text-red-400"
                        }`}>
                          {order.status === "completed" ? "Paid" : order.status}
                        </span>
                        <span className={`inline-block px-2 py-0.5 text-[10px] sm:text-xs font-medium rounded-full ${
                          order.orderItems.every(i => i.esimIccid) ? "bg-green-500/20 text-green-400" :
                          order.orderItems.some(i => i.esimIccid) ? "bg-yellow-500/20 text-yellow-400" :
                          "bg-slate-500/20 text-slate-400"
                        }`}>
                          {order.orderItems.every(i => i.esimIccid) ? "Active" : order.orderItems.some(i => i.esimIccid) ? "Partial" : "Pending"}
                        </span>
                      </div>
                    </div>
                    <svg className={`w-4 h-4 sm:w-5 sm:h-5 text-slate-500 transition-transform ${expandedOrder === order.id ? "rotate-180" : ""}`}
                      fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                    </svg>
                  </div>
                </button>

                <AnimatePresence>
                  {expandedOrder === order.id && (
                    <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: "auto", opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }} transition={{ duration: 0.3 }} className="overflow-hidden">
                      <div className="border-t border-slate-700/50 p-4 sm:p-5 space-y-4">
                        {order.orderItems.map((item) => (
                          <div key={item.id} className="bg-slate-900/50 rounded-xl p-4 sm:p-5">
                            <div className="flex items-center justify-between mb-4">
                              <div>
                                <h4 className="text-white font-medium text-sm sm:text-base">{item.planName}</h4>
                                <p className="text-slate-500 text-xs sm:text-sm">${item.price.toFixed(2)} × {item.quantity}</p>
                              </div>
                              {item.esimIccid && (
                                <div className="text-right">
                                  <p className="text-[10px] text-slate-500">ICCID</p>
                                  <code className="text-sky-400 text-[10px] sm:text-xs">{item.esimIccid}</code>
                                </div>
                              )}
                            </div>

                            {(item.esimQrCode || item.esimQrImage) ? (
                              <div className="flex flex-col sm:flex-row items-start gap-4">
                                <div className="bg-white rounded-xl p-3 sm:p-4 flex-shrink-0 mx-auto sm:mx-0">
                                  <img src={item.esimQrImage || item.esimQrCode || ""} alt="eSIM QR Code"
                                    className="w-36 h-36 sm:w-44 sm:h-44" />
                                </div>
                                <div className="flex-1 space-y-2 sm:space-y-3 text-center sm:text-left">
                                  <div>
                                    <p className="text-[10px] text-slate-500 uppercase tracking-wider mb-1">Scan to Activate</p>
                                    <p className="text-slate-400 text-xs sm:text-sm">Settings → Cellular → Add eSIM → Scan QR Code</p>
                                  </div>
                                  {item.activationCode && (
                                    <div>
                                      <p className="text-[10px] text-slate-500 uppercase tracking-wider mb-1">Manual Activation Code</p>
                                      <div className="bg-slate-800 border border-slate-700 rounded-lg p-2 sm:p-3">
                                        <code className="text-sky-400 text-[10px] sm:text-xs break-all">{item.activationCode}</code>
                                      </div>
                                    </div>
                                  )}
                                </div>
                              </div>
                            ) : (
                              <div className="text-center py-6">
                                <div className="animate-spin w-6 h-6 border-2 border-sky-500 border-t-transparent rounded-full mx-auto mb-2" />
                                <p className="text-slate-500 text-xs">Processing your eSIM...</p>
                              </div>
                            )}
                          </div>
                        ))}

                        {/* Payment info */}
                        <div className="bg-slate-900/50 rounded-xl p-3 sm:p-4">
                          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 sm:gap-3 text-xs">
                            <div><p className="text-slate-500">Amount</p><p className="text-white font-semibold">${order.totalAmount.toFixed(2)}</p></div>
                            <div><p className="text-slate-500">Payment</p><p className={order.status === "completed" ? "text-green-400" : "text-yellow-400"}>{order.status === "completed" ? "✅ Paid" : order.status}</p></div>
                            <div><p className="text-slate-500">eSIM</p><p className={order.orderItems.every(i => i.esimIccid) ? "text-green-400" : order.orderItems.some(i => i.esimIccid) ? "text-yellow-400" : "text-slate-400"}>{order.orderItems.every(i => i.esimIccid) ? "✅ Activated" : order.orderItems.some(i => i.esimIccid) ? "⚠️ Partial" : "⏳ Pending"}</p></div>
                            {order.esimaccessOrderId && (
                              <div><p className="text-slate-500">Order ID</p><p className="text-slate-300 font-mono text-[10px] truncate">{order.esimaccessOrderId}</p></div>
                            )}
                          </div>
                        </div>
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