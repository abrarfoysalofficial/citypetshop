"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { CreditCard, Banknote, Smartphone, Save, Loader2, AlertCircle, X, Check } from "lucide-react";
import type { PaymentGatewayRow } from "@/lib/schema";

const GATEWAY_ICONS = {
  cod: Banknote,
  bkash: Smartphone,
  nagad: Smartphone,
  sslcommerz: CreditCard,
};

export default function AdminPaymentsPage() {
  const [gateways, setGateways] = useState<PaymentGatewayRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState<string | null>(null);
  const [editingGateway, setEditingGateway] = useState<PaymentGatewayRow | null>(null);
  const [credentials, setCredentials] = useState<Record<string, any>>({});
  const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);

  useEffect(() => {
    fetchGateways();
  }, []);

  const fetchGateways = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/admin/payment-gateways");
      if (res.ok) {
        const data = await res.json();
        setGateways(data);
      }
    } catch (err) {
      console.error("Failed to fetch payment gateways:", err);
    } finally {
      setLoading(false);
    }
  };

  const toggleActive = async (gateway: PaymentGatewayRow) => {
    setSaving(gateway.id);
    setMessage(null);
    try {
      const res = await fetch("/api/admin/payment-gateways", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          id: gateway.id,
          is_active: !gateway.is_active,
        }),
      });
      if (res.ok) {
        await fetchGateways();
        setMessage({ 
          type: "success", 
          text: `${gateway.display_name_en} ${!gateway.is_active ? "enabled" : "disabled"} successfully!` 
        });
        setTimeout(() => setMessage(null), 3000);
      } else {
        setMessage({ type: "error", text: "Failed to update gateway status" });
      }
    } catch (err) {
      setMessage({ type: "error", text: "Error updating gateway" });
    } finally {
      setSaving(null);
    }
  };

  const openCredentialsModal = (gateway: PaymentGatewayRow) => {
    setEditingGateway(gateway);
    setCredentials(gateway.credentials_json || {});
  };

  const saveCredentials = async () => {
    if (!editingGateway) return;
    setSaving(editingGateway.id);
    setMessage(null);
    try {
      const res = await fetch("/api/admin/payment-gateways", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          id: editingGateway.id,
          credentials_json: credentials,
        }),
      });
      if (res.ok) {
        await fetchGateways();
        setEditingGateway(null);
        setCredentials({});
        setMessage({ type: "success", text: "Credentials saved successfully!" });
        setTimeout(() => setMessage(null), 3000);
      } else {
        setMessage({ type: "error", text: "Failed to save credentials" });
      }
    } catch (err) {
      setMessage({ type: "error", text: "Error saving credentials" });
    } finally {
      setSaving(null);
    }
  };

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
        <h1 className="text-3xl font-bold text-slate-900">Payment Gateways</h1>
        <p className="mt-1 text-slate-600">Configure payment methods for Bangladesh market</p>
      </div>

      {/* Message */}
      <AnimatePresence>
        {message && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className={`flex items-center gap-2 rounded-xl p-4 ${
              message.type === "success" 
                ? "bg-green-50 text-green-900 border border-green-200" 
                : "bg-red-50 text-red-900 border border-red-200"
            }`}
          >
            {message.type === "success" ? <Check className="h-5 w-5" /> : <AlertCircle className="h-5 w-5" />}
            <p className="font-medium">{message.text}</p>
          </motion.div>
        )}
      </AnimatePresence>
      
      {/* Info Banner */}
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        className="rounded-2xl bg-blue-50 border border-blue-200 p-4"
      >
        <div className="flex gap-3">
          <AlertCircle className="h-5 w-5 text-blue-600 flex-shrink-0 mt-0.5" />
          <div className="text-sm text-blue-900">
            <p className="font-medium mb-1">Zero-Code Payment Management</p>
            <p>Enable/disable payment gateways and configure credentials directly from this page. Active payment methods will automatically appear in checkout.</p>
          </div>
        </div>
      </motion.div>

      {/* Gateway Cards */}
      <div className="grid gap-4 sm:grid-cols-2">
        {gateways.map((gateway, index) => {
          const Icon = GATEWAY_ICONS[gateway.gateway as keyof typeof GATEWAY_ICONS] || CreditCard;
          const isActive = gateway.is_active;
          const isSaving = saving === gateway.id;

          return (
            <motion.div
              key={gateway.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              className="flex flex-col rounded-2xl border border-slate-200 bg-white p-6 shadow-lg shadow-slate-200/50"
            >
              <div className="flex items-start justify-between gap-3">
                <div className="flex items-center gap-3">
                  <motion.div 
                    animate={{ 
                      scale: isActive ? [1, 1.05, 1] : 1 
                    }}
                    transition={{ duration: 0.3 }}
                    className={`flex h-14 w-14 items-center justify-center rounded-xl ${
                      isActive 
                        ? 'bg-gradient-to-br from-green-500 to-emerald-500 shadow-lg shadow-green-500/30' 
                        : 'bg-slate-100'
                    }`}
                  >
                    <Icon className={`h-7 w-7 ${isActive ? 'text-white' : 'text-slate-600'}`} />
                  </motion.div>
                  <div>
                    <h2 className="font-bold text-slate-900">{gateway.display_name_en}</h2>
                    <motion.span 
                      animate={{ 
                        backgroundColor: isActive ? "#d1fae5" : "#f1f5f9" 
                      }}
                      className={`mt-1 inline-block rounded-full px-2.5 py-1 text-xs font-medium ${
                        isActive ? 'text-emerald-700' : 'text-slate-600'
                      }`}
                    >
                      {isActive ? "● Active" : "○ Inactive"}
                    </motion.span>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => toggleActive(gateway)}
                  disabled={isSaving}
                  className={`rounded-lg px-3 py-1.5 text-sm font-medium transition-all disabled:opacity-50 ${
                    isActive 
                      ? 'bg-red-50 text-red-700 hover:bg-red-100 border border-red-200' 
                      : 'bg-blue-50 text-blue-700 hover:bg-blue-100 border border-blue-200'
                  }`}
                >
                  {isSaving ? <Loader2 className="h-4 w-4 animate-spin inline" /> : (isActive ? "Disable" : "Enable")}
                </button>
              </div>
              
              {gateway.gateway !== "cod" && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: "auto" }}
                  transition={{ delay: 0.2 }}
                  className="mt-4 pt-4 border-t border-slate-200"
                >
                  <button
                    type="button"
                    onClick={() => openCredentialsModal(gateway)}
                    className="w-full rounded-xl bg-gradient-to-r from-blue-600 to-cyan-600 px-4 py-2.5 text-sm font-medium text-white shadow-lg shadow-blue-500/30 hover:shadow-xl hover:shadow-blue-500/40 transition-all"
                  >
                    Configure API Credentials
                  </button>
                </motion.div>
              )}
            </motion.div>
          );
        })}
      </div>

      {/* Credentials Modal */}
      <AnimatePresence>
        {editingGateway && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4"
            onClick={() => setEditingGateway(null)}
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
              className="max-w-md w-full rounded-2xl bg-white p-6 shadow-2xl"
            >
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-bold text-slate-900">
                  Configure {editingGateway.display_name_en}
                </h2>
                <button
                  onClick={() => setEditingGateway(null)}
                  className="rounded-lg p-2 text-slate-500 hover:bg-slate-100"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>
              
              <div className="space-y-4">
                {editingGateway.gateway === "bkash" && (
                  <>
                    <div>
                      <label className="block text-sm font-medium text-slate-700 mb-2">App Key</label>
                      <input
                        type="text"
                        value={credentials.app_key || ""}
                        onChange={(e) => setCredentials({ ...credentials, app_key: e.target.value })}
                        className="w-full rounded-lg border border-slate-200 px-4 py-2.5 text-sm focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                        placeholder="Enter bKash App Key"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-slate-700 mb-2">App Secret</label>
                      <input
                        type="password"
                        value={credentials.app_secret || ""}
                        onChange={(e) => setCredentials({ ...credentials, app_secret: e.target.value })}
                        className="w-full rounded-lg border border-slate-200 px-4 py-2.5 text-sm focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                        placeholder="Enter bKash App Secret"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-slate-700 mb-2">Username</label>
                      <input
                        type="text"
                        value={credentials.username || ""}
                        onChange={(e) => setCredentials({ ...credentials, username: e.target.value })}
                        className="w-full rounded-lg border border-slate-200 px-4 py-2.5 text-sm focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                        placeholder="Enter bKash Username"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-slate-700 mb-2">Password</label>
                      <input
                        type="password"
                        value={credentials.password || ""}
                        onChange={(e) => setCredentials({ ...credentials, password: e.target.value })}
                        className="w-full rounded-lg border border-slate-200 px-4 py-2.5 text-sm focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                        placeholder="Enter bKash Password"
                      />
                    </div>
                  </>
                )}

                {editingGateway.gateway === "sslcommerz" && (
                  <>
                    <div>
                      <label className="block text-sm font-medium text-slate-700 mb-2">Store ID</label>
                      <input
                        type="text"
                        value={credentials.store_id || ""}
                        onChange={(e) => setCredentials({ ...credentials, store_id: e.target.value })}
                        className="w-full rounded-lg border border-slate-200 px-4 py-2.5 text-sm focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                        placeholder="Enter SSLCommerz Store ID"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-slate-700 mb-2">Store Password</label>
                      <input
                        type="password"
                        value={credentials.store_password || ""}
                        onChange={(e) => setCredentials({ ...credentials, store_password: e.target.value })}
                        className="w-full rounded-lg border border-slate-200 px-4 py-2.5 text-sm focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                        placeholder="Enter SSLCommerz Store Password"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-slate-700 mb-2">Environment</label>
                      <select
                        value={credentials.environment || "sandbox"}
                        onChange={(e) => setCredentials({ ...credentials, environment: e.target.value })}
                        className="w-full rounded-lg border border-slate-200 px-4 py-2.5 text-sm focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                      >
                        <option value="sandbox">Sandbox (Testing)</option>
                        <option value="live">Live (Production)</option>
                      </select>
                    </div>
                  </>
                )}

                {editingGateway.gateway === "nagad" && (
                  <>
                    <div>
                      <label className="block text-sm font-medium text-slate-700 mb-2">Merchant ID</label>
                      <input
                        type="text"
                        value={credentials.merchant_id || ""}
                        onChange={(e) => setCredentials({ ...credentials, merchant_id: e.target.value })}
                        className="w-full rounded-lg border border-slate-200 px-4 py-2.5 text-sm focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                        placeholder="Enter Nagad Merchant ID"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-slate-700 mb-2">Merchant Number</label>
                      <input
                        type="text"
                        value={credentials.merchant_number || ""}
                        onChange={(e) => setCredentials({ ...credentials, merchant_number: e.target.value })}
                        className="w-full rounded-lg border border-slate-200 px-4 py-2.5 text-sm focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                        placeholder="Enter Nagad Merchant Number"
                      />
                    </div>
                  </>
                )}
              </div>

              <div className="flex gap-3 mt-6">
                <button
                  type="button"
                  onClick={() => {
                    setEditingGateway(null);
                    setCredentials({});
                  }}
                  className="flex-1 rounded-xl border border-slate-300 px-4 py-2.5 text-sm font-medium text-slate-700 hover:bg-slate-50"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={saveCredentials}
                  disabled={saving === editingGateway.id}
                  className="flex-1 rounded-xl bg-gradient-to-r from-blue-600 to-cyan-600 px-4 py-2.5 text-sm font-medium text-white shadow-lg shadow-blue-500/30 hover:shadow-xl hover:shadow-blue-500/40 disabled:opacity-50 flex items-center justify-center gap-2"
                >
                  {saving === editingGateway.id ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin" />
                      Saving...
                    </>
                  ) : (
                    <>
                      <Save className="h-4 w-4" />
                      Save Credentials
                    </>
                  )}
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
