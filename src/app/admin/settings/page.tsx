"use client";

import { useState, useEffect } from "react";
import { useAuth } from "@/components/providers/AuthProvider";
import Link from "next/link";

interface SiteSettings {
  whatsappNumber: string;
  supportEmail: string;
  tawkPropertyId: string;
  tawkWidgetId: string;
}

export default function AdminSettingsPage() {
  const { user, loading: authLoading } = useAuth();
  const [settings, setSettings] = useState<SiteSettings>({
    whatsappNumber: "84912345678",
    supportEmail: "support@openworldesim.com",
    tawkPropertyId: "",
    tawkWidgetId: "",
  });
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    fetchSettings();
  }, []);

  async function fetchSettings() {
    try {
      const res = await fetch("/api/admin/settings");
      if (res.ok) {
        const data = await res.json();
        if (data.whatsappNumber) setSettings((prev) => ({ ...prev, whatsappNumber: data.whatsappNumber }));
        if (data.supportEmail) setSettings((prev) => ({ ...prev, supportEmail: data.supportEmail }));
        if (data.tawkPropertyId) setSettings((prev) => ({ ...prev, tawkPropertyId: data.tawkPropertyId }));
        if (data.tawkWidgetId) setSettings((prev) => ({ ...prev, tawkWidgetId: data.tawkWidgetId }));
      }
    } catch (error) {
      console.error("Failed to fetch settings:", error);
    }
  }

  async function saveSettings() {
    setSaving(true);
    setSaved(false);
    try {
      const res = await fetch("/api/admin/settings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(settings),
      });
      if (res.ok) {
        setSaved(true);
        setTimeout(() => setSaved(false), 3000);
      }
    } catch (error) {
      console.error("Failed to save settings:", error);
    } finally {
      setSaving(false);
    }
  }

  if (authLoading) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="animate-spin w-8 h-8 border-3 border-orange-500 border-t-transparent rounded-full" />
      </div>
    );
  }

  if (!user || user.role !== "admin") {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="text-center">
          <p className="text-slate-600 text-lg">Access denied</p>
          <Link href="/" className="text-orange-500 hover:underline mt-2 inline-block">Go to Home</Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50">
      <div className="bg-white border-b border-slate-200 px-6 py-4">
        <div className="max-w-3xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Link href="/admin" className="text-xl font-bold text-slate-800">Admin Dashboard</Link>
            <span className="text-slate-400">/</span>
            <span className="text-sm text-slate-500">Settings</span>
          </div>
          <Link href="/" className="text-slate-500 hover:text-slate-700 text-sm">View Site</Link>
        </div>
      </div>

      <div className="max-w-3xl mx-auto px-6 py-8">
        <h1 className="text-2xl font-bold text-slate-800 mb-2">Site Settings</h1>
        <p className="text-slate-500 mb-8">Configure your site contact information</p>

        <div className="bg-white rounded-xl border border-slate-200 p-6">
          <div className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">WhatsApp Number</label>
              <input
                type="text"
                value={settings.whatsappNumber}
                onChange={(e) => setSettings({ ...settings, whatsappNumber: e.target.value })}
                placeholder="84912345678"
                className="w-full px-4 py-2.5 border border-slate-200 rounded-lg focus:outline-none focus:border-orange-400"
              />
              <p className="text-xs text-slate-500 mt-1">Phone number for WhatsApp support (without + symbol)</p>
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">Support Email</label>
              <input
                type="email"
                value={settings.supportEmail}
                onChange={(e) => setSettings({ ...settings, supportEmail: e.target.value })}
                placeholder="support@example.com"
                className="w-full px-4 py-2.5 border border-slate-200 rounded-lg focus:outline-none focus:border-orange-400"
              />
              <p className="text-xs text-slate-500 mt-1">Email address for customer support</p>
            </div>

            <div className="border-t border-slate-200 pt-6">
              <h3 className="text-lg font-semibold text-slate-800 mb-4">Live Chat (Tawk.to)</h3>
              <p className="text-sm text-slate-500 mb-4">Configure Tawk.to live chat widget</p>
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">Property ID</label>
              <input
                type="text"
                value={settings.tawkPropertyId}
                onChange={(e) => setSettings({ ...settings, tawkPropertyId: e.target.value })}
                placeholder="e.g., 64f8a1b2e0c67270e1d2f123"
                className="w-full px-4 py-2.5 border border-slate-200 rounded-lg focus:outline-none focus:border-orange-400"
              />
              <p className="text-xs text-slate-500 mt-1">Your Tawk.to property ID (from Dashboard → Chat Widget → Property ID)</p>
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">Widget ID</label>
              <input
                type="text"
                value={settings.tawkWidgetId}
                onChange={(e) => setSettings({ ...settings, tawkWidgetId: e.target.value })}
                placeholder="e.g., 1hbcdef12"
                className="w-full px-4 py-2.5 border border-slate-200 rounded-lg focus:outline-none focus:border-orange-400"
              />
              <p className="text-xs text-slate-500 mt-1">Your Tawk.to widget ID (from Dashboard → Chat Widget → Widget ID)</p>
            </div>

            <div className="pt-4 flex items-center gap-4">
              <button
                onClick={saveSettings}
                disabled={saving}
                className="bg-orange-500 hover:bg-orange-600 disabled:bg-slate-300 text-white font-medium px-6 py-2.5 rounded-lg transition-colors flex items-center gap-2"
              >
                {saving ? (
                  <>
                    <div className="animate-spin w-4 h-4 border-2 border-white border-t-transparent rounded-full" />
                    Saving...
                  </>
                ) : (
                  "Save Changes"
                )}
              </button>
              {saved && (
                <span className="text-green-600 text-sm flex items-center gap-1">
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                  Saved!
                </span>
              )}
            </div>
          </div>
        </div>

        <div className="mt-8 bg-blue-50 border border-blue-200 rounded-xl p-4">
          <h3 className="font-medium text-blue-800 mb-2">Preview</h3>
          <p className="text-sm text-blue-700">
            These settings will be used across the site for:
          </p>
          <ul className="text-sm text-blue-600 mt-2 space-y-1">
            <li>• Support widget WhatsApp link</li>
            <li>• Support page WhatsApp button</li>
            <li>• Contact email on support page</li>
          </ul>
        </div>
      </div>
    </div>
  );
}