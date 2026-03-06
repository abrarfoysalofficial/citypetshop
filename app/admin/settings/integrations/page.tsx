"use client";

import { useState, useEffect } from "react";
import { Save, Loader2, Check, AlertCircle, Truck } from "lucide-react";
import { COURIER_SECURE_KEYS } from "@lib/courier/key-registry";

type MaskedKey = { key: string; masked: string; length: number; updatedAt: string };

const COURIER_KEY_LABELS: Record<string, string> = {
  "courier:pathao:client_id": "Pathao Client ID",
  "courier:pathao:client_secret": "Pathao Client Secret",
  "courier:pathao:username": "Pathao Username (email)",
  "courier:pathao:password": "Pathao Password",
  "courier:pathao:store_id": "Pathao Store ID",
  "courier:steadfast:api_key": "Steadfast API Key",
  "courier:steadfast:secret_key": "Steadfast Secret Key",
  "courier:redx:api_key": "RedX API Key",
};

const COURIER_KEYS = [
  ...COURIER_SECURE_KEYS.pathao,
  ...COURIER_SECURE_KEYS.steadfast,
  ...COURIER_SECURE_KEYS.redx,
];

export default function AdminIntegrationsPage() {
  const [keys, setKeys] = useState<MaskedKey[]>([]);
  const [values, setValues] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [testingPathao, setTestingPathao] = useState(false);
  const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);

  useEffect(() => {
    fetch("/api/admin/settings/secure-config")
      .then((r) => {
        if (r.status === 503) {
          setMessage({ type: "error", text: "Secure config unavailable. Set MASTER_SECRET in production." });
          return { keys: [] };
        }
        return r.json();
      })
      .then((d) => {
        if (Array.isArray(d.keys)) setKeys(d.keys);
      })
      .catch(() => setMessage({ type: "error", text: "Failed to load" }))
      .finally(() => setLoading(false));
  }, []);

  const handleSave = async () => {
    setSaving(true);
    setMessage(null);
    try {
      let saved = 0;
      for (const key of COURIER_KEYS) {
        const v = values[key]?.trim();
        if (v) {
          const res = await fetch("/api/admin/settings/secure-config", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ key, value: v }),
          });
          if (res.ok) saved++;
        }
      }
      if (saved > 0) {
        setMessage({ type: "success", text: `Saved ${saved} credential(s)` });
        setValues({});
        const res = await fetch("/api/admin/settings/secure-config");
        const d = await res.json();
        if (Array.isArray(d.keys)) setKeys(d.keys);
      } else {
        setMessage({ type: "error", text: "Enter at least one value to save" });
      }
    } catch {
      setMessage({ type: "error", text: "Request failed" });
    } finally {
      setSaving(false);
    }
  };

  const handleTestPathao = async () => {
    setTestingPathao(true);
    setMessage(null);
    try {
      const res = await fetch("/api/admin/integrations/pathao/test", { method: "POST" });
      const d = await res.json();
      if (res.ok && d.ok) {
        setMessage({ type: "success", text: d.message ?? "Pathao test OK" });
      } else {
        setMessage({ type: "error", text: (d as { error?: string }).error ?? d.message ?? "Test failed" });
      }
    } catch {
      setMessage({ type: "error", text: "Request failed" });
    } finally {
      setTestingPathao(false);
    }
  };

  const keyMap = Object.fromEntries(keys.map((k) => [k.key, k]));

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
        <h1 className="text-3xl font-bold text-slate-900">Integrations</h1>
        <p className="mt-1 text-slate-600">
          Manage API credentials for courier, SMS, email, and payment providers. Values are encrypted at rest.
        </p>
      </div>

      {/* MASTER_SECRET rotation warning */}
      <div className="rounded-xl border border-amber-200 bg-amber-50 p-4">
        <p className="text-sm font-medium text-amber-900">
          Changing MASTER_SECRET will break existing encrypted secrets. Rotate via re-save: update MASTER_SECRET, then
          re-enter and save each credential in this page.
        </p>
      </div>

      {message && (
        <div
          className={`flex items-center gap-2 rounded-xl p-4 ${
            message.type === "success"
              ? "bg-green-50 text-green-900 border border-green-200"
              : "bg-red-50 text-red-900 border border-red-200"
          }`}
        >
          {message.type === "success" && <Check className="h-5 w-5" />}
          {message.type === "error" && <AlertCircle className="h-5 w-5" />}
          <p className="font-medium">{message.text}</p>
        </div>
      )}

      {/* Courier Providers */}
      <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
        <div className="mb-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="rounded-xl bg-cyan-500 p-3 text-white">
              <Truck className="h-6 w-6" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-slate-900">Courier Providers</h2>
              <p className="text-sm text-slate-500">Pathao, Steadfast, RedX credentials</p>
            </div>
          </div>
          <button
            type="button"
            onClick={handleTestPathao}
            disabled={testingPathao}
            className="rounded-lg border border-slate-300 px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50 disabled:opacity-50"
          >
            {testingPathao ? <Loader2 className="h-4 w-4 animate-spin" /> : "Test Pathao"}
          </button>
        </div>

        <div className="space-y-4">
          {COURIER_KEYS.map((key) => (
            <div key={key} className="flex flex-col gap-1">
              <label className="text-sm font-medium text-slate-700">{COURIER_KEY_LABELS[key] ?? key}</label>
              <div className="flex items-center gap-2">
                <input
                  type="password"
                  value={values[key] ?? ""}
                  onChange={(e) => setValues((v) => ({ ...v, [key]: e.target.value }))}
                  placeholder={keyMap[key] ? `${keyMap[key].masked} (${keyMap[key].length} chars)` : "Enter value"}
                  className="flex-1 rounded-lg border border-slate-200 px-4 py-2 font-mono text-sm focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                />
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Other integrations */}
      <div className="rounded-2xl border border-slate-200 bg-slate-50 p-6">
        <h2 className="mb-2 text-lg font-bold text-slate-700">Payment, SMS, Email</h2>
        <p className="text-sm text-slate-500">
          <strong>Payment credentials:</strong> Admin → Payments. Enable gateways and add Store ID, API keys, etc. there.
          <br />
          <strong>SMS / Email:</strong> RESEND_API_KEY, BULK_SMS_BD_API_KEY in .env for order notifications. Admin-manageable SecureConfig support may be added later.
        </p>
      </div>

      <div className="flex items-center gap-3">
        <button
          type="button"
          onClick={handleSave}
          disabled={saving}
          className="inline-flex items-center gap-2 rounded-lg bg-primary px-4 py-2 text-sm font-medium text-white hover:bg-primary/90 disabled:opacity-50"
        >
          {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
          {saving ? "Saving…" : "Save credentials"}
        </button>
      </div>
    </div>
  );
}
