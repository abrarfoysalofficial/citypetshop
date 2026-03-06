"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import {
  Save,
  Loader2,
  Check,
  AlertCircle,
  BarChart3,
  Shield,
  ExternalLink,
} from "lucide-react";

type TrackingSettings = {
  facebook_pixel_id: string | null;
  facebook_capi_token: string | null;
  google_analytics_id: string | null;
  google_tag_manager_id: string | null;
  tiktok_pixel_id: string | null;
};

const DEFAULT: TrackingSettings = {
  facebook_pixel_id: null,
  facebook_capi_token: null,
  google_analytics_id: null,
  google_tag_manager_id: null,
  tiktok_pixel_id: null,
};

export default function AdminTrackingPage() {
  const [settings, setSettings] = useState<TrackingSettings>(DEFAULT);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
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
        setSettings({
          facebook_pixel_id: data.facebook_pixel_id ?? null,
          facebook_capi_token: data.facebook_capi_token ?? null,
          google_analytics_id: data.google_analytics_id ?? null,
          google_tag_manager_id: data.google_tag_manager_id ?? null,
          tiktok_pixel_id: data.tiktok_pixel_id ?? null,
        });
      }
    } catch (err) {
      console.error("Failed to fetch tracking settings:", err);
      setMessage({ type: "error", text: "Failed to load settings" });
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
        setMessage({ type: "success", text: "Tracking settings saved! Changes apply to storefront immediately." });
        setTimeout(() => setMessage(null), 4000);
      } else {
        setMessage({ type: "error", text: "Failed to save settings" });
      }
    } catch {
      setMessage({ type: "error", text: "Request failed" });
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
      <div>
        <h1 className="text-3xl font-bold text-slate-900">Tracking & Pixels</h1>
        <p className="mt-1 text-slate-600">
          Manage Facebook Pixel, TikTok Pixel, Google Tag Manager, and ads tracking from one place.
        </p>
      </div>

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
          {message.type === "success" ? <Check className="h-5 w-5" /> : <AlertCircle className="h-5 w-5" />}
          <p className="font-medium">{message.text}</p>
        </motion.div>
      )}

      {/* Info: Ads tracking setup */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className="rounded-2xl bg-blue-50 border border-blue-200 p-4"
      >
        <div className="flex gap-3">
          <BarChart3 className="h-5 w-5 text-blue-600 flex-shrink-0 mt-0.5" />
          <div className="text-sm text-blue-900">
            <p className="font-medium mb-1">Ads Tracking Setup</p>
            <p>
              Add your pixel IDs and tokens below. They will be injected on the storefront (excluding /admin).
              For Facebook CAPI, use the Events Manager → Settings → Conversions API to generate an access token.
              GTM can host GA4, Meta Pixel, TikTok, and other tags.
            </p>
            <a
              href="https://business.facebook.com/events_manager"
              target="_blank"
              rel="noopener noreferrer"
              className="mt-2 inline-flex items-center gap-1 text-blue-700 hover:underline font-medium"
            >
              Facebook Events Manager <ExternalLink className="h-3.5 w-3.5" />
            </a>
          </div>
        </div>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="rounded-2xl bg-white p-6 shadow-lg shadow-slate-200/50 border border-slate-100"
      >
        <div className="mb-6 flex items-center gap-3">
          <div className="rounded-xl bg-gradient-to-br from-blue-500 to-cyan-500 p-3 text-white">
            <BarChart3 className="h-6 w-6" />
          </div>
          <div>
            <h3 className="text-lg font-bold text-slate-900">Tracking IDs & Tokens</h3>
            <p className="text-sm text-slate-500">Configure all pixels and ads tracking from admin</p>
          </div>
        </div>

        <div className="space-y-6">
          {/* Facebook Pixel */}
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">Facebook Pixel ID</label>
            <input
              type="text"
              value={settings.facebook_pixel_id || ""}
              onChange={(e) =>
                setSettings({ ...settings, facebook_pixel_id: e.target.value || null })
              }
              className="w-full rounded-lg border border-slate-200 px-4 py-3 font-mono text-sm focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
              placeholder="123456789012345"
            />
            <p className="mt-1 text-xs text-slate-500">Client-side pixel for Meta Ads. Find in Events Manager.</p>
          </div>

          {/* Facebook CAPI Token */}
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2 flex items-center gap-2">
              Facebook Conversion API Token <Shield className="h-4 w-4 text-amber-500" />
            </label>
            <input
              type="password"
              value={settings.facebook_capi_token || ""}
              onChange={(e) =>
                setSettings({ ...settings, facebook_capi_token: e.target.value || null })
              }
              className="w-full rounded-lg border border-slate-200 px-4 py-3 font-mono text-sm focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
              placeholder="Server-side CAPI access token (stored securely)"
            />
            <p className="mt-1 text-xs text-slate-500">
              Server-side events for better attribution. Generate in Events Manager → Settings → Conversions API.
            </p>
          </div>

          {/* Google Tag Manager */}
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">Google Tag Manager ID</label>
            <input
              type="text"
              value={settings.google_tag_manager_id || ""}
              onChange={(e) =>
                setSettings({ ...settings, google_tag_manager_id: e.target.value || null })
              }
              className="w-full rounded-lg border border-slate-200 px-4 py-3 font-mono text-sm focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
              placeholder="GTM-XXXXXXX"
            />
            <p className="mt-1 text-xs text-slate-500">
              Use GTM to manage GA4, Meta Pixel, TikTok, and other tags in one place.
            </p>
          </div>

          {/* Google Analytics */}
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">Google Analytics ID (GA4)</label>
            <input
              type="text"
              value={settings.google_analytics_id || ""}
              onChange={(e) =>
                setSettings({ ...settings, google_analytics_id: e.target.value || null })
              }
              className="w-full rounded-lg border border-slate-200 px-4 py-3 font-mono text-sm focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
              placeholder="G-XXXXXXXXXX"
            />
            <p className="mt-1 text-xs text-slate-500">Optional if using GTM. Direct gtag.js injection.</p>
          </div>

          {/* TikTok Pixel */}
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">TikTok Pixel ID</label>
            <input
              type="text"
              value={settings.tiktok_pixel_id || ""}
              onChange={(e) =>
                setSettings({ ...settings, tiktok_pixel_id: e.target.value || null })
              }
              className="w-full rounded-lg border border-slate-200 px-4 py-3 font-mono text-sm focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
              placeholder="XXXXXXXXXXXX"
            />
            <p className="mt-1 text-xs text-slate-500">TikTok Ads pixel for conversion tracking.</p>
          </div>
        </div>

        <div className="mt-8 flex justify-end gap-3">
          <button
            type="button"
            onClick={fetchSettings}
            disabled={saving}
            className="rounded-xl border border-slate-300 px-6 py-3 font-medium text-slate-700 hover:bg-slate-50 disabled:opacity-50"
          >
            Reset
          </button>
          <button
            type="button"
            onClick={handleSave}
            disabled={saving}
            className="flex items-center gap-2 rounded-xl bg-gradient-to-r from-blue-600 to-cyan-600 px-6 py-3 font-medium text-white shadow-lg shadow-blue-500/30 hover:shadow-xl hover:shadow-blue-500/40 disabled:opacity-50"
          >
            {saving ? (
              <>
                <Loader2 className="h-5 w-5 animate-spin" />
                Saving...
              </>
            ) : (
              <>
                <Save className="h-5 w-5" />
                Save All
              </>
            )}
          </button>
        </div>
      </motion.div>
    </div>
  );
}
