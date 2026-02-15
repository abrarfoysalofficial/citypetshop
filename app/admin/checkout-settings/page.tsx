"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Save, Truck, DollarSign, Loader2, AlertCircle } from "lucide-react";
import { isSupabaseConfigured } from "@/src/config/env";

export default function CheckoutSettingsPage() {
  const [settings, setSettings] = useState({
    delivery_inside_dhaka: 70,
    delivery_outside_dhaka: 130,
    free_delivery_threshold: 2000,
    terms_url: "/terms",
    privacy_url: "/privacy",
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);

  useEffect(() => {
    fetchSettings();
  }, []);

  const fetchSettings = async () => {
    if (!isSupabaseConfigured()) {
      setLoading(false);
      return;
    }

    try {
      const res = await fetch("/api/admin/settings");
      if (res.ok) {
        const data = await res.json();
        setSettings({
          delivery_inside_dhaka: data.delivery_inside_dhaka ?? 70,
          delivery_outside_dhaka: data.delivery_outside_dhaka ?? 130,
          free_delivery_threshold: data.free_delivery_threshold ?? 2000,
          terms_url: data.terms_url || "/terms",
          privacy_url: data.privacy_url || "/privacy",
        });
      }
    } catch (err) {
      console.error("Failed to fetch settings:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    setSaving(true);
    setMessage(null);

    try {
      const res = await fetch("/api/admin/settings", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(settings),
      });

      if (res.ok) {
        setMessage({ type: "success", text: "Settings saved successfully!" });
        setTimeout(() => setMessage(null), 3000);
      } else {
        setMessage({ type: "error", text: "Failed to save settings" });
      }
    } catch (err) {
      setMessage({ type: "error", text: "Error saving settings" });
    } finally {
      setSaving(false);
    }
  };

  if (!isSupabaseConfigured()) {
    return (
      <div className="rounded-2xl bg-slate-50 border border-slate-200 p-6">
        <div className="flex gap-3">
          <AlertCircle className="h-5 w-5 text-slate-500 flex-shrink-0 mt-0.5" />
          <div className="text-sm text-slate-700">
            <p className="font-medium mb-1">Unable to load checkout settings</p>
            <p>Service temporarily unavailable. Please try again later.</p>
          </div>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="flex h-96 items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-slate-900">Checkout Settings</h1>
        <p className="mt-1 text-slate-600">Configure delivery fees, free shipping rules, and checkout policies.</p>
      </div>

      {/* Message */}
      {message && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className={`rounded-xl p-4 ${
            message.type === "success" ? "bg-green-50 text-green-900 border border-green-200" : "bg-red-50 text-red-900 border border-red-200"
          }`}
        >
          <p className="font-medium">{message.text}</p>
        </motion.div>
      )}

      {/* Delivery Fees */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="rounded-2xl bg-white p-6 shadow-lg shadow-slate-200/50 border border-slate-100"
      >
        <div className="mb-6 flex items-center gap-3">
          <div className="rounded-xl bg-gradient-to-br from-blue-500 to-cyan-500 p-3 text-white">
            <Truck className="h-6 w-6" />
          </div>
          <div>
            <h3 className="text-lg font-bold text-slate-900">Delivery Charges</h3>
            <p className="text-sm text-slate-500">Set delivery fees for different locations</p>
          </div>
        </div>

        <div className="grid gap-6 md:grid-cols-2">
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">
              Delivery Inside Dhaka (৳)
            </label>
            <div className="relative">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500">৳</span>
              <input
                type="number"
                value={settings.delivery_inside_dhaka}
                onChange={(e) => setSettings({ ...settings, delivery_inside_dhaka: parseFloat(e.target.value) || 0 })}
                className="w-full rounded-lg border border-slate-200 pl-8 pr-4 py-3 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
              />
            </div>
            <p className="mt-1.5 text-xs text-slate-500">Flat rate for deliveries within Dhaka city</p>
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">
              Delivery Outside Dhaka (৳)
            </label>
            <div className="relative">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500">৳</span>
              <input
                type="number"
                value={settings.delivery_outside_dhaka}
                onChange={(e) => setSettings({ ...settings, delivery_outside_dhaka: parseFloat(e.target.value) || 0 })}
                className="w-full rounded-lg border border-slate-200 pl-8 pr-4 py-3 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
              />
            </div>
            <p className="mt-1.5 text-xs text-slate-500">Flat rate for deliveries outside Dhaka</p>
          </div>
        </div>
      </motion.div>

      {/* Free Delivery */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="rounded-2xl bg-white p-6 shadow-lg shadow-slate-200/50 border border-slate-100"
      >
        <div className="mb-6 flex items-center gap-3">
          <div className="rounded-xl bg-gradient-to-br from-green-500 to-emerald-500 p-3 text-white">
            <DollarSign className="h-6 w-6" />
          </div>
          <div>
            <h3 className="text-lg font-bold text-slate-900">Free Delivery Threshold</h3>
            <p className="text-sm text-slate-500">Offer free delivery above a certain order value</p>
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-slate-700 mb-2">
            Minimum Order Value for Free Delivery (৳)
          </label>
          <div className="relative">
            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500">৳</span>
            <input
              type="number"
              value={settings.free_delivery_threshold}
              onChange={(e) => setSettings({ ...settings, free_delivery_threshold: parseFloat(e.target.value) || 0 })}
              className="w-full rounded-lg border border-slate-200 pl-8 pr-4 py-3 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
            />
          </div>
          <p className="mt-1.5 text-xs text-slate-500">
            Set to 0 to disable free delivery. Orders above this amount will have free shipping.
          </p>
        </div>

        {settings.free_delivery_threshold > 0 && (
          <div className="mt-4 rounded-lg bg-green-50 border border-green-200 p-4">
            <p className="text-sm text-green-900">
              💡 Free delivery will be offered on orders above <strong>৳{settings.free_delivery_threshold}</strong>
            </p>
          </div>
        )}
      </motion.div>

      {/* Policy URLs */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="rounded-2xl bg-white p-6 shadow-lg shadow-slate-200/50 border border-slate-100"
      >
        <div className="mb-6">
          <h3 className="text-lg font-bold text-slate-900">Checkout Policies</h3>
          <p className="text-sm text-slate-500">Links shown in checkout footer</p>
        </div>

        <div className="grid gap-6 md:grid-cols-2">
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">
              Terms & Conditions URL
            </label>
            <input
              type="text"
              value={settings.terms_url}
              onChange={(e) => setSettings({ ...settings, terms_url: e.target.value })}
              className="w-full rounded-lg border border-slate-200 px-4 py-3 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
              placeholder="/terms"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">
              Privacy Policy URL
            </label>
            <input
              type="text"
              value={settings.privacy_url}
              onChange={(e) => setSettings({ ...settings, privacy_url: e.target.value })}
              className="w-full rounded-lg border border-slate-200 px-4 py-3 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
              placeholder="/privacy"
            />
          </div>
        </div>
      </motion.div>

      {/* Save Button */}
      <div className="flex justify-end">
        <button
          onClick={handleSave}
          disabled={saving}
          className="flex items-center gap-2 rounded-xl bg-gradient-to-r from-blue-600 to-cyan-600 px-6 py-3 font-medium text-white shadow-lg shadow-blue-500/30 hover:shadow-xl hover:shadow-blue-500/40 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
        >
          {saving ? (
            <>
              <Loader2 className="h-5 w-5 animate-spin" />
              Saving...
            </>
          ) : (
            <>
              <Save className="h-5 w-5" />
              Save Settings
            </>
          )}
        </button>
      </div>
    </div>
  );
}
