"use client";

import { useState, useEffect } from "react";
import { Loader2 } from "lucide-react";

export default function AdminShippingPage() {
  const [deliveryInsideDhaka, setDeliveryInsideDhaka] = useState("");
  const [deliveryOutsideDhaka, setDeliveryOutsideDhaka] = useState("");
  const [freeDeliveryThreshold, setFreeDeliveryThreshold] = useState("");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [msg, setMsg] = useState<{ ok: boolean; text: string } | null>(null);

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
        if (d) {
          const inside = d.delivery_inside_dhaka ?? d.deliveryInsideDhaka;
          const outside = d.delivery_outside_dhaka ?? d.deliveryOutsideDhaka;
          const free = d.free_delivery_threshold ?? d.freeDeliveryThreshold;
          setDeliveryInsideDhaka(inside != null ? String(inside) : "");
          setDeliveryOutsideDhaka(outside != null ? String(outside) : "");
          setFreeDeliveryThreshold(free != null ? String(free) : "");
        }
      })
      .finally(() => setLoading(false));
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setMsg(null);
    try {
      const res = await fetch("/api/admin/settings", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          delivery_inside_dhaka: deliveryInsideDhaka ? parseFloat(deliveryInsideDhaka) : null,
          delivery_outside_dhaka: deliveryOutsideDhaka ? parseFloat(deliveryOutsideDhaka) : null,
          free_delivery_threshold: freeDeliveryThreshold ? parseFloat(freeDeliveryThreshold) : null,
        }),
      });
      const data = await res.json().catch(() => ({}));
      if (res.ok) {
        setMsg({ ok: true, text: "Shipping settings saved" });
      } else {
        setMsg({ ok: false, text: data.error ?? "Failed to save" });
      }
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex h-64 items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-blue-600 border-t-transparent" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-slate-900">Shipping</h1>
      <p className="text-slate-600">
        Delivery charges and free delivery threshold. Applied site-wide.
      </p>

      <form onSubmit={handleSubmit} className="max-w-md space-y-4 rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1">Delivery inside Dhaka (৳)</label>
          <input
            type="number"
            min={0}
            step={0.01}
            value={deliveryInsideDhaka}
            onChange={(e) => setDeliveryInsideDhaka(e.target.value)}
            className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1">Delivery outside Dhaka (৳)</label>
          <input
            type="number"
            min={0}
            step={0.01}
            value={deliveryOutsideDhaka}
            onChange={(e) => setDeliveryOutsideDhaka(e.target.value)}
            className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1">Free delivery threshold (৳)</label>
          <input
            type="number"
            min={0}
            step={0.01}
            value={freeDeliveryThreshold}
            onChange={(e) => setFreeDeliveryThreshold(e.target.value)}
            placeholder="Order total above this gets free delivery"
            className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm"
          />
        </div>
        {msg && (
          <p className={`text-sm ${msg.ok ? "text-green-600" : "text-red-600"}`}>{msg.text}</p>
        )}
        <button
          type="submit"
          disabled={saving}
          className="flex items-center gap-2 rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700 disabled:opacity-50"
        >
          {saving && <Loader2 className="h-4 w-4 animate-spin" />}
          Save
        </button>
      </form>
    </div>
  );
}
