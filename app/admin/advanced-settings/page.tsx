"use client";

import { useState, useEffect } from "react";
import { Save, Sliders, Loader2 } from "lucide-react";

const STORAGE_KEY = "city-plus-pet-shop-advanced";

interface AdvancedSetting {
  key: string;
  label: string;
  description: string;
  type: "boolean" | "text" | "number";
  value: string | number | boolean;
}

function loadStored(): Record<string, string | number | boolean> {
  if (typeof window === "undefined") return {};
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return {};
    return JSON.parse(raw);
  } catch {
    return {};
  }
}

function saveLocal(values: Record<string, string | number | boolean>) {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(values));
    localStorage.setItem(STORAGE_KEY + "-updated", new Date().toISOString());
  } catch {
    //
  }
}

const DEFAULT_SETTINGS: Omit<AdvancedSetting, "value">[] = [
  { key: "maintenance_mode", label: "Maintenance mode", description: "Show maintenance page to visitors", type: "boolean" },
  { key: "maintenance_message", label: "Maintenance message", description: "Message shown during maintenance", type: "text" },
  { key: "guest_checkout", label: "Allow guest checkout", description: "Customers can checkout without account", type: "boolean" },
  { key: "reviews_require_approval", label: "Reviews require approval", description: "Product reviews need admin approval", type: "boolean" },
  { key: "low_stock_threshold", label: "Low stock threshold", description: "Alert when product stock is below this", type: "number" },
  { key: "max_cart_quantity", label: "Max quantity per item in cart", description: "0 = no limit", type: "number" },
  { key: "api_rate_limit", label: "API rate limit (requests per minute)", description: "For future API", type: "number" },
];

export default function AdminAdvancedSettingsPage() {
  const [settings, setSettings] = useState<AdvancedSetting[]>([]);
  const [saved, setSaved] = useState(false);
  const [lastUpdated, setLastUpdated] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    fetchSettings();
  }, []);

  const fetchSettings = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/admin/settings");
      if (res.ok) {
        const data = await res.json();
        const stored = (data.advanced_settings as Record<string, string | number | boolean>) ?? loadStored();
        setSettings(
          DEFAULT_SETTINGS.map((s) => {
            let value: string | number | boolean = stored[s.key];
            if (value === undefined) {
              if (s.type === "boolean") value = false;
              else if (s.type === "number") value = s.key === "low_stock_threshold" ? 5 : s.key === "max_cart_quantity" ? 0 : 60;
              else value = "";
            }
            return { ...s, value };
          })
        );
        setLastUpdated(data.updated_at ?? localStorage.getItem(STORAGE_KEY + "-updated"));
      } else {
        const stored = loadStored();
        setSettings(
          DEFAULT_SETTINGS.map((s) => {
            let value: string | number | boolean = stored[s.key];
            if (value === undefined) {
              if (s.type === "boolean") value = false;
              else if (s.type === "number") value = s.key === "low_stock_threshold" ? 5 : s.key === "max_cart_quantity" ? 0 : 60;
              else value = "";
            }
            return { ...s, value };
          })
        );
        setLastUpdated(localStorage.getItem(STORAGE_KEY + "-updated"));
      }
    } catch {
      const stored = loadStored();
      setSettings(
        DEFAULT_SETTINGS.map((s) => {
          let value: string | number | boolean = stored[s.key];
          if (value === undefined) {
            if (s.type === "boolean") value = false;
            else if (s.type === "number") value = s.key === "low_stock_threshold" ? 5 : s.key === "max_cart_quantity" ? 0 : 60;
            else value = "";
          }
          return { ...s, value };
        })
      );
      setLastUpdated(localStorage.getItem(STORAGE_KEY + "-updated"));
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (key: string, value: string | number | boolean) => {
    setSettings((prev) =>
      prev.map((s) => (s.key === key ? { ...s, value } : s))
    );
  };

  const handleSave = async () => {
    setSaving(true);
    const values: Record<string, string | number | boolean> = {};
    settings.forEach((s) => {
      values[s.key] = s.value;
    });
    try {
      const res = await fetch("/api/admin/settings", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ advanced_settings: values }),
      });
      if (res.ok) {
        setSaved(true);
        setLastUpdated(new Date().toISOString());
        setTimeout(() => setSaved(false), 2000);
      } else {
        saveLocal(values);
        setSaved(true);
        setLastUpdated(new Date().toISOString());
        setTimeout(() => setSaved(false), 2000);
      }
    } catch {
      saveLocal(values);
      setSaved(true);
      setLastUpdated(new Date().toISOString());
      setTimeout(() => setSaved(false), 2000);
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
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Advanced Settings</h1>
          <p className="mt-1 text-slate-600">
            Maintenance, checkout, stock, and API options. Last updated:{" "}
            {lastUpdated ? new Date(lastUpdated).toLocaleString() : "—"}
          </p>
        </div>
        <button
          type="button"
          onClick={handleSave}
          disabled={saving}
          className="inline-flex items-center gap-2 rounded-lg bg-primary px-4 py-2 text-sm font-medium text-white hover:bg-primary/90 disabled:opacity-50"
        >
          {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
          {saved ? "Saved" : "Save"}
        </button>
      </div>

      <div className="rounded-xl border border-slate-200 bg-white shadow-sm">
        <div className="border-b border-slate-200 bg-slate-50 px-6 py-3 flex items-center gap-2">
          <Sliders className="h-5 w-5 text-slate-600" />
          <span className="font-medium text-slate-900">Options</span>
        </div>
        <div className="divide-y divide-slate-100 p-6">
          {settings.map((s) => (
            <div key={s.key} className="py-4 first:pt-0 last:pb-0 flex flex-wrap items-start justify-between gap-4">
              <div>
                <label className="block text-sm font-medium text-slate-900">{s.label}</label>
                <p className="text-xs text-slate-500 mt-0.5">{s.description}</p>
              </div>
              <div className="min-w-[140px]">
                {s.type === "boolean" && (
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={!!s.value}
                      onChange={(e) => handleChange(s.key, e.target.checked)}
                      className="rounded border-slate-300"
                    />
                    <span className="text-sm text-slate-700">Enabled</span>
                  </label>
                )}
                {s.type === "text" && (
                  <input
                    type="text"
                    value={String(s.value)}
                    onChange={(e) => handleChange(s.key, e.target.value)}
                    className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm"
                    placeholder="Message"
                  />
                )}
                {s.type === "number" && (
                  <input
                    type="number"
                    min={0}
                    value={Number(s.value)}
                    onChange={(e) => handleChange(s.key, Number(e.target.value) || 0)}
                    className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm"
                  />
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
