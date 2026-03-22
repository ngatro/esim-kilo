"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useAuth } from "@/components/providers/AuthProvider";

interface Order {
  id: number;
  totalAmount: number;
  status: string;
  createdAt: Date;
}

export default function OrdersPage() {
  const { user } = useAuth();
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user) {
      fetchOrders();
    }
  }, [user]);

  async function fetchOrders() {
    try {
      const res = await fetch("/api/orders");
      if (res.ok) {
        const data = await res.json();
        setOrders(data.orders);
      }
    } catch (error) {
      console.error("Failed to fetch orders:", error);
    } finally {
      setLoading(false);
    }
  }

  if (!user) {
    return (
      <div className="min-h-screen bg-slate-900 py-12">
        <div className="max-w-4xl mx-auto px-4 text-center">
          <h1 className="text-3xl font-bold text-white mb-4">Please Login to View Orders</h1>
          <Link href="/login" className="inline-block bg-sky-600 text-white px-6 py-3 rounded-lg hover:bg-sky-700">
            Login
          </Link>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-900 py-12">
        <div className="max-w-4xl mx-auto px-4 text-center">
          <p className="text-white">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-900 py-12">
      <div className="max-w-4xl mx-auto px-4">
        <h1 className="text-3xl font-bold text-white mb-8">My Orders</h1>
        
        {orders.length === 0 ? (
          <div className="bg-slate-800 rounded-lg shadow-sm p-12 text-center">
            <p className="text-slate-400 mb-4">No orders yet</p>
            <Link href="/" className="inline-block bg-sky-600 text-white px-6 py-3 rounded-lg hover:bg-sky-700">
              Start Shopping
            </Link>
          </div>
        ) : (
          <div className="space-y-4">
            {orders.map((order) => (
              <div key={order.id} className="bg-slate-800 rounded-lg shadow-sm p-6">
                <div className="flex justify-between items-center">
                  <div>
                    <p className="font-semibold text-white">Order #{order.id}</p>
                    <p className="text-slate-400 text-sm">
                      {new Date(order.createdAt).toLocaleDateString()}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-lg font-bold text-white">${order.totalAmount}</p>
                    <span className="inline-block px-3 py-1 bg-green-900 text-green-300 text-sm rounded-full">
                      {order.status}
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
