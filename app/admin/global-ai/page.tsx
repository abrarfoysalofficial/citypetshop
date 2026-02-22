"use client";

import { useState, useEffect } from "react";
import { Loader2, Bot, Shield } from "lucide-react";

export default function AdminGlobalAIPage() {
  const [safeMode, setSafeMode] = useState(true);
  const [loggingEnabled, setLoggingEnabled] = useState(true);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [msg, setMsg] = useState<{ ok: boolean; text: string } | null>(null);
  const [existingAdv, setExistingAdv] = useState<Record<string, unknown>>({});

  useEffect(() => {
    fetch("/api/admin/settings")
      .then((r) => {
        if (r.status === 401) {
          window.location.href = "/admin/login";
          return null;
        }
        return r.json();
      })
      .then((d) => {
        const adv = d?.advanced_settings && typeof d.advanced_settings === "object"
          ? (d.advanced_settings as Record<string, unknown>)
          : {};
        setExistingAdv(adv);
        setSafeMode((adv.aiSafeMode as boolean) ?? true);
        setLoggingEnabled((adv.aiLogging as boolean) ?? true);
      })
      .finally(() => setLoading(false));
  }, []);

  const handleSave = async () => {
    setSaving(true);
    setMsg(null);
    try {
      const merged = { ...existingAdv, aiSafeMode: safeMode, aiLogging: loggingEnabled };
      const res = await fetch("/api/admin/settings", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          advanced_settings: merged,
        }),
      });
      if (res.ok) {
        setMsg({ ok: true, text: "Settings saved" });
      } else {
        setMsg({ ok: false, text: "Failed to save" });
      }
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex h-64 items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-blue-100">
          <Bot className="h-6 w-6 text-blue-600" />
        </div>
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Global AI</h1>
          <p className="text-slate-600">AI assistant settings for message replies and content.</p>
        </div>
      </div>

      <div className="max-w-xl space-y-6 rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
        <div className="flex items-start gap-4">
          <Shield className="h-5 w-5 shrink-0 text-amber-500" />
          <div>
            <label className="block font-medium text-slate-900">Safe Mode</label>
            <p className="text-sm text-slate-600">
              When enabled, AI drafts are reviewed before sending. Disable for auto-send.
            </p>
            <div className="mt-2 flex items-center gap-2">
              <input
                type="checkbox"
                id="safeMode"
                checked={safeMode}
                onChange={(e) => setSafeMode(e.target.checked)}
              />
              <label htmlFor="safeMode">Enable Safe Mode</label>
            </div>
          </div>
        </div>

        <div>
          <label className="block font-medium text-slate-900">Logging</label>
          <p className="text-sm text-slate-600">
            Log AI requests and responses for audit and improvement.
          </p>
          <div className="mt-2 flex items-center gap-2">
            <input
              type="checkbox"
              id="logging"
              checked={loggingEnabled}
              onChange={(e) => setLoggingEnabled(e.target.checked)}
            />
            <label htmlFor="logging">Enable AI logging</label>
          </div>
        </div>

        {msg && (
          <p className={`text-sm ${msg.ok ? "text-green-600" : "text-red-600"}`}>{msg.text}</p>
        )}

        <button
          onClick={handleSave}
          disabled={saving}
          className="flex items-center gap-2 rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700 disabled:opacity-50"
        >
          {saving && <Loader2 className="h-4 w-4 animate-spin" />}
          Save
        </button>
      </div>
    </div>
  );
}
