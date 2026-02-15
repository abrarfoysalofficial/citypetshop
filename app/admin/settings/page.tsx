"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { 
  Save, 
  Upload, 
  Store, 
  Palette, 
  Loader2, 
  Check,
  Image as ImageIcon,
  AlertCircle,
  Truck,
} from "lucide-react";
import type { SiteSettingsRow } from "@/lib/schema";

export default function AdminSettingsPage() {
  const [settings, setSettings] = useState<Partial<SiteSettingsRow>>({
    logo_url: null,
    site_name_en: "City Plus Pet Shop",
    address_en: null,
    phone: null,
    email: null,
    delivery_inside_dhaka: 70,
    delivery_outside_dhaka: 130,
    primary_color: "#0f172a",
    secondary_color: "#06b6d4",
    accent_color: "#f97316",
  });
  
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);

  useEffect(() => {
    fetchSettings();
  }, []);

  const fetchSettings = async () => {
    try {
      const res = await fetch("/api/admin/settings");
      if (res.status === 401) {
        window.location.href = "/admin/login";
        return;
      }
      if (res.ok) {
        const data = await res.json();
        setSettings(data);
      }
    } catch (err) {
      console.error("Failed to fetch settings:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleLogoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate file type
    if (!file.type.startsWith("image/")) {
      setMessage({ type: "error", text: "Please upload an image file" });
      return;
    }

    // Validate file size (max 2MB)
    if (file.size > 2 * 1024 * 1024) {
      setMessage({ type: "error", text: "File size must be less than 2MB" });
      return;
    }

    setUploading(true);
    setMessage(null);

    try {
      const formData = new FormData();
      formData.append("file", file);
      formData.append("bucket", "store-assets");

      const res = await fetch("/api/admin/upload", {
        method: "POST",
        body: formData,
      });

      if (res.ok) {
        const data = await res.json();
        setSettings((prev) => ({ ...prev, logo_url: data.url }));
        setMessage({ type: "success", text: "Logo uploaded successfully!" });
      } else {
        setMessage({ type: "error", text: "Failed to upload logo" });
      }
    } catch (err) {
      setMessage({ type: "error", text: "Error uploading logo" });
    } finally {
      setUploading(false);
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
        await fetchSettings(); // Refresh from server
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
        <h1 className="text-3xl font-bold text-slate-900">Store Settings</h1>
        <p className="mt-1 text-slate-600">Manage your store identity, branding, and business information.</p>
      </div>

      {/* Message */}
      {message && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className={`flex items-center gap-2 rounded-xl p-4 ${
            message.type === "success" 
              ? "bg-green-50 text-green-900 border border-green-200" 
              : "bg-red-50 text-red-900 border border-red-200"
          }`}
        >
          {message.type === "success" && <Check className="h-5 w-5" />}
          {message.type === "error" && <AlertCircle className="h-5 w-5" />}
          <p className="font-medium">{message.text}</p>
        </motion.div>
      )}

      {/* Logo Upload */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="rounded-2xl bg-white p-6 shadow-lg shadow-slate-200/50 border border-slate-100"
      >
        <div className="mb-6 flex items-center gap-3">
          <div className="rounded-xl bg-gradient-to-br from-purple-500 to-pink-500 p-3 text-white">
            <ImageIcon className="h-6 w-6" />
          </div>
          <div>
            <h3 className="text-lg font-bold text-slate-900">Store Logo</h3>
            <p className="text-sm text-slate-500">Upload your store logo (Max 2MB, PNG/JPG)</p>
          </div>
        </div>

        <div className="flex flex-col md:flex-row gap-6 items-start">
          {/* Current Logo */}
          {settings.logo_url && (
            <div className="flex-shrink-0">
              <div className="relative h-32 w-32 rounded-xl border-2 border-slate-200 bg-slate-50 p-2">
                <img
                  src={settings.logo_url}
                  alt="Store Logo"
                  className="h-full w-full object-contain"
                />
              </div>
              <p className="mt-2 text-xs text-slate-500 text-center">Current Logo</p>
            </div>
          )}

          {/* Upload Section */}
          <div className="flex-1">
            <label className="block">
              <input
                type="file"
                accept="image/*"
                onChange={handleLogoUpload}
                disabled={uploading}
                className="hidden"
              />
              <div className="flex cursor-pointer items-center gap-3 rounded-xl border-2 border-dashed border-slate-300 p-6 hover:border-blue-500 hover:bg-blue-50/50 transition-all">
                {uploading ? (
                  <Loader2 className="h-6 w-6 animate-spin text-blue-600" />
                ) : (
                  <Upload className="h-6 w-6 text-slate-400" />
                )}
                <div>
                  <p className="font-medium text-slate-900">
                    {uploading ? "Uploading..." : "Click to upload new logo"}
                  </p>
                  <p className="text-sm text-slate-500">PNG, JPG up to 2MB</p>
                </div>
              </div>
            </label>
          </div>
        </div>
      </motion.div>

      {/* Store Information */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="rounded-2xl bg-white p-6 shadow-lg shadow-slate-200/50 border border-slate-100"
      >
        <div className="mb-6 flex items-center gap-3">
          <div className="rounded-xl bg-gradient-to-br from-blue-500 to-cyan-500 p-3 text-white">
            <Store className="h-6 w-6" />
          </div>
          <div>
            <h3 className="text-lg font-bold text-slate-900">Store Information</h3>
            <p className="text-sm text-slate-500">Business details and contact information</p>
          </div>
        </div>

        <div className="grid gap-6 md:grid-cols-2">
          <div className="md:col-span-2">
            <label className="block text-sm font-medium text-slate-700 mb-2">
              Store Name *
            </label>
            <input
              type="text"
              value={settings.site_name_en || ""}
              onChange={(e) => setSettings({ ...settings, site_name_en: e.target.value })}
              className="w-full rounded-lg border border-slate-200 px-4 py-3 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
              placeholder="City Plus Pet Shop"
            />
          </div>

          <div className="md:col-span-2">
            <label className="block text-sm font-medium text-slate-700 mb-2">
              Store Address
            </label>
            <textarea
              value={settings.address_en || ""}
              onChange={(e) => setSettings({ ...settings, address_en: e.target.value })}
              rows={3}
              className="w-full rounded-lg border border-slate-200 px-4 py-3 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
              placeholder="Mirpur 2, Borobag, Dhaka 1216"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">
              Phone Number
            </label>
            <input
              type="tel"
              value={settings.phone || ""}
              onChange={(e) => setSettings({ ...settings, phone: e.target.value })}
              className="w-full rounded-lg border border-slate-200 px-4 py-3 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
              placeholder="+880 1643-390045"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">
              Email Address
            </label>
            <input
              type="email"
              value={settings.email || ""}
              onChange={(e) => setSettings({ ...settings, email: e.target.value })}
              className="w-full rounded-lg border border-slate-200 px-4 py-3 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
              placeholder="info@citypluspetshop.com"
            />
          </div>
        </div>
      </motion.div>

      {/* Delivery Settings */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="rounded-2xl bg-white p-6 shadow-lg shadow-slate-200/50 border border-slate-100"
      >
        <div className="mb-6 flex items-center gap-3">
          <div className="rounded-xl bg-gradient-to-br from-green-500 to-emerald-500 p-3 text-white">
            <Truck className="h-6 w-6" />
          </div>
          <div>
            <h3 className="text-lg font-bold text-slate-900">Delivery Charges</h3>
            <p className="text-sm text-slate-500">These values will be used in checkout</p>
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
                value={settings.delivery_inside_dhaka || 70}
                onChange={(e) => setSettings({ ...settings, delivery_inside_dhaka: parseFloat(e.target.value) || 0 })}
                className="w-full rounded-lg border border-slate-200 pl-8 pr-4 py-3 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">
              Delivery Outside Dhaka (৳)
            </label>
            <div className="relative">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500">৳</span>
              <input
                type="number"
                value={settings.delivery_outside_dhaka || 130}
                onChange={(e) => setSettings({ ...settings, delivery_outside_dhaka: parseFloat(e.target.value) || 0 })}
                className="w-full rounded-lg border border-slate-200 pl-8 pr-4 py-3 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
              />
            </div>
          </div>
        </div>
      </motion.div>

      {/* Theme Colors */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
        className="rounded-2xl bg-white p-6 shadow-lg shadow-slate-200/50 border border-slate-100"
      >
        <div className="mb-6 flex items-center gap-3">
          <div className="rounded-xl bg-gradient-to-br from-orange-500 to-red-500 p-3 text-white">
            <Palette className="h-6 w-6" />
          </div>
          <div>
            <h3 className="text-lg font-bold text-slate-900">Theme Colors</h3>
            <p className="text-sm text-slate-500">Customize your store&apos;s color scheme</p>
          </div>
        </div>

        <div className="grid gap-6 md:grid-cols-3">
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">
              Primary Color
            </label>
            <div className="flex gap-2">
              <input
                type="color"
                value={settings.primary_color || "#0f172a"}
                onChange={(e) => setSettings({ ...settings, primary_color: e.target.value })}
                className="h-12 w-16 rounded-lg border border-slate-200 cursor-pointer"
              />
              <input
                type="text"
                value={settings.primary_color || "#0f172a"}
                onChange={(e) => setSettings({ ...settings, primary_color: e.target.value })}
                className="flex-1 rounded-lg border border-slate-200 px-4 py-3 font-mono text-sm focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">
              Secondary Color
            </label>
            <div className="flex gap-2">
              <input
                type="color"
                value={settings.secondary_color || "#06b6d4"}
                onChange={(e) => setSettings({ ...settings, secondary_color: e.target.value })}
                className="h-12 w-16 rounded-lg border border-slate-200 cursor-pointer"
              />
              <input
                type="text"
                value={settings.secondary_color || "#06b6d4"}
                onChange={(e) => setSettings({ ...settings, secondary_color: e.target.value })}
                className="flex-1 rounded-lg border border-slate-200 px-4 py-3 font-mono text-sm focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">
              Accent Color
            </label>
            <div className="flex gap-2">
              <input
                type="color"
                value={settings.accent_color || "#f97316"}
                onChange={(e) => setSettings({ ...settings, accent_color: e.target.value })}
                className="h-12 w-16 rounded-lg border border-slate-200 cursor-pointer"
              />
              <input
                type="text"
                value={settings.accent_color || "#f97316"}
                onChange={(e) => setSettings({ ...settings, accent_color: e.target.value })}
                className="flex-1 rounded-lg border border-slate-200 px-4 py-3 font-mono text-sm focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
              />
            </div>
          </div>
        </div>
      </motion.div>

      {/* Save Button */}
      <div className="flex justify-end gap-3">
        <button
          onClick={fetchSettings}
          disabled={saving || uploading}
          className="rounded-xl border border-slate-300 px-6 py-3 font-medium text-slate-700 hover:bg-slate-50 disabled:opacity-50"
        >
          Reset Changes
        </button>
        <button
          onClick={handleSave}
          disabled={saving || uploading}
          className="flex items-center gap-2 rounded-xl bg-gradient-to-r from-blue-600 to-cyan-600 px-6 py-3 font-medium text-white shadow-lg shadow-blue-500/30 hover:shadow-xl hover:shadow-blue-500/40 disabled:opacity-50 transition-all"
        >
          {saving ? (
            <>
              <Loader2 className="h-5 w-5 animate-spin" />
              Saving...
            </>
          ) : (
            <>
              <Save className="h-5 w-5" />
              Save All Settings
            </>
          )}
        </button>
      </div>
    </div>
  );
}
