"use client";

import { useState, useEffect, useCallback } from "react";
import { Loader2, Download } from "lucide-react";

const today = new Date().toISOString().slice(0, 10);
const lastMonth = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString().slice(0, 10);

export default function AdminOrderReportPage() {
  const [from, setFrom] = useState(lastMonth);
  const [to, setTo] = useState(today);
  const [status, setStatus] = useState("");
  const [data, setData] = useState<{
    summary: { totalOrders: number; totalRevenue: number };
    orders: { id: string; createdAt: string; status: string; total: number; customerName?: string; phone?: string }[];
  } | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchReport = useCallback(() => {
    setLoading(true);
    const params = new URLSearchParams({ from, to });
    if (status) params.set("status", status);
    fetch(`/api/admin/reports/orders?${params}`)
      .then((r) => {
        if (r.status === 401) {
          window.location.href = "/admin/login";
          return null;
        }
        return r.json();
      })
      .then(setData)
      .finally(() => setLoading(false));
  }, [from, to, status]);

  useEffect(() => {
    fetchReport();
  }, [fetchReport]);

  const exportCsv = () => {
    const params = new URLSearchParams({ from, to, format: "csv" });
    if (status) params.set("status", status);
    window.open(`/api/admin/reports/orders?${params}`, "_blank");
  };

  if (loading && !data) {
    return (
      <div className="flex h-64 items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-slate-900">Order Report</h1>
        <button
          onClick={exportCsv}
          className="flex items-center gap-2 rounded-lg border border-slate-200 px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50"
        >
          <Download className="h-4 w-4" />
          Export CSV
        </button>
      </div>

      <div className="flex flex-wrap gap-4 rounded-xl border border-slate-200 bg-white p-4">
        <div>
          <label className="block text-xs font-medium text-slate-500">From</label>
          <input type="date" value={from} onChange={(e) => setFrom(e.target.value)} className="rounded-lg border border-slate-200 px-3 py-2 text-sm" />
        </div>
        <div>
          <label className="block text-xs font-medium text-slate-500">To</label>
          <input type="date" value={to} onChange={(e) => setTo(e.target.value)} className="rounded-lg border border-slate-200 px-3 py-2 text-sm" />
        </div>
        <div>
          <label className="block text-xs font-medium text-slate-500">Status</label>
          <select value={status} onChange={(e) => setStatus(e.target.value)} className="rounded-lg border border-slate-200 px-3 py-2 text-sm">
            <option value="">All</option>
            <option value="pending">Pending</option>
            <option value="processing">Processing</option>
            <option value="delivered">Delivered</option>
            <option value="cancelled">Cancelled</option>
          </select>
        </div>
      </div>

      {data && (
        <>
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
              <p className="text-sm text-slate-500">Total Orders</p>
              <p className="text-2xl font-bold text-slate-900">{data.summary.totalOrders}</p>
            </div>
            <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
              <p className="text-sm text-slate-500">Total Revenue</p>
              <p className="text-2xl font-bold text-slate-900">৳{data.summary.totalRevenue.toLocaleString()}</p>
            </div>
          </div>

          <div className="rounded-xl border border-slate-200 bg-white shadow-sm overflow-hidden">
            <table className="w-full text-left text-sm">
              <thead className="border-b border-slate-200 bg-slate-50">
                <tr>
                  <th className="p-4 font-medium text-slate-700">Date</th>
                  <th className="p-4 font-medium text-slate-700">Order ID</th>
                  <th className="p-4 font-medium text-slate-700">Customer</th>
                  <th className="p-4 font-medium text-slate-700">Status</th>
                  <th className="p-4 font-medium text-slate-700">Total</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {data.orders.slice(0, 100).map((o) => (
                  <tr key={o.id} className="hover:bg-slate-50">
                    <td className="p-4">{new Date(o.createdAt).toLocaleDateString()}</td>
                    <td className="p-4 font-mono text-slate-600">{o.id.slice(0, 8)}…</td>
                    <td className="p-4">{o.customerName ?? "—"}</td>
                    <td className="p-4">{o.status}</td>
                    <td className="p-4 font-medium">৳{o.total.toLocaleString()}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </>
      )}
    </div>
  );
}
