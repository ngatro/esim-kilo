"use client";

import { useState, useEffect } from "react";
import { useAuth } from "@/components/providers/AuthProvider";
import { useI18n } from "@/components/providers/I18nProvider";

interface AffiliateStats {
  affiliateCode: string;
  balance: number;
  rank: string;
  referralCount: number;
  successfulOrders: number;
  totalEarned: number;
}

interface Commission {
  id: number;
  orderNo: string;
  amount: number;
  percentage: number;
  rank: string;
  status: string;
  createdAt: string;
}

interface Withdrawal {
  id: number;
  amount: number;
  paymentMethod: string;
  status: string;
  createdAt: string;
}

interface Referral {
  id: number;
  name: string;
  email: string;
  createdAt: string;
  rank: string;
}

export default function AffiliatePage() {
  const { t } = useI18n();
  const { user, loading: authLoading } = useAuth();
  
  const [stats, setStats] = useState<AffiliateStats | null>(null);
  const [commissions, setCommissions] = useState<Commission[]>([]);
  const [withdrawals, setWithdrawals] = useState<Withdrawal[]>([]);
  const [referrals, setReferrals] = useState<Referral[]>([]);
  const [loading, setLoading] = useState(true);
  
  const [showWithdrawModal, setShowWithdrawModal] = useState(false);
  const [withdrawAmount, setWithdrawAmount] = useState("");
  const [paymentMethod, setPaymentMethod] = useState("bank_transfer");
  const [bankName, setBankName] = useState("");
  const [accountNumber, setAccountNumber] = useState("");
  const [accountName, setAccountName] = useState("");
  const [paypalEmail, setPaypalEmail] = useState("");
  const [withdrawError, setWithdrawError] = useState("");
  const [withdrawSuccess, setWithdrawSuccess] = useState("");
  const [withdrawing, setWithdrawing] = useState(false);

  useEffect(() => {
    if (user) {
      fetchAffiliateData();
    }
  }, [user]);

  async function fetchAffiliateData() {
    try {
      const res = await fetch("/api/affiliate/stats");
      if (res.ok) {
        const data = await res.json();
        setStats(data.stats);
        setCommissions(data.commissions);
        setWithdrawals(data.withdrawals);
        setReferrals(data.referrals);
      }
    } catch (error) {
      console.error("Failed to fetch affiliate data:", error);
    } finally {
      setLoading(false);
    }
  }

  async function handleWithdraw(e: React.FormEvent) {
    e.preventDefault();
    setWithdrawError("");
    setWithdrawSuccess("");
    setWithdrawing(true);

    const amount = parseFloat(withdrawAmount);
    
    if (!amount || amount < 10) {
      setWithdrawError("Minimum withdrawal amount is $10");
      setWithdrawing(false);
      return;
    }

    if (stats && amount > stats.balance) {
      setWithdrawError("Insufficient balance");
      setWithdrawing(false);
      return;
    }

    const paymentDetails: any = {};
    if (paymentMethod === "bank_transfer") {
      if (!bankName || !accountNumber || !accountName) {
        setWithdrawError("Please fill in all bank details");
        setWithdrawing(false);
        return;
      }
      paymentDetails.bankName = bankName;
      paymentDetails.accountNumber = accountNumber;
      paymentDetails.accountName = accountName;
    } else if (paymentMethod === "paypal") {
      if (!paypalEmail) {
        setWithdrawError("Please enter your PayPal email");
        setWithdrawing(false);
        return;
      }
      paymentDetails.email = paypalEmail;
    }

    try {
      const res = await fetch("/api/affiliate/withdraw", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          amount,
          paymentMethod,
          paymentDetails,
        }),
      });
      const data = await res.json();

      if (res.ok) {
        setWithdrawSuccess("Withdrawal request submitted successfully!");
        setShowWithdrawModal(false);
        setWithdrawAmount("");
        setBankName("");
        setAccountNumber("");
        setAccountName("");
        setPaypalEmail("");
        fetchAffiliateData();
      } else {
        setWithdrawError(data.error || "Withdrawal failed");
      }
    } catch (error) {
      setWithdrawError("Something went wrong");
    } finally {
      setWithdrawing(false);
    }
  }

  const [copySuccess, setCopySuccess] = useState(false);

  function copyReferralLink() {
    const link = `${window.location.origin}?ref=${stats?.affiliateCode}`;
    navigator.clipboard.writeText(link);
    setCopySuccess(true);
    setTimeout(() => setCopySuccess(false), 2000);
  }

  const rankColors: Record<string, string> = {
    bronze: "bg-amber-100 text-amber-700 border-amber-200",
    silver: "bg-slate-200 text-slate-600 border-slate-300",
    gold: "bg-yellow-100 text-yellow-700 border-yellow-200",
    diamond: "bg-blue-100 text-blue-700 border-blue-200",
  };

  if (authLoading || loading) {
    return (
      <>
        <div className="min-h-screen bg-slate-50 flex items-center justify-center">
          <div className="animate-spin h-8 w-8 border-4 border-orange-500 border-t-transparent rounded-full"></div>
        </div>
      </>
    );
  }

  if (!user) {
    return (
      <>
        <div className="min-h-screen bg-slate-50 flex items-center justify-center">
          <div className="text-center">
            <p className="text-slate-600">Please login to view your affiliate dashboard.</p>
          </div>
        </div>
      </>
    );
  }

  return (
    <>
      <div className="min-h-screen bg-slate-50 py-12">
        <div className="max-w-6xl mx-auto px-4">
          <div className="flex items-center justify-between mb-8">
            <div>
              <h1 className="text-3xl font-bold text-slate-800">Affiliate Dashboard</h1>
              <p className="text-slate-500">Track your earnings and referrals</p>
            </div>
            <div className={`px-4 py-2 rounded-full border ${rankColors[stats?.rank || 'bronze']}`}>
              <span className="font-semibold capitalize">{stats?.rank || 'Bronze'}</span>
              <span className="text-sm ml-2 opacity-75">
                {stats?.successfulOrders || 0} orders
              </span>
            </div>
          </div>

          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
            <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6">
              <p className="text-sm text-slate-500 mb-1">Available Balance</p>
              <p className="text-3xl font-bold text-slate-800">${(stats?.balance || 0).toFixed(2)}</p>
              <button
                onClick={() => setShowWithdrawModal(true)}
                disabled={(stats?.balance || 0) < 10}
                className="mt-3 text-sm text-orange-500 hover:text-orange-600 disabled:text-slate-400"
              >
                Request Withdrawal →
              </button>
            </div>
            <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6">
              <p className="text-sm text-slate-500 mb-1">Total Earned</p>
              <p className="text-3xl font-bold text-slate-800">${(stats?.totalEarned || 0).toFixed(2)}</p>
            </div>
            <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6">
              <p className="text-sm text-slate-500 mb-1">Referrals</p>
              <p className="text-3xl font-bold text-slate-800">{stats?.referralCount || 0}</p>
            </div>
            <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6">
              <p className="text-sm text-slate-500 mb-1">Commission Rate</p>
              <p className="text-3xl font-bold text-slate-800">
                {stats?.rank === 'diamond' ? '15%' : 
                 stats?.rank === 'gold' ? '12%' : 
                 stats?.rank === 'silver' ? '8%' : '5%'}
              </p>
            </div>
          </div>

          {/* Referral Link */}
          <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6 mb-8">
            <h2 className="text-xl font-semibold text-slate-800 mb-4">Your Referral Link</h2>
            <div className="flex flex-col md:flex-row gap-3">
              <input
                type="text"
                readOnly
                value={`${typeof window !== 'undefined' ? window.location.origin : ''}?ref=${stats?.affiliateCode || ''}`}
                className="flex-1 px-4 py-3 border border-slate-200 rounded-xl text-slate-600 bg-slate-50"
              />
              <button
                onClick={copyReferralLink}
                className="bg-orange-500 hover:bg-orange-600 text-white font-semibold py-3 px-6 rounded-xl transition-colors"
              >
                {copySuccess ? "✓ Copied!" : "Copy Link"}
              </button>
            </div>
            <p className="text-sm text-slate-500 mt-2">
              Share this link to earn commission when someone makes a purchase. Cookie lasts 30 days.
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Commissions */}
            <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6">
              <h2 className="text-xl font-semibold text-slate-800 mb-4">Commission History</h2>
              {commissions.length === 0 ? (
                <p className="text-slate-500 text-sm">No commissions yet. Start sharing your referral link!</p>
              ) : (
                <div className="space-y-3 max-h-64 overflow-y-auto">
                  {commissions.map((commission) => (
                    <div key={commission.id} className="flex justify-between items-center p-3 bg-slate-50 rounded-xl">
                      <div>
                        <p className="text-sm font-medium text-slate-700">Order #{commission.orderNo}</p>
                        <p className="text-xs text-slate-500">
                          {commission.percentage * 100}% commission · {new Date(commission.createdAt).toLocaleDateString()}
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="text-sm font-bold text-green-600">+${commission.amount.toFixed(2)}</p>
                        <span className={`text-xs px-2 py-0.5 rounded-full ${
                          commission.status === 'paid' ? 'bg-green-100 text-green-700' :
                          commission.status === 'approved' ? 'bg-blue-100 text-blue-700' :
                          'bg-yellow-100 text-yellow-700'
                        }`}>
                          {commission.status}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Withdrawals */}
            <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6">
              <h2 className="text-xl font-semibold text-slate-800 mb-4">Withdrawal History</h2>
              {withdrawals.length === 0 ? (
                <p className="text-slate-500 text-sm">No withdrawal requests yet.</p>
              ) : (
                <div className="space-y-3 max-h-64 overflow-y-auto">
                  {withdrawals.map((withdrawal) => (
                    <div key={withdrawal.id} className="flex justify-between items-center p-3 bg-slate-50 rounded-xl">
                      <div>
                        <p className="text-sm font-medium text-slate-700">{withdrawal.paymentMethod}</p>
                        <p className="text-xs text-slate-500">{new Date(withdrawal.createdAt).toLocaleDateString()}</p>
                      </div>
                      <div className="text-right">
                        <p className="text-sm font-bold text-slate-700">-${withdrawal.amount.toFixed(2)}</p>
                        <span className={`text-xs px-2 py-0.5 rounded-full ${
                          withdrawal.status === 'completed' ? 'bg-green-100 text-green-700' :
                          withdrawal.status === 'approved' ? 'bg-blue-100 text-blue-700' :
                          withdrawal.status === 'rejected' ? 'bg-red-100 text-red-700' :
                          'bg-yellow-100 text-yellow-700'
                        }`}>
                          {withdrawal.status}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Referrals */}
          <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6 mt-8">
            <h2 className="text-xl font-semibold text-slate-800 mb-4">Your Referrals</h2>
            {referrals.length === 0 ? (
              <p className="text-slate-500 text-sm">No referrals yet.</p>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="text-left text-sm text-slate-500 border-b border-slate-200">
                      <th className="pb-3 font-medium">Name</th>
                      <th className="pb-3 font-medium">Email</th>
                      <th className="pb-3 font-medium">Joined</th>
                      <th className="pb-3 font-medium">Rank</th>
                    </tr>
                  </thead>
                  <tbody>
                    {referrals.map((ref) => (
                      <tr key={ref.id} className="border-b border-slate-100">
                        <td className="py-3 text-slate-700">{ref.name}</td>
                        <td className="py-3 text-slate-500">{ref.email}</td>
                        <td className="py-3 text-slate-500">{new Date(ref.createdAt).toLocaleDateString()}</td>
                        <td className="py-3">
                          <span className={`text-xs px-2 py-1 rounded-full capitalize ${rankColors[ref.rank]}`}>
                            {ref.rank}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Withdrawal Modal */}
      {showWithdrawModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl p-6 max-w-md w-full">
            <h3 className="text-xl font-semibold text-slate-800 mb-4">Request Withdrawal</h3>
            
            {withdrawError && (
              <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-xl mb-4">
                {withdrawError}
              </div>
            )}
            
            {withdrawSuccess && (
              <div className="bg-green-50 border border-green-200 text-green-600 px-4 py-3 rounded-xl mb-4">
                {withdrawSuccess}
              </div>
            )}

            <form onSubmit={handleWithdraw}>
              <div className="mb-4">
                <label className="block text-sm font-medium text-slate-600 mb-1.5">Amount ($)</label>
                <input
                  type="number"
                  step="0.01"
                  min="10"
                  value={withdrawAmount}
                  onChange={(e) => setWithdrawAmount(e.target.value)}
                  className="w-full px-4 py-3 border border-slate-200 rounded-xl text-slate-800 focus:outline-none focus:border-orange-400"
                  placeholder="Minimum $10"
                />
                <p className="text-sm text-slate-500 mt-1">
                  Available: ${(stats?.balance || 0).toFixed(2)}
                </p>
              </div>

              <div className="mb-4">
                <label className="block text-sm font-medium text-slate-600 mb-1.5">Payment Method</label>
                <select
                  value={paymentMethod}
                  onChange={(e) => setPaymentMethod(e.target.value)}
                  className="w-full px-4 py-3 border border-slate-200 rounded-xl text-slate-800 focus:outline-none focus:border-orange-400"
                >
                  <option value="bank_transfer">Bank Transfer</option>
                  <option value="paypal">PayPal</option>
                </select>
              </div>

              {paymentMethod === "bank_transfer" ? (
                <>
                  <div className="mb-3">
                    <label className="block text-sm font-medium text-slate-600 mb-1.5">Bank Name</label>
                    <input
                      type="text"
                      value={bankName}
                      onChange={(e) => setBankName(e.target.value)}
                      className="w-full px-4 py-3 border border-slate-200 rounded-xl text-slate-800 focus:outline-none focus:border-orange-400"
                    />
                  </div>
                  <div className="mb-3">
                    <label className="block text-sm font-medium text-slate-600 mb-1.5">Account Number</label>
                    <input
                      type="text"
                      value={accountNumber}
                      onChange={(e) => setAccountNumber(e.target.value)}
                      className="w-full px-4 py-3 border border-slate-200 rounded-xl text-slate-800 focus:outline-none focus:border-orange-400"
                    />
                  </div>
                  <div className="mb-4">
                    <label className="block text-sm font-medium text-slate-600 mb-1.5">Account Name</label>
                    <input
                      type="text"
                      value={accountName}
                      onChange={(e) => setAccountName(e.target.value)}
                      className="w-full px-4 py-3 border border-slate-200 rounded-xl text-slate-800 focus:outline-none focus:border-orange-400"
                    />
                  </div>
                </>
              ) : (
                <div className="mb-4">
                  <label className="block text-sm font-medium text-slate-600 mb-1.5">PayPal Email</label>
                  <input
                    type="email"
                    value={paypalEmail}
                    onChange={(e) => setPaypalEmail(e.target.value)}
                    className="w-full px-4 py-3 border border-slate-200 rounded-xl text-slate-800 focus:outline-none focus:border-orange-400"
                  />
                </div>
              )}

              <div className="flex gap-3">
                <button
                  type="button"
                  onClick={() => setShowWithdrawModal(false)}
                  className="flex-1 bg-slate-200 hover:bg-slate-300 text-slate-700 font-semibold py-3 rounded-xl transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={withdrawing}
                  className="flex-1 bg-orange-500 hover:bg-orange-600 disabled:bg-slate-300 text-white font-semibold py-3 rounded-xl transition-colors"
                >
                  {withdrawing ? "Processing..." : "Submit Request"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </>
  );
}