"use client";

import { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import { Bell, Filter, ChevronLeft, ChevronRight, Check, X } from "lucide-react";

type Reminder = {
  id: string;
  customerId: string;
  customerName: string | null;
  customerEmail: string | null;
  customerPhone: string | null;
  type: string;
  channel: string;
  scheduledAt: string;
  status: string;
  templateId: string | null;
  createdAt: string;
};

export default function AdminRemindersPage() {
  const [reminders, setReminders] = useState<Reminder[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const [status, setStatus] = useState("");
  const [type, setType] = useState("");
  const [updating, setUpdating] = useState<string | null>(null);

  const limit = 50;

  const fetchReminders = useCallback(() => {
    const params = new URLSearchParams();
    params.set("page", String(page));
    params.set("limit", String(limit));
    if (status) params.set("status", status);
    if (type) params.set("type", type);

    setLoading(true);
    fetch(`/api/admin/reminders?${params}`)
      .then((r) => r.json())
      .then((data) => {
        if (data.reminders) setReminders(data.reminders);
        if (typeof data.total === "number") setTotal(data.total);
      })
      .catch(() => setReminders([]))
      .finally(() => setLoading(false));
  }, [page, status, type]);

  useEffect(() => {
    fetchReminders();
  }, [fetchReminders]);

  const handleMarkDone = async (id: string) => {
    setUpdating(id);
    try {
      const res = await fetch(`/api/admin/reminders/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: "sent" }),
      });
      if (res.ok) fetchReminders();
    } finally {
      setUpdating(null);
    }
  };

  const handleCancel = async (id: string) => {
    setUpdating(id);
    try {
      const res = await fetch(`/api/admin/reminders/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: "cancelled" }),
      });
      if (res.ok) fetchReminders();
    } finally {
      setUpdating(null);
    }
  };

  const totalPages = Math.ceil(total / limit);

  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-bold text-slate-900">Reminders</h1>
      <p className="text-slate-600">
        Cart abandonment, order follow-up, review requests. Store and schedule reminders. Manual &quot;mark done&quot; when no worker.
      </p>

      <div className="flex flex-wrap gap-4 rounded-xl border border-slate-200 bg-white p-4">
        <div className="flex items-center gap-2">
          <Filter className="h-4 w-4 text-slate-500" />
          <select
            value={status}
            onChange={(e) => {
              setStatus(e.target.value);
              setPage(1);
            }}
            className="rounded border border-slate-200 px-3 py-1.5 text-sm"
          >
            <option value="">All statuses</option>
            <option value="pending">Pending</option>
            <option value="sent">Sent</option>
            <option value="failed">Failed</option>
            <option value="cancelled">Cancelled</option>
          </select>
        </div>
        <select
          value={type}
          onChange={(e) => {
            setType(e.target.value);
            setPage(1);
          }}
          className="rounded border border-slate-200 px-3 py-1.5 text-sm"
        >
          <option value="">All types</option>
          <option value="cart_abandonment">Cart Abandonment</option>
          <option value="order_followup">Order Follow-up</option>
          <option value="review_request">Review Request</option>
        </select>
      </div>

      <div className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
        {loading ? (
          <div className="p-8 text-center text-slate-500">Loading…</div>
        ) : reminders.length === 0 ? (
          <div className="p-8 text-center text-slate-500">No reminders found.</div>
        ) : (
          <table className="w-full text-left text-sm">
            <thead className="border-b border-slate-200 bg-slate-50">
              <tr>
                <th className="p-3 font-medium text-slate-900">Customer</th>
                <th className="p-3 font-medium text-slate-900">Type</th>
                <th className="p-3 font-medium text-slate-900">Channel</th>
                <th className="p-3 font-medium text-slate-900">Scheduled</th>
                <th className="p-3 font-medium text-slate-900">Status</th>
                <th className="p-3 font-medium text-slate-900">Actions</th>
              </tr>
            </thead>
            <tbody>
              {reminders.map((r) => (
                <tr key={r.id} className="border-b border-slate-100">
                  <td className="p-3">
                    <Link
                      href={`/admin/customers?search=${encodeURIComponent(r.customerEmail ?? r.customerPhone ?? "")}`}
                      className="font-medium text-primary hover:underline"
                    >
                      {r.customerName ?? r.customerEmail ?? r.customerPhone ?? "—"}
                    </Link>
                  </td>
                  <td className="p-3 text-slate-600">{r.type.replace(/_/g, " ")}</td>
                  <td className="p-3 text-slate-600">{r.channel}</td>
                  <td className="p-3 text-slate-600">
                    {new Date(r.scheduledAt).toLocaleString()}
                  </td>
                  <td className="p-3">
                    <span
                      className={`rounded px-2 py-0.5 text-xs font-medium ${
                        r.status === "sent"
                          ? "bg-emerald-100 text-emerald-800"
                          : r.status === "pending"
                          ? "bg-amber-100 text-amber-800"
                          : r.status === "cancelled"
                          ? "bg-slate-100 text-slate-600"
                          : "bg-rose-100 text-rose-800"
                      }`}
                    >
                      {r.status}
                    </span>
                  </td>
                  <td className="p-3">
                    {r.status === "pending" && (
                      <div className="flex gap-2">
                        <button
                          onClick={() => handleMarkDone(r.id)}
                          disabled={updating === r.id}
                          className="rounded bg-emerald-100 px-2 py-1 text-xs font-medium text-emerald-800 hover:bg-emerald-200 disabled:opacity-50"
                        >
                          Mark done
                        </button>
                        <button
                          onClick={() => handleCancel(r.id)}
                          disabled={updating === r.id}
                          className="rounded bg-slate-100 px-2 py-1 text-xs font-medium text-slate-700 hover:bg-slate-200 disabled:opacity-50"
                        >
                          Cancel
                        </button>
                      </div>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}

        {totalPages > 1 && (
          <div className="flex items-center justify-between border-t border-slate-200 px-4 py-3">
            <p className="text-sm text-slate-600">
              Page {page} of {totalPages} ({total} total)
            </p>
            <div className="flex gap-2">
              <button
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                disabled={page <= 1}
                className="rounded border border-slate-200 px-3 py-1 text-sm disabled:opacity-50"
              >
                <ChevronLeft className="h-4 w-4" />
              </button>
              <button
                onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                disabled={page >= totalPages}
                className="rounded border border-slate-200 px-3 py-1 text-sm disabled:opacity-50"
              >
                <ChevronRight className="h-4 w-4" />
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
