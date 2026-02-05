"use client";

import { useState, useEffect } from "react";
import { Save } from "lucide-react";

type ProviderRow = { id: string; name: string; enabled: boolean };

export default function AdminCourierPage() {
  const [providers, setProviders] = useState<ProviderRow[]>([
    { id: "pathao", name: "Pathao", enabled: true },
    { id: "steadfast", name: "Steadfast", enabled: true },
    { id: "redx", name: "RedX", enabled: true },
  ]);
  const [defaultProvider, setDefaultProvider] = useState("pathao");
  const [sandbox, setSandbox] = useState(true);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");

  useEffect(() => {
    fetch("/api/admin/courier-settings")
      .then((r) => r.json())
      .then((d) => {
        if (Array.isArray(d.providers)) setProviders(d.providers);
        if (d.defaultProvider) setDefaultProvider(d.defaultProvider);
        if (typeof d.sandbox === "boolean") setSandbox(d.sandbox);
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const handleSave = async () => {
    setSaving(true);
    setMessage("");
    try {
      const res = await fetch("/api/admin/courier-settings", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          defaultProvider,
          sandbox,
          providers: providers.map((p) => ({ id: p.id, enabled: p.enabled })),
        }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        setMessage((data as { error?: string }).error ?? "Failed to save");
        return;
      }
      setMessage("Saved. API keys are configured via environment variables only.");
    } catch {
      setMessage("Request failed.");
    } finally {
      setSaving(false);
    }
  };

  const toggleProvider = (id: string) => {
    setProviders((prev) => prev.map((p) => (p.id === id ? { ...p, enabled: !p.enabled } : p)));
  };

  if (loading) {
    return (
      <div className="space-y-4">
        <h1 className="text-2xl font-bold text-slate-900">Courier Integrations</h1>
        <p className="text-slate-500">Loading…</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-slate-900">Courier Integrations</h1>
      <p className="text-slate-600">
        Enable/disable providers, set default for bulk booking. API keys and secrets are set via environment variables only (e.g. PATHAO_* , STEADFAST_* , REDX_*).
      </p>

      <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
        <h2 className="mb-3 text-lg font-semibold text-slate-900">Default provider &amp; mode</h2>
        <div className="flex flex-wrap items-center gap-4">
          <label className="flex flex-col gap-1 text-sm">
            <span className="font-medium text-slate-700">Default provider (bulk booking)</span>
            <select
              value={defaultProvider}
              onChange={(e) => setDefaultProvider(e.target.value)}
              className="rounded-lg border border-slate-300 px-3 py-2"
            >
              {providers.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.name}
                </option>
              ))}
            </select>
          </label>
          <label className="flex cursor-pointer items-center gap-2 text-sm">
            <input
              type="checkbox"
              checked={sandbox}
              onChange={(e) => setSandbox(e.target.checked)}
              className="rounded border-slate-300"
            />
            <span className="font-medium text-slate-700">Sandbox / test mode</span>
          </label>
        </div>
      </div>

      <div className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
        <table className="w-full text-left text-sm">
          <thead className="border-b border-slate-200 bg-slate-50">
            <tr>
              <th className="p-3 font-medium text-slate-900">Courier</th>
              <th className="p-3 font-medium text-slate-900">Status</th>
              <th className="p-3 font-medium text-slate-900">Config</th>
            </tr>
          </thead>
          <tbody>
            {providers.map((c) => (
              <tr key={c.id} className="border-b border-slate-100">
                <td className="p-3 font-medium text-slate-900">{c.name}</td>
                <td className="p-3">
                  <label className="flex cursor-pointer items-center gap-2">
                    <input
                      type="checkbox"
                      checked={c.enabled}
                      onChange={() => toggleProvider(c.id)}
                      className="rounded border-slate-300"
                    />
                    <span className={c.enabled ? "text-emerald-600" : "text-slate-500"}>{c.enabled ? "Enabled" : "Disabled"}</span>
                  </label>
                </td>
                <td className="p-3 text-xs text-slate-600">API keys from env (e.g. PATHAO_API_KEY)</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="flex items-center gap-3">
        <button
          type="button"
          onClick={handleSave}
          disabled={saving}
          className="inline-flex items-center gap-2 rounded-lg bg-primary px-4 py-2 text-sm font-medium text-white hover:bg-primary/90 disabled:opacity-50"
        >
          <Save className="h-4 w-4" />
          {saving ? "Saving…" : "Save settings"}
        </button>
        {message && <span className="text-sm text-slate-600">{message}</span>}
      </div>
    </div>
  );
}
