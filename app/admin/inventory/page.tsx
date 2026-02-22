"use client";

import { useState, useEffect, useCallback } from "react";

type StockItem = {
  id: string;
  sku: string | null;
  nameEn: string;
  stock: number;
  lowStockThreshold: number | null;
  isActive: boolean;
};

type StockReport = {
  products: StockItem[];
  lowStockCount: number;
  outOfStockCount: number;
  total: number;
};

export default function AdminInventoryPage() {
  const [report, setReport] = useState<StockReport | null>(null);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<"all" | "low" | "out">("all");
  const [editId, setEditId] = useState<string | null>(null);
  const [editQty, setEditQty] = useState("");
  const [editNote, setEditNote] = useState("");
  const [saving, setSaving] = useState(false);
  const [msg, setMsg] = useState<{ ok: boolean; text: string } | null>(null);

  const fetchReport = useCallback(() => {
    setLoading(true);
    const params = filter === "low" ? "?lowStock=true" : filter === "out" ? "?outOfStock=true" : "";
    fetch(`/api/admin/products/stock${params}`)
      .then((r) => {
        if (r.status === 401) { window.location.href = "/admin/login"; return null; }
        return r.json();
      })
      .then((d) => { if (d) setReport(d); })
      .finally(() => setLoading(false));
  }, [filter]);

  useEffect(() => { fetchReport(); }, [fetchReport]);

  const handleSave = async (productId: string) => {
    const qty = parseInt(editQty, 10);
    if (isNaN(qty)) return;
    setSaving(true);
    setMsg(null);
    const res = await fetch("/api/admin/products/stock", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ productId, quantity: qty, type: "set", note: editNote || "Admin adjustment" }),
    });
    const data = await res.json().catch(() => ({}));
    if (res.ok) {
      setMsg({ ok: true, text: "Stock updated" });
      setEditId(null);
      fetchReport();
    } else {
      setMsg({ ok: false, text: data.error ?? "Failed to update" });
    }
    setSaving(false);
  };

  const stockClass = (item: StockItem) => {
    if (item.stock <= 0) return "text-red-600 font-bold";
    if (item.lowStockThreshold && item.stock <= item.lowStockThreshold) return "text-amber-600 font-semibold";
    return "text-green-700";
  };

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <h1 className="text-2xl font-bold text-slate-900">Inventory</h1>
        {report && (
          <div className="flex gap-4 text-sm">
            <span className="text-amber-700">⚠ Low stock: <strong>{report.lowStockCount}</strong></span>
            <span className="text-red-700">✕ Out of stock: <strong>{report.outOfStockCount}</strong></span>
            <span className="text-slate-500">Total: {report.total}</span>
          </div>
        )}
      </div>

      {msg && (
        <div className={`rounded-lg px-4 py-2 text-sm ${msg.ok ? "bg-green-50 text-green-800" : "bg-red-50 text-red-800"}`}>
          {msg.text}
        </div>
      )}

      <div className="flex gap-2">
        {(["all", "low", "out"] as const).map((f) => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            className={`rounded-lg border px-3 py-1.5 text-sm font-medium transition ${
              filter === f ? "border-blue-500 bg-blue-50 text-blue-700" : "border-slate-200 text-slate-600 hover:bg-slate-50"
            }`}
          >
            {f === "all" ? "All Products" : f === "low" ? "Low Stock" : "Out of Stock"}
          </button>
        ))}
      </div>

      {loading ? (
        <div className="flex h-32 items-center justify-center">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-blue-600 border-t-transparent" />
        </div>
      ) : !report || report.products.length === 0 ? (
        <p className="rounded-xl border p-8 text-center text-slate-400">No products found.</p>
      ) : (
        <div className="overflow-x-auto rounded-xl border border-slate-200 bg-white shadow-sm">
          <table className="w-full text-sm">
            <thead className="border-b border-slate-200 bg-slate-50">
              <tr>
                <th className="p-3 text-left font-medium text-slate-700">Product</th>
                <th className="p-3 text-left font-medium text-slate-700">SKU</th>
                <th className="p-3 text-center font-medium text-slate-700">Stock</th>
                <th className="p-3 text-center font-medium text-slate-700">Threshold</th>
                <th className="p-3 text-center font-medium text-slate-700">Actions</th>
              </tr>
            </thead>
            <tbody>
              {report.products.map((item) => (
                <tr key={item.id} className="border-b border-slate-100 hover:bg-slate-50">
                  <td className="p-3 text-slate-800">{item.nameEn}</td>
                  <td className="p-3 text-slate-500">{item.sku ?? "—"}</td>
                  <td className={`p-3 text-center ${stockClass(item)}`}>{item.stock}</td>
                  <td className="p-3 text-center text-slate-500">{item.lowStockThreshold ?? "—"}</td>
                  <td className="p-3 text-center">
                    {editId === item.id ? (
                      <div className="flex items-center justify-center gap-2">
                        <input
                          type="number"
                          value={editQty}
                          onChange={(e) => setEditQty(e.target.value)}
                          className="w-20 rounded border px-2 py-1 text-sm"
                          placeholder="Qty"
                        />
                        <input
                          value={editNote}
                          onChange={(e) => setEditNote(e.target.value)}
                          className="w-32 rounded border px-2 py-1 text-sm"
                          placeholder="Note (opt.)"
                        />
                        <button
                          onClick={() => handleSave(item.id)}
                          disabled={saving}
                          className="rounded bg-blue-600 px-3 py-1 text-xs text-white hover:bg-blue-700 disabled:opacity-50"
                        >
                          Save
                        </button>
                        <button
                          onClick={() => setEditId(null)}
                          className="rounded border px-3 py-1 text-xs text-slate-600 hover:bg-slate-100"
                        >
                          ✕
                        </button>
                      </div>
                    ) : (
                      <button
                        onClick={() => { setEditId(item.id); setEditQty(String(item.stock)); setEditNote(""); }}
                        className="rounded border border-slate-300 px-3 py-1 text-xs text-slate-600 hover:bg-slate-100"
                      >
                        Adjust Stock
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
