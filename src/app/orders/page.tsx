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

  useEffect(() => {
    if (user) {
      fetch("/api/orders")
        .then((r) => r.json())
        .then((data) => setOrders(data.orders || []))
        .catch(console.error)
        .finally(() => setLoading(false));
    } else {
      setLoading(false);
    }
  }, [user]);

  if (!user) {
    return (
      <div className="min-h-screen bg-slate-900 text-white py-12">
        <div className="max-w-4xl mx-auto px-4 text-center">
          <p className="text-6xl mb-4">🔐</p>
          <h1 className="text-3xl font-bold mb-3">Login to View Orders</h1>
          <p className="text-slate-400 mb-6">See your eSIM purchases and QR codes</p>
          <Link href="/login">
            <motion.button className="bg-sky-500 hover:bg-sky-400 text-white font-semibold px-8 py-3 rounded-xl transition-colors" whileHover={{ scale: 1.02 }}>
              Login
            </motion.button>
          </Link>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-900 flex items-center justify-center">
        <div className="animate-spin w-8 h-8 border-2 border-sky-500 border-t-transparent rounded-full" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-900 text-white py-12">
      <div className="max-w-4xl mx-auto px-4 sm:px-6">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-white">My Orders</h1>
            <p className="text-slate-400 text-sm mt-1">{orders.length} order{orders.length !== 1 ? "s" : ""}</p>
          </div>
          <Link href="/plans">
            <motion.button className="bg-sky-500 hover:bg-sky-400 text-white font-semibold px-5 py-2.5 rounded-xl text-sm transition-colors" whileHover={{ scale: 1.02 }}>
              Buy New eSIM
            </motion.button>
          </Link>
        </div>

        {orders.length === 0 ? (
          <div className="bg-slate-800/50 border border-slate-700/50 rounded-2xl p-16 text-center">
            <p className="text-5xl mb-4">📱</p>
            <h3 className="text-xl font-semibold text-white mb-2">No orders yet</h3>
            <p className="text-slate-400 mb-6">Get your first eSIM and stay connected while traveling</p>
            <Link href="/plans">
              <motion.button className="bg-sky-500 hover:bg-sky-400 text-white font-semibold px-8 py-3 rounded-xl transition-colors" whileHover={{ scale: 1.02 }}>
                Browse Plans
              </motion.button>
            </Link>
          </div>
        ) : (
          <div className="space-y-4">
            {orders.map((order) => (
              <motion.div
                key={order.id}
                className="bg-slate-800/50 border border-slate-700/50 rounded-2xl overflow-hidden"
                layout
              >
                <button
                  onClick={() => setExpandedOrder(expandedOrder === order.id ? null : order.id)}
                  className="w-full p-6 flex items-center justify-between hover:bg-slate-800/80 transition-colors"
                >
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 bg-sky-500/20 rounded-xl flex items-center justify-center">
                      <span className="text-xl">📱</span>
                    </div>
                    <div className="text-left">
                      <p className="text-white font-semibold">Order #{order.id}</p>
                      <p className="text-slate-500 text-sm">
                        {new Date(order.createdAt).toLocaleDateString("en-US", { year: "numeric", month: "short", day: "numeric", hour: "2-digit", minute: "2-digit" })}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-4">
                    <div className="text-right">
                      <p className="text-lg font-bold text-white">${order.totalAmount.toFixed(2)}</p>
                      <span className={`inline-block px-2.5 py-0.5 text-xs font-medium rounded-full ${
                        order.status === "completed" ? "bg-green-500/20 text-green-400" :
                        order.status === "pending" ? "bg-yellow-500/20 text-yellow-400" :
                        "bg-red-500/20 text-red-400"
                      }`}>
                        {order.status}
                      </span>
                    </div>
                    <svg className={`w-5 h-5 text-slate-500 transition-transform ${expandedOrder === order.id ? "rotate-180" : ""}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                    </svg>
                  </div>
                </button>

                <AnimatePresence>
                  {expandedOrder === order.id && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: "auto", opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.3 }}
                      className="overflow-hidden"
                    >
                      <div className="border-t border-slate-700/50 p-6 space-y-4">
                        {order.orderItems.map((item) => (
                          <div key={item.id} className="bg-slate-900/50 rounded-xl p-5">
                            <div className="flex items-center justify-between mb-4">
                              <div>
                                <h4 className="text-white font-medium">{item.planName}</h4>
                                <p className="text-slate-500 text-sm">Qty: {item.quantity} · ${item.price.toFixed(2)}</p>
                              </div>
                              {item.esimIccid && (
                                <div className="text-right">
                                  <p className="text-xs text-slate-500">ICCID</p>
                                  <code className="text-sky-400 text-xs">{item.esimIccid}</code>
                                </div>
                              )}
                            </div>

                            {(item.esimQrCode || item.esimQrImage) && (
                              <div className="flex items-start gap-6">
                                <div className="bg-white rounded-xl p-4 flex-shrink-0">
                                  <img
                                    src={item.esimQrImage || item.esimQrCode || ""}
                                    alt="eSIM QR Code"
                                    className="w-40 h-40"
                                  />
                                </div>
                                <div className="flex-1 space-y-3">
                                  <div>
                                    <p className="text-xs text-slate-500 uppercase tracking-wider mb-1">Scan to Activate</p>
                                    <p className="text-slate-400 text-sm">Go to Settings → Cellular → Add eSIM → Scan QR Code</p>
                                  </div>
                                  {item.activationCode && (
                                    <div>
                                      <p className="text-xs text-slate-500 uppercase tracking-wider mb-1">Manual Activation Code</p>
                                      <div className="bg-slate-800 border border-slate-700 rounded-lg p-3">
                                        <code className="text-sky-400 text-xs break-all">{item.activationCode}</code>
                                      </div>
                                    </div>
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