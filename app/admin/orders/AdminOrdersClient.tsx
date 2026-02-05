"use client";

import { useState, useMemo, useEffect } from "react";
import Link from "next/link";

type Order = { id: string; customerName?: string; email?: string; total: number; status: string; createdAt: string };

const STATUS_OPTIONS = ["All Status", "Pending", "Confirmed", "Delivered", "Cancelled", "Processing", "Hold"];

const PROVIDERS = [
  { value: "pathao", label: "Pathao" },
  { value: "steadfast", label: "Steadfast" },
  { value: "redx", label: "RedX" },
];

export default function AdminOrdersClient({ orders }: { orders: Order[] }) {
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [statusFilter, setStatusFilter] = useState("All Status");
  const [booking, setBooking] = useState(false);
  const [bookingProgress, setBookingProgress] = useState<{ current: number; total: number } | null>(null);
  const [results, setResults] = useState<Record<string, { ok: boolean; msg: string }>>({});
  const [provider, setProvider] = useState("pathao");
  const [courierSettings, setCourierSettings] = useState<{ defaultProvider?: string; providers?: { id: string; name: string; enabled: boolean }[] } | null>(null);

  useEffect(() => {
    fetch("/api/admin/courier-settings")
      .then((r) => r.json())
      .then((d) => {
        setCourierSettings(d);
        setProvider(d.defaultProvider ?? "pathao");
      })
      .catch(() => {});
  }, []);

  const defaultProvider = courierSettings?.defaultProvider ?? "pathao";
  const filteredOrders = useMemo(() => {
    if (statusFilter === "All Status") return orders;
    return orders.filter((o) => o.status?.toLowerCase() === statusFilter.toLowerCase());
  }, [orders, statusFilter]);

  const enabledProviders = useMemo((): { value: string; label: string }[] => {
    const list = courierSettings?.providers?.filter((p) => p.enabled) ?? PROVIDERS;
    return list.map((p) => ({ value: "id" in p ? p.id : p.value, label: "name" in p ? p.name : p.label }));
  }, [courierSettings?.providers]);

  const toggle = (id: string) => {
    setSelected((s) => {
      const next = new Set(s);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const toggleAll = () => {
    if (selected.size === filteredOrders.length) setSelected(new Set());
    else setSelected(new Set(filteredOrders.map((o) => o.id)));
  };

  const handleBulkBook = async () => {
    if (selected.size === 0) return;
    const ids = Array.from(selected);
    setBooking(true);
    setResults({});
    setBookingProgress({ current: 0, total: ids.length });
    let done = 0;
    for (const id of ids) {
      try {
        const res = await fetch("/api/admin/courier-booking", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ orderId: id, provider }),
        });
        const data = await res.json().catch(() => ({}));
        const msg =
          (data as { error?: string }).error ||
          (data as { trackingCode?: string }).trackingCode ||
          (res.ok ? "Booked" : "Failed");
        setResults((r) => ({ ...r, [id]: { ok: res.ok, msg } }));
      } catch {
        setResults((r) => ({ ...r, [id]: { ok: false, msg: "Error" } }));
      }
      done += 1;
      setBookingProgress({ current: done, total: ids.length });
    }
    setBooking(false);
    setBookingProgress(null);
    setSelected(new Set());
  };

  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-bold text-slate-900">Orders</h1>
      <p className="text-slate-600">View, filter, search, and manage orders.</p>

      <div className="flex flex-wrap items-center gap-3">
        <label className="flex flex-col gap-1 text-sm">
          <span className="font-medium text-slate-700">Status</span>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="rounded border border-slate-300 px-3 py-1.5 text-sm"
          >
            {STATUS_OPTIONS.map((s) => (
              <option key={s} value={s}>{s}</option>
            ))}
          </select>
        </label>
      </div>
      {filteredOrders.length > 0 && (
        <div className="flex flex-wrap items-center gap-3 rounded-lg border border-slate-200 bg-slate-50 p-3">
          <label className="flex items-center gap-2">
            <input type="checkbox" checked={selected.size === filteredOrders.length} onChange={toggleAll} className="rounded border-slate-300" />
            <span className="text-sm font-medium">Select all</span>
          </label>
          {selected.size > 0 && (
            <>
              <select
                value={provider}
                onChange={(e) => setProvider(e.target.value)}
                className="rounded border border-slate-300 px-2 py-1 text-sm"
                aria-label="Courier provider"
              >
                <option value={defaultProvider}>Auto ({defaultProvider})</option>
                {enabledProviders.filter((p) => p.value !== defaultProvider).map((p) => (
                  <option key={p.value} value={p.value}>
                    {p.label}
                  </option>
                ))}
              </select>
              <button
                onClick={handleBulkBook}
                disabled={booking}
                className="rounded-lg bg-primary px-4 py-1.5 text-sm font-medium text-white hover:bg-primary/90 disabled:opacity-50"
              >
                {booking && bookingProgress
                  ? `Booking… ${bookingProgress.current}/${bookingProgress.total}`
                  : `Book Courier (${selected.size})`}
              </button>
            </>
          )}
        </div>
      )}

      {Object.keys(results).length > 0 && (
        <div className="rounded-lg border border-slate-200 bg-white p-3 text-sm">
          {Object.entries(results).map(([id, r]) => (
            <p key={id} className={r.ok ? "text-emerald-600" : "text-rose-600"}>
              {id}: {r.msg}
            </p>
          ))}
        </div>
      )}

      <div className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
        <table className="w-full text-left text-sm">
          <thead className="border-b border-slate-200 bg-slate-50">
            <tr>
              <th className="w-10 p-3"></th>
              <th className="p-3 font-medium text-slate-900">Order</th>
              <th className="p-3 font-medium text-slate-900">Customer</th>
              <th className="p-3 font-medium text-slate-900">Total</th>
              <th className="p-3 font-medium text-slate-900">Status</th>
              <th className="p-3 font-medium text-slate-900">Date</th>
              <th className="p-3 font-medium text-slate-900">Actions</th>
            </tr>
          </thead>
          <tbody>
            {filteredOrders.length === 0 ? (
              <tr>
                <td colSpan={7} className="p-6 text-center text-slate-500">
                  No orders. Connect Supabase to manage orders.
                </td>
              </tr>
            ) : (
              filteredOrders.map((o) => (
                <tr key={o.id} className="border-b border-slate-100">
                  <td className="p-3">
                    <input
                      type="checkbox"
                      checked={selected.has(o.id)}
                      onChange={() => toggle(o.id)}
                      className="rounded border-slate-300"
                    />
                  </td>
                  <td className="p-3 font-mono font-medium text-slate-900">{o.id}</td>
                  <td className="p-3">{o.customerName ?? o.email ?? "—"}</td>
                  <td className="p-3">৳{o.total.toLocaleString("en-BD")}</td>
                  <td className="p-3">
                    <span className="rounded-full bg-slate-100 px-2 py-0.5 text-xs font-medium text-slate-700">
                      {o.status}
                    </span>
                  </td>
                  <td className="p-3 text-slate-600">{new Date(o.createdAt).toLocaleDateString()}</td>
                  <td className="p-3">
                    <Link href={`/admin/orders/${o.id}`} className="font-medium text-primary hover:underline">
                      View
                    </Link>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
