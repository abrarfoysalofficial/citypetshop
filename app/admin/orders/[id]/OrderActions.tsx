"use client";

import { useState } from "react";

type Props = { orderId: string; currentStatus: string };

const CANCELLABLE = ["pending", "draft", "processing"];
const CONFIRMABLE = ["pending", "draft"];
const DISPATCHABLE = ["processing", "pending"];

export default function OrderActions({ orderId, currentStatus }: Props) {
  const [status, setStatus] = useState(currentStatus);
  const [busy, setBusy] = useState(false);
  const [msg, setMsg] = useState<{ ok: boolean; text: string } | null>(null);

  // Dialog state for dispatch
  const [dispatchOpen, setDispatchOpen] = useState(false);
  const [trackingCode, setTrackingCode] = useState("");
  const [courierProvider, setCourierProvider] = useState("");

  // Dialog state for cancel
  const [cancelOpen, setCancelOpen] = useState(false);
  const [cancelReason, setCancelReason] = useState("");

  const call = async (url: string, body: object) => {
    setBusy(true);
    setMsg(null);
    try {
      const res = await fetch(url, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
      const data = await res.json().catch(() => ({}));
      if (res.ok) {
        setMsg({ ok: true, text: data.message ?? "Done" });
        if (data.order?.status) setStatus(data.order.status);
      } else {
        setMsg({ ok: false, text: data.error ?? "Action failed" });
      }
    } catch {
      setMsg({ ok: false, text: "Network error" });
    } finally {
      setBusy(false);
    }
  };

  const handleConfirm = () => call(`/api/admin/orders/${orderId}/confirm`, { note: "Confirmed by admin" });

  const handleDispatch = async () => {
    setDispatchOpen(false);
    await call(`/api/admin/orders/${orderId}/dispatch`, { trackingCode, courierProvider });
  };

  const handleCancel = async () => {
    if (!cancelReason.trim()) return;
    setCancelOpen(false);
    await call(`/api/admin/orders/${orderId}/cancel`, { reason: cancelReason });
  };

  const handlePrintInvoice = () => {
    window.open(`/api/invoice?orderId=${orderId}`, "_blank");
  };

  const handlePrintLabel = () => {
    window.open(`/api/admin/orders/${orderId}/label`, "_blank");
  };

  return (
    <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
      <h2 className="mb-3 text-lg font-semibold text-slate-900">Actions</h2>

      {msg && (
        <div className={`mb-3 rounded-lg px-3 py-2 text-sm ${msg.ok ? "bg-green-50 text-green-800" : "bg-red-50 text-red-800"}`}>
          {msg.text}
        </div>
      )}

      <div className="flex flex-wrap gap-2">
        {/* Confirm */}
        {CONFIRMABLE.includes(status) && (
          <button
            onClick={handleConfirm}
            disabled={busy}
            className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700 disabled:opacity-50"
          >
            ✓ Confirm Order
          </button>
        )}

        {/* Dispatch */}
        {DISPATCHABLE.includes(status) && (
          <button
            onClick={() => setDispatchOpen(true)}
            disabled={busy}
            className="rounded-lg bg-green-600 px-4 py-2 text-sm font-medium text-white hover:bg-green-700 disabled:opacity-50"
          >
            🚚 Mark Dispatched
          </button>
        )}

        {/* Cancel */}
        {CANCELLABLE.includes(status) && (
          <button
            onClick={() => setCancelOpen(true)}
            disabled={busy}
            className="rounded-lg border border-red-300 px-4 py-2 text-sm font-medium text-red-700 hover:bg-red-50 disabled:opacity-50"
          >
            ✕ Cancel Order
          </button>
        )}

        {/* Invoice */}
        <button
          onClick={handlePrintInvoice}
          className="rounded-lg border border-slate-300 px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50"
        >
          🖨 Print Invoice
        </button>

        {/* Shipping label */}
        <button
          onClick={handlePrintLabel}
          className="rounded-lg border border-slate-300 px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50"
        >
          📦 Print Label
        </button>
      </div>

      {/* Dispatch dialog */}
      {dispatchOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
          <div className="w-full max-w-md rounded-xl bg-white p-6 shadow-xl">
            <h3 className="mb-4 text-lg font-semibold">Dispatch Order</h3>
            <label className="mb-1 block text-sm font-medium">Tracking Code</label>
            <input
              value={trackingCode}
              onChange={(e) => setTrackingCode(e.target.value)}
              placeholder="e.g. STF1234567"
              className="mb-3 w-full rounded-lg border px-3 py-2 text-sm"
            />
            <label className="mb-1 block text-sm font-medium">Courier Provider</label>
            <select
              value={courierProvider}
              onChange={(e) => setCourierProvider(e.target.value)}
              className="mb-4 w-full rounded-lg border px-3 py-2 text-sm"
            >
              <option value="">— Select —</option>
              <option value="steadfast">Steadfast</option>
              <option value="pathao">Pathao</option>
              <option value="redx">RedX</option>
              <option value="sundarban">Sundarban</option>
              <option value="other">Other</option>
            </select>
            <div className="flex justify-end gap-2">
              <button onClick={() => setDispatchOpen(false)} className="rounded-lg border px-4 py-2 text-sm">Cancel</button>
              <button
                onClick={handleDispatch}
                disabled={!trackingCode.trim()}
                className="rounded-lg bg-green-600 px-4 py-2 text-sm text-white hover:bg-green-700 disabled:opacity-50"
              >
                Confirm Dispatch
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Cancel dialog */}
      {cancelOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
          <div className="w-full max-w-md rounded-xl bg-white p-6 shadow-xl">
            <h3 className="mb-4 text-lg font-semibold text-red-700">Cancel Order</h3>
            <label className="mb-1 block text-sm font-medium">Reason (required)</label>
            <textarea
              value={cancelReason}
              onChange={(e) => setCancelReason(e.target.value)}
              rows={3}
              placeholder="e.g. Customer requested cancellation"
              className="mb-4 w-full rounded-lg border px-3 py-2 text-sm"
            />
            <div className="flex justify-end gap-2">
              <button onClick={() => setCancelOpen(false)} className="rounded-lg border px-4 py-2 text-sm">Back</button>
              <button
                onClick={handleCancel}
                disabled={!cancelReason.trim()}
                className="rounded-lg bg-red-600 px-4 py-2 text-sm text-white hover:bg-red-700 disabled:opacity-50"
              >
                Confirm Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
