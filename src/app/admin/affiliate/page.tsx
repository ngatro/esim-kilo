"use client";

import { useState, useEffect } from "react";
import { useAuth } from "@/components/providers/AuthProvider";
import Footer from "@/components/layout/Footer";

interface Withdrawal {
  id: number;
  userId: number;
  amount: number;
  paymentMethod: string;
  paymentDetails: any;
  status: string;
  adminNote: string | null;
  createdAt: string;
  processedAt: string | null;
  user: {
    id: number;
    name: string;
    email: string;
    affiliateCode: string;
  };
}

interface CommissionStats {
  status: string;
  _sum: { amount: number };
  _count: number;
}

export default function AdminAffiliatePage() {
  const { user, loading: authLoading } = useAuth();
  
  const [withdrawals, setWithdrawals] = useState<Withdrawal[]>([]);
  const [stats, setStats] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<string>("");
  
  const [selectedWithdrawal, setSelectedWithdrawal] = useState<Withdrawal | null>(null);
  const [actionStatus, setActionStatus] = useState("");
  const [adminNote, setAdminNote] = useState("");
  const [processing, setProcessing] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [walletDiscount, setWalletDiscount] = useState("");

  useEffect(() => {
    if (user && user.role === "admin") {
      fetchData();
    }
  }, [user, filter]);

  async function fetchData() {
    try {
      const params = new URLSearchParams();
      if (filter) params.append("status", filter);
      
      const res = await fetch(`/api/admin/affiliate?${params}`, {
        credentials: 'include'
      });
      if (res.ok) {
        const data = await res.json();
        setWithdrawals(data.withdrawals);
        setStats(data.stats);
      }
    } catch (error) {
      console.error("Failed to fetch affiliate data:", error);
    } finally {
      setLoading(false);
    }
  }

  async function handleProcessWithdrawal() {
    if (!selectedWithdrawal || !actionStatus) return;
    
    setProcessing(true);
    try {
      const res = await fetch("/api/admin/affiliate", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          type: "withdrawal",
          withdrawalId: selectedWithdrawal.id,
          status: actionStatus,
          adminNote,
        }),
        credentials: 'include'
      });
      
      if (res.ok) {
        setSelectedWithdrawal(null);
        setActionStatus("");
        setAdminNote("");
        fetchData();
      }
    } catch (error) {
      console.error("Failed to process withdrawal:", error);
    } finally {
      setProcessing(false);
    }
  }

  async function handleSaveDiscount() {
    setProcessing(true);
    try {
      const res = await fetch("/api/admin/affiliate", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          type: "walletDiscount",
          walletDiscountPercent: parseFloat(walletDiscount) || 0,
        }),
        credentials: 'include'
      });
      
      if (res.ok) {
        setShowSettings(false);
        fetchData();
      }
    } catch (error) {
      console.error("Failed to save discount:", error);
    } finally {
      setProcessing(false);
    }
  }

  const statusColors: Record<string, string> = {
    pending: "bg-yellow-100 text-yellow-700",
    approved: "bg-blue-100 text-blue-700",
    completed: "bg-green-100 text-green-700",
    rejected: "bg-red-100 text-red-700",
  };

  if (authLoading || loading) {
    return (
      <>
        <div className="min-h-screen bg-slate-50 flex items-center justify-center">
          <div className="animate-spin h-8 w-8 border-4 border-orange-500 border-t-transparent rounded-full"></div>
        </div>
        <Footer />
      </>
    );
  }

  if (!user || user.role !== "admin") {
    return (
      <>
        <div className="min-h-screen bg-slate-50 flex items-center justify-center">
          <div className="text-center">
            <p className="text-slate-600">Access denied. Admin only.</p>
          </div>
        </div>
        <Footer />
      </>
    );
  }

  return (
    <>
      <div className="min-h-screen bg-slate-50 py-12">
        <div className="max-w-6xl mx-auto px-4">
          <div className="flex items-center justify-between mb-8">
            <div>
              <h1 className="text-3xl font-bold text-slate-800">Affiliate Management</h1>
              <p className="text-slate-500">Manage withdrawals and commission settings</p>
            </div>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
            <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6">
              <p className="text-sm text-slate-500 mb-1">Total Affiliate Earnings</p>
              <p className="text-2xl font-bold text-slate-800">${(stats?.totalBalance || 0).toFixed(2)}</p>
            </div>
            <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6">
              <p className="text-sm text-slate-500 mb-1">Total Affiliates</p>
              <p className="text-2xl font-bold text-slate-800">{stats?.totalUsers || 0}</p>
            </div>
            <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6">
              <p className="text-sm text-slate-500 mb-1">Pending Withdrawals</p>
              <p className="text-2xl font-bold text-slate-800">
                {withdrawals.filter(w => w.status === "pending").length}
              </p>
            </div>
            <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6">
              <p className="text-sm text-slate-500 mb-1">Wallet Discount</p>
              <p className="text-2xl font-bold text-slate-800">{stats?.walletDiscountPercent || 0}%</p>
              <button 
                onClick={() => setShowSettings(true)}
                className="text-xs text-orange-500 hover:text-orange-600 mt-1"
              >
                Configure →
              </button>
            </div>
          </div>

          {/* Filter */}
          <div className="flex gap-4 mb-6">
            <select
              value={filter}
              onChange={(e) => setFilter(e.target.value)}
              className="px-4 py-2 border border-slate-200 rounded-xl text-slate-800"
            >
              <option value="">All Status</option>
              <option value="pending">Pending</option>
              <option value="approved">Approved</option>
              <option value="completed">Completed</option>
              <option value="rejected">Rejected</option>
            </select>
          </div>

          {/* Withdrawals Table */}
          <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
            <table className="w-full">
              <thead className="bg-slate-50">
                <tr>
                  <th className="px-6 py-4 text-left text-sm font-medium text-slate-500">User</th>
                  <th className="px-6 py-4 text-left text-sm font-medium text-slate-500">Amount</th>
                  <th className="px-6 py-4 text-left text-sm font-medium text-slate-500">Method</th>
                  <th className="px-6 py-4 text-left text-sm font-medium text-slate-500">Details</th>
                  <th className="px-6 py-4 text-left text-sm font-medium text-slate-500">Status</th>
                  <th className="px-6 py-4 text-left text-sm font-medium text-slate-500">Date</th>
                  <th className="px-6 py-4 text-left text-sm font-medium text-slate-500">Action</th>
                </tr>
              </thead>
              <tbody>
                {withdrawals.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="px-6 py-8 text-center text-slate-500">
                      No withdrawal requests
                    </td>
                  </tr>
                ) : (
                  withdrawals.map((withdrawal) => (
                    <tr key={withdrawal.id} className="border-t border-slate-100">
                      <td className="px-6 py-4">
                        <div>
                          <p className="text-sm font-medium text-slate-800">{withdrawal.user.name}</p>
                          <p className="text-xs text-slate-500">{withdrawal.user.email}</p>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <span className="text-sm font-bold text-slate-800">${withdrawal.amount.toFixed(2)}</span>
                      </td>
                      <td className="px-6 py-4">
                        <span className="text-sm text-slate-600 capitalize">{withdrawal.paymentMethod.replace("_", " ")}</span>
                      </td>
                      <td className="px-6 py-4">
                        <div className="text-xs text-slate-500">
                          {withdrawal.paymentMethod === "bank_transfer" ? (
                            <>
                              <p>{withdrawal.paymentDetails?.bankName}</p>
                              <p>{withdrawal.paymentDetails?.accountNumber}</p>
                            </>
                          ) : (
                            <p>{withdrawal.paymentDetails?.email}</p>
                          )}
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <span className={`text-xs px-2 py-1 rounded-full ${statusColors[withdrawal.status]}`}>
                          {withdrawal.status}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <span className="text-sm text-slate-500">
                          {new Date(withdrawal.createdAt).toLocaleDateString()}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        {withdrawal.status === "pending" && (
                          <button
                            onClick={() => setSelectedWithdrawal(withdrawal)}
                            className="text-sm text-orange-500 hover:text-orange-600"
                          >
                            Process
                          </button>
                        )}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Settings Modal */}
      {showSettings && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl p-6 max-w-md w-full">
            <h3 className="text-xl font-semibold text-slate-800 mb-4">Wallet Settings</h3>
            
            <div className="mb-4">
              <label className="block text-sm font-medium text-slate-600 mb-1.5">Top-up Discount (%)</label>
              <input
                type="number"
                step="1"
                min="0"
                max="100"
                value={walletDiscount}
                onChange={(e) => setWalletDiscount(e.target.value)}
                className="w-full px-4 py-3 border border-slate-200 rounded-xl text-slate-800"
                placeholder="e.g., 10 for 10% extra"
              />
              <p className="text-xs text-slate-500 mt-1">
                Extra % bonus when users top-up wallet (0 = no bonus)
              </p>
            </div>

            <div className="flex gap-3">
              <button
                type="button"
                onClick={() => setShowSettings(false)}
                className="flex-1 bg-slate-200 hover:bg-slate-300 text-slate-700 font-semibold py-3 rounded-xl"
              >
                Cancel
              </button>
              <button
                onClick={handleSaveDiscount}
                disabled={processing}
                className="flex-1 bg-orange-500 hover:bg-orange-600 disabled:bg-slate-300 text-white font-semibold py-3 rounded-xl"
              >
                {processing ? "Saving..." : "Save"}
              </button>
            </div>
          </div>
        </div>
      )}

      <Footer />
      {selectedWithdrawal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl p-6 max-w-md w-full">
            <h3 className="text-xl font-semibold text-slate-800 mb-4">
              Process Withdrawal - ${selectedWithdrawal.amount.toFixed(2)}
            </h3>
            
            <div className="mb-4 p-3 bg-slate-50 rounded-xl">
              <p className="text-sm text-slate-600">
                <span className="font-medium">User:</span> {selectedWithdrawal.user.name}
              </p>
              <p className="text-sm text-slate-600">
                <span className="font-medium">Email:</span> {selectedWithdrawal.user.email}
              </p>
              <p className="text-sm text-slate-600">
                <span className="font-medium">Code:</span> {selectedWithdrawal.user.affiliateCode}
              </p>
            </div>

            <div className="mb-4">
              <label className="block text-sm font-medium text-slate-600 mb-1.5">Action</label>
              <select
                value={actionStatus}
                onChange={(e) => setActionStatus(e.target.value)}
                className="w-full px-4 py-3 border border-slate-200 rounded-xl text-slate-800"
              >
                <option value="">Select action...</option>
                <option value="approved">Approve</option>
                <option value="completed">Mark as Paid</option>
                <option value="rejected">Reject</option>
              </select>
            </div>

            <div className="mb-4">
              <label className="block text-sm font-medium text-slate-600 mb-1.5">Note (optional)</label>
              <textarea
                value={adminNote}
                onChange={(e) => setAdminNote(e.target.value)}
                className="w-full px-4 py-3 border border-slate-200 rounded-xl text-slate-800"
                rows={3}
                placeholder="Add a note..."
              />
            </div>

            <div className="flex gap-3">
              <button
                type="button"
                onClick={() => {
                  setSelectedWithdrawal(null);
                  setActionStatus("");
                  setAdminNote("");
                }}
                className="flex-1 bg-slate-200 hover:bg-slate-300 text-slate-700 font-semibold py-3 rounded-xl"
              >
                Cancel
              </button>
              <button
                onClick={handleProcessWithdrawal}
                disabled={!actionStatus || processing}
                className="flex-1 bg-orange-500 hover:bg-orange-600 disabled:bg-slate-300 text-white font-semibold py-3 rounded-xl"
              >
                {processing ? "Processing..." : "Confirm"}
              </button>
            </div>
          </div>
        </div>
      )}

      <Footer />
    </>
  );
}