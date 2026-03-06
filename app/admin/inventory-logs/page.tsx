"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { Package, Search, Filter, ChevronLeft, ChevronRight } from "lucide-react";

type InventoryLog = {
  id: string;
  productId: string;
  productName: string;
  productSlug: string;
  type: string;
  quantity: number;
  refId: string | null;
  note: string | null;
  createdAt: string;
};

export default function AdminInventoryLogsPage() {
  const [logs, setLogs] = useState<InventoryLog[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const [productId, setProductId] = useState("");
  const [productSlug, setProductSlug] = useState("");
  const [type, setType] = useState("");
  const [fromDate, setFromDate] = useState("");
  const [toDate, setToDate] = useState("");

  const limit = 50;

  useEffect(() => {
    const params = new URLSearchParams();
    params.set("page", String(page));
    params.set("limit", String(limit));
    if (productId) params.set("productId", productId);
    if (productSlug) params.set("productSlug", productSlug);
    if (type) params.set("type", type);
    if (fromDate) params.set("from", fromDate);
    if (toDate) params.set("to", toDate);

    setLoading(true);
    fetch(`/api/admin/inventory-logs?${params}`)
      .then((r) => r.json())
      .then((data) => {
        if (data.logs) setLogs(data.logs);
        if (typeof data.total === "number") setTotal(data.total);
      })
      .catch(() => setLogs([]))
      .finally(() => setLoading(false));
  }, [page, productId, productSlug, type, fromDate, toDate]);

  const totalPages = Math.ceil(total / limit);

  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-bold text-slate-900">Inventory Logs</h1>
      <p className="text-slate-600">
        Trace stock changes: order placed, admin adjust, restock, return.
      </p>

      <div className="flex flex-wrap gap-4 rounded-xl border border-slate-200 bg-white p-4">
        <div className="flex items-center gap-2">
          <Search className="h-4 w-4 text-slate-500" />
          <input
            type="text"
            placeholder="Product slug"
            value={productSlug}
            onChange={(e) => {
              setProductSlug(e.target.value);
              setPage(1);
            }}
            className="rounded border border-slate-200 px-3 py-1.5 text-sm"
          />
        </div>
        <div className="flex items-center gap-2">
          <Filter className="h-4 w-4 text-slate-500" />
          <select
            value={type}
            onChange={(e) => {
              setType(e.target.value);
              setPage(1);
            }}
            className="rounded border border-slate-200 px-3 py-1.5 text-sm"
          >
            <option value="">All types</option>
            <option value="in">In</option>
            <option value="out">Out</option>
            <option value="adjust">Adjust</option>
            <option value="return">Return</option>
          </select>
        </div>
        <div className="flex items-center gap-2">
          <input
            type="date"
            value={fromDate}
            onChange={(e) => {
              setFromDate(e.target.value);
              setPage(1);
            }}
            className="rounded border border-slate-200 px-3 py-1.5 text-sm"
          />
          <span className="text-slate-500">to</span>
          <input
            type="date"
            value={toDate}
            onChange={(e) => {
              setToDate(e.target.value);
              setPage(1);
            }}
            className="rounded border border-slate-200 px-3 py-1.5 text-sm"
          />
        </div>
      </div>

      <div className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
        {loading ? (
          <div className="p-8 text-center text-slate-500">Loading…</div>
        ) : logs.length === 0 ? (
          <div className="p-8 text-center text-slate-500">No inventory logs found.</div>
        ) : (
          <table className="w-full text-left text-sm">
            <thead className="border-b border-slate-200 bg-slate-50">
              <tr>
                <th className="p-3 font-medium text-slate-900">Time</th>
                <th className="p-3 font-medium text-slate-900">Product</th>
                <th className="p-3 font-medium text-slate-900">Type</th>
                <th className="p-3 font-medium text-slate-900">Qty</th>
                <th className="p-3 font-medium text-slate-900">Ref</th>
                <th className="p-3 font-medium text-slate-900">Note</th>
              </tr>
            </thead>
            <tbody>
              {logs.map((log) => (
                <tr key={log.id} className="border-b border-slate-100">
                  <td className="p-3 text-slate-600">
                    {new Date(log.createdAt).toLocaleString()}
                  </td>
                  <td className="p-3">
                    <Link
                      href={`/admin/products?search=${encodeURIComponent(log.productSlug)}`}
                      className="font-medium text-primary hover:underline"
                    >
                      {log.productName}
                    </Link>
                  </td>
                  <td className="p-3">
                    <span
                      className={`rounded px-2 py-0.5 text-xs font-medium ${
                        log.type === "out"
                          ? "bg-rose-100 text-rose-800"
                          : log.type === "in" || log.type === "return"
                          ? "bg-emerald-100 text-emerald-800"
                          : "bg-slate-100 text-slate-700"
                      }`}
                    >
                      {log.type}
                    </span>
                  </td>
                  <td className="p-3 font-mono">
                    {log.quantity > 0 ? "+" : ""}
                    {log.quantity}
                  </td>
                  <td className="p-3 text-slate-600">
                    {log.refId ? (
                      <Link
                        href={`/admin/orders?q=${log.refId}`}
                        className="text-primary hover:underline"
                      >
                        {log.refId.slice(0, 8)}…
                      </Link>
                    ) : (
                      "—"
                    )}
                  </td>
                  <td className="p-3 text-slate-600">{log.note ?? "—"}</td>
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
