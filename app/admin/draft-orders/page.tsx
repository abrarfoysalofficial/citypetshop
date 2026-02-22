"use client";

import { useState, useEffect, useCallback } from "react";

type DraftOrder = {
  id: string;
  sessionId?: string;
  guestEmail?: string | null;
  guestPhone?: string | null;
  guestName?: string | null;
  cartJson?: unknown;
  lastActivityAt?: string;
};

type OrderDraft = {
  id: string;
  guestEmail?: string | null;
  guestPhone?: string | null;
  guestName?: string | null;
  total?: number;
  createdAt?: string;
  updatedAt?: string;
};

export default function AdminDraftOrdersPage() {
  const [draftOrders, setDraftOrders] = useState<DraftOrder[]>([]);
  const [orderDrafts, setOrderDrafts] = useState<OrderDraft[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchData = useCallback(() => {
    fetch("/api/admin/draft-orders?minAge=30")
      .then((r) => {
        if (r.status === 401) {
          window.location.href = "/admin/login";
          return null;
        }
        return r.json();
      })
      .then((d) => {
        if (d) {
          setDraftOrders(d.draftOrders ?? []);
          setOrderDrafts(d.draftOrdersFromOrders ?? []);
        }
      })
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const total = draftOrders.length + orderDrafts.length;

  if (loading) {
    return (
      <div className="flex h-64 items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-blue-600 border-t-transparent" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-slate-900">Abandoned Checkout</h1>
      <p className="text-slate-600">
        Draft orders and abandoned carts (inactive for 30+ minutes). Use these to send recovery reminders.
      </p>

      <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
        <p className="text-sm text-slate-600">
          Total: <strong>{total}</strong> abandoned sessions
        </p>
      </div>

      {draftOrders.length > 0 && (
        <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
          <h2 className="mb-4 text-lg font-semibold text-slate-900">Draft sessions (cart)</h2>
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead>
                <tr className="border-b border-slate-200">
                  <th className="pb-2 font-medium text-slate-900">Guest</th>
                  <th className="pb-2 font-medium text-slate-900">Email</th>
                  <th className="pb-2 font-medium text-slate-900">Phone</th>
                  <th className="pb-2 font-medium text-slate-900">Last activity</th>
                </tr>
              </thead>
              <tbody>
                {draftOrders.map((d) => (
                  <tr key={d.id} className="border-b border-slate-100">
                    <td className="py-2 text-slate-700">{d.guestName ?? "—"}</td>
                    <td className="py-2 text-slate-600">{d.guestEmail ?? "—"}</td>
                    <td className="py-2 text-slate-600">{d.guestPhone ?? "—"}</td>
                    <td className="py-2 text-slate-500">{d.lastActivityAt ? new Date(d.lastActivityAt).toLocaleString() : "—"}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {orderDrafts.length > 0 && (
        <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
          <h2 className="mb-4 text-lg font-semibold text-slate-900">Draft orders</h2>
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead>
                <tr className="border-b border-slate-200">
                  <th className="pb-2 font-medium text-slate-900">Order</th>
                  <th className="pb-2 font-medium text-slate-900">Guest</th>
                  <th className="pb-2 font-medium text-slate-900">Total</th>
                  <th className="pb-2 font-medium text-slate-900">Created</th>
                </tr>
              </thead>
              <tbody>
                {orderDrafts.map((o) => (
                  <tr key={o.id} className="border-b border-slate-100">
                    <td className="py-2 font-mono text-slate-700">{o.id.slice(0, 8)}</td>
                    <td className="py-2 text-slate-600">{o.guestName ?? o.guestEmail ?? "—"}</td>
                    <td className="py-2 font-medium text-slate-900">৳{Number(o.total ?? 0).toLocaleString()}</td>
                    <td className="py-2 text-slate-500">{o.createdAt ? new Date(o.createdAt).toLocaleString() : "—"}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {total === 0 && (
        <p className="rounded-xl border border-slate-200 bg-slate-50 p-6 text-slate-600">
          No abandoned checkouts in the last 30 minutes.
        </p>
      )}
    </div>
  );
}
