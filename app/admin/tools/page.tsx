"use client";

import { useState, useEffect } from "react";
import { Save, Plug } from "lucide-react";

const STORAGE_KEY = "city-plus-pet-shop-tools";

interface ToolConnection {
  id: string;
  name: string;
  description: string;
  placeholder?: string;
  value: string;
  type?: "text" | "password";
}

const DEFAULT_CONNECTIONS: Omit<ToolConnection, "value">[] = [
  { id: "facebook_pixel", name: "Facebook Pixel ID", description: "Meta/Facebook Pixel for tracking", placeholder: "Pixel ID" },
  { id: "facebook_capi", name: "Facebook Conversion API Token", description: "Server-side events token", type: "password", placeholder: "Token" },
  { id: "google_analytics", name: "Google Analytics ID", description: "GA4 Measurement ID", placeholder: "G-XXXXXXXXXX" },
  { id: "google_tag_manager", name: "Google Tag Manager ID", description: "GTM container ID", placeholder: "GTM-XXXXXXX" },
  { id: "tiktok_pixel", name: "TikTok Pixel ID", description: "TikTok Ads pixel", placeholder: "Pixel ID" },
  { id: "custom_script_head", name: "Custom script (head)", description: "Optional script injected in <head>", placeholder: "Paste script or leave empty" },
  { id: "custom_script_body", name: "Custom script (body)", description: "Optional script before </body>", placeholder: "Paste script or leave empty" },
];

function loadStored(): Record<string, string> {
  if (typeof window === "undefined") return {};
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return {};
    return JSON.parse(raw);
  } catch {
    return {};
  }
}

function save(values: Record<string, string>) {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(values));
    localStorage.setItem(STORAGE_KEY + "-updated", new Date().toISOString());
  } catch {
    //
  }
}

export default function AdminToolsPage() {
  const [connections, setConnections] = useState<ToolConnection[]>([]);
  const [saved, setSaved] = useState(false);
  const [lastUpdated, setLastUpdated] = useState<string | null>(null);

  useEffect(() => {
    const stored = loadStored();
    setConnections(
      DEFAULT_CONNECTIONS.map((c) => ({
        ...c,
        value: stored[c.id] ?? "",
        type: c.type ?? "text",
      }))
    );
    setLastUpdated(localStorage.getItem(STORAGE_KEY + "-updated"));
  }, []);

  const handleChange = (id: string, value: string) => {
    setConnections((prev) => prev.map((c) => (c.id === id ? { ...c, value } : c)));
  };

  const handleSave = () => {
    const values: Record<string, string> = {};
    connections.forEach((c) => {
      if (c.value.trim()) values[c.id] = c.value.trim();
    });
    save(values);
    setSaved(true);
    setLastUpdated(new Date().toISOString());
    setTimeout(() => setSaved(false), 2000);
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Tools & Plugins</h1>
          <p className="mt-1 text-slate-600">
            Connection fields for analytics, pixels, and custom scripts. Last updated:{" "}
            {lastUpdated ? new Date(lastUpdated).toLocaleString() : "—"}
          </p>
        </div>
        <button
          type="button"
          onClick={handleSave}
          className="inline-flex items-center gap-2 rounded-lg bg-primary px-4 py-2 text-sm font-medium text-white hover:bg-primary/90"
        >
          <Save className="h-4 w-4" />
          {saved ? "Saved" : "Save"}
        </button>
      </div>

      <div className="rounded-xl border border-slate-200 bg-white shadow-sm">
        <div className="border-b border-slate-200 bg-slate-50 px-6 py-3 flex items-center gap-2">
          <Plug className="h-5 w-5 text-slate-600" />
          <span className="font-medium text-slate-900">Plugin connections</span>
        </div>
        <div className="divide-y divide-slate-100 p-6">
          {connections.map((c) => (
            <div key={c.id} className="py-4 first:pt-0 last:pb-0">
              <label className="block text-sm font-medium text-slate-900">{c.name}</label>
              <p className="text-xs text-slate-500 mt-0.5">{c.description}</p>
              <input
                type={c.type ?? "text"}
                value={c.value}
                onChange={(e) => handleChange(c.id, e.target.value)}
                placeholder={c.placeholder}
                className="mt-2 w-full rounded-lg border border-slate-300 px-3 py-2 font-mono text-sm"
              />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
