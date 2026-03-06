"use client";

import { useState, useEffect } from "react";

type Props = {
  orderId: string;
  currentStatus: string;
  courierBookingId?: string | null;
  trackingCode?: string | null;
  courierProvider?: string | null;
};

const CANCELLABLE = ["pending", "draft", "processing"];
const CONFIRMABLE = ["pending", "draft"];
const DISPATCHABLE = ["processing", "pending"];

export default function OrderActions({
  orderId,
  currentStatus,
  courierBookingId,
  trackingCode: existingTrackingCode,
  courierProvider: existingProvider,
}: Props) {
  const [status, setStatus] = useState(currentStatus);
  const [busy, setBusy] = useState(false);
  const [msg, setMsg] = useState<{ ok: boolean; text: string } | null>(null);

  // Courier settings
  const [activeProvider, setActiveProvider] = useState<string | null>(null);
  const [sandbox, setSandbox] = useState(true);
  const [bookingResult, setBookingResult] = useState<{
    provider: string;
    trackingCode: string;
    consignmentId: string;
    idempotent?: boolean;
  } | null>(null);
  const [bookingBusy, setBookingBusy] = useState(false);

  useEffect(() => {
    fetch("/api/admin/courier-settings")
      .then((r) => r.json())
      .then((d) => {
        setActiveProvider(d.activeCourierProvider ?? null);
        setSandbox(d.sandbox ?? true);
      })
      .catch(() => {});
  }, []);

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

  const handleBookCourier = async () => {
    const provider = activeProvider === "none" || !activeProvider ? "pathao" : activeProvider;
    setBookingBusy(true);
    setBookingResult(null);
    setMsg(null);
    try {
      const res = await fetch("/api/admin/courier-booking", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ orderId, provider }),
      });
      const data = await res.json().catch(() => ({}));
      if (res.ok && data.success) {
        setBookingResult({
          provider: data.provider ?? provider,
          trackingCode: data.trackingCode ?? "",
          consignmentId: data.consignmentId ?? "",
          idempotent: data.idempotent,
        });
        setStatus("handed_to_courier");
        setMsg({ ok: true, text: data.idempotent ? "Rebook disabled (idempotent)" : "Courier booked successfully" });
      } else {
        setMsg({ ok: false, text: data.error ?? "Booking failed" });
      }
    } catch {
      setMsg({ ok: false, text: "Network error" });
    } finally {
      setBookingBusy(false);
    }
  };

  const copyTrackingCode = (code: string) => {
    navigator.clipboard.writeText(code).then(() => setMsg({ ok: true, text: "Tracking code copied" }));
  };

  const alreadyBooked = !!courierBookingId || !!existingTrackingCode;
  const canBookCourier = DISPATCHABLE.includes(status) && activeProvider && activeProvider !== "none";

  return (
    <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
      <h2 className="mb-3 text-lg font-semibold text-slate-900">Actions</h2>

      {msg && (
        <div className={`mb-3 rounded-lg px-3 py-2 text-sm ${msg.ok ? "bg-green-50 text-green-800" : "bg-red-50 text-red-800"}`}>
          {msg.text}
        </div>
      )}

      {/* Booking result: tracking code + copy */}
      {(bookingResult || (alreadyBooked && existingTrackingCode)) && (
        <div className="mb-3 rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 text-sm">
          <p className="font-medium text-slate-700">
            {existingProvider ?? bookingResult?.provider ?? "Courier"} • Sandbox: {sandbox ? "ON" : "OFF"}
          </p>
          <p className="mt-1 font-mono text-slate-600">
            Tracking: {(bookingResult?.trackingCode ?? existingTrackingCode ?? "").slice(0, 12)}
            {(bookingResult?.trackingCode ?? existingTrackingCode ?? "").length > 12 ? "…" : ""}
          </p>
          {(bookingResult?.idempotent || alreadyBooked) && (
            <p className="mt-1 text-xs text-amber-700">Rebook disabled (idempotent)</p>
          )}
          <button
            onClick={() => copyTrackingCode(bookingResult?.trackingCode ?? existingTrackingCode ?? "")}
            className="mt-2 rounded border border-slate-300 px-2 py-1 text-xs font-medium text-slate-700 hover:bg-slate-100"
          >
            Copy tracking code
          </button>
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

        {/* Book Courier */}
        {canBookCourier && (
          <button
            onClick={handleBookCourier}
            disabled={bookingBusy || alreadyBooked}
            className="rounded-lg bg-indigo-600 px-4 py-2 text-sm font-medium text-white hover:bg-indigo-700 disabled:opacity-50"
          >
            {bookingBusy ? "Booking…" : alreadyBooked ? "Already Booked" : "📦 Book Courier"}
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
