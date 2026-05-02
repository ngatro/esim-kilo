"use client";

import { useState, useEffect } from "react";
import { useAuth } from "@/components/providers/AuthProvider";

interface WalletData {
  walletBalance: number;
  affiliateBalance: number;
  affiliateCode: string;
  rank: string;
}

export default function WalletPage() {
  const { user, loading: authLoading } = useAuth();
  
  const [walletData, setWalletData] = useState<WalletData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user) {
      fetchWallet();
    }
  }, [user]);

  async function fetchWallet() {
    try {
      const res = await fetch("/api/wallet");
      if (res.ok) {
        const data = await res.json();
        setWalletData(data);
      }
    } catch (error) {
      console.error("Failed to fetch wallet:", error);
    } finally {
      setLoading(false);
    }
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
            <p className="text-slate-600">Please login to view your wallet.</p>
          </div>
        </div>
      </>
    );
  }

  return (
    <>
      <div className="min-h-screen bg-slate-50 py-12">
        <div className="max-w-2xl mx-auto px-4">
          <h1 className="text-3xl font-bold text-slate-800 mb-2">My Wallet</h1>
          <p className="text-slate-500 mb-8">Your earnings from affiliate commissions</p>

          {/* Affiliate Earnings Card */}
          <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6 mb-8">
            <p className="text-sm text-slate-500 mb-1">Affiliate Earnings</p>
            <p className="text-3xl font-bold text-green-600">${(walletData?.affiliateBalance || 0).toFixed(2)}</p>
            <div className={`inline-block mt-2 px-2 py-1 rounded-full text-xs ${rankColors[walletData?.rank || 'bronze']}`}>
              {walletData?.rank || 'bronze'} · {(walletData?.rank === 'diamond' ? '15%' : 
                walletData?.rank === 'gold' ? '12%' : 
                walletData?.rank === 'silver' ? '8%' : '5%')} commission
            </div>
            <p className="text-xs text-slate-400 mt-4">Balance can only be increased via affiliate commissions</p>
          </div>

          {/* Info about earning balance */}
          <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6">
            <h2 className="text-xl font-semibold text-slate-800 mb-4">How to Earn Balance</h2>
            <div className="space-y-3 text-sm text-slate-600">
              <div className="flex items-start gap-3">
                <div className="w-6 h-6 bg-orange-100 rounded-full flex items-center justify-center text-orange-600 text-xs font-bold shrink-0">1</div>
                <p>Share your affiliate link with friends and followers</p>
              </div>
              <div className="flex items-start gap-3">
                <div className="w-6 h-6 bg-orange-100 rounded-full flex items-center justify-center text-orange-600 text-xs font-bold shrink-0">2</div>
                <p>They make a purchase through your link</p>
              </div>
              <div className="flex items-start gap-3">
                <div className="w-6 h-6 bg-orange-100 rounded-full flex items-center justify-center text-orange-600 text-xs font-bold shrink-0">3</div>
                <p>You earn commission (5%-15%) on their order</p>
              </div>
              <div className="flex items-start gap-3">
                <div className="w-6 h-6 bg-orange-100 rounded-full flex items-center justify-center text-orange-600 text-xs font-bold shrink-0">4</div>
                <p>Request withdrawal anytime (min $10)</p>
              </div>
            </div>
          </div>

          {/* Referral Info */}
          <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6 mt-6">
            <h2 className="text-xl font-semibold text-slate-800 mb-4">Your Affiliate Link</h2>
            <p className="text-sm text-slate-500 mb-3">
              Share this link to earn commission on every purchase made by referrals.
            </p>
            <div className="flex gap-3">
              <input
                type="text"
                readOnly
                value={`${typeof window !== 'undefined' ? window.location.origin : ''}?ref=${walletData?.affiliateCode || ''}`}
                className="flex-1 px-4 py-3 border border-slate-200 rounded-xl text-slate-600 bg-slate-50"
              />
              <button
                onClick={() => navigator.clipboard.writeText(`${window.location.origin}?ref=${walletData?.affiliateCode}`)}
                className="bg-orange-500 hover:bg-orange-600 text-white font-semibold py-3 px-6 rounded-xl transition-colors"
              >
                Copy
              </button>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}