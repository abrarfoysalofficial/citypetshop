"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { Plus, Pencil, Trash2, Loader2, Zap } from "lucide-react";

type FlashSaleRule = {
  id: string;
  productId: string;
  startAt: string;
  endAt: string;
  discountPct: number;
  isActive: boolean;
  product?: { id: string; nameEn: string; sku: string | null } | null;
};

export default function AdminFlashSalePage() {
  const [rules, setRules] = useState<FlashSaleRule[]>([]);
  const [products, setProducts] = useState<{ id: string; nameEn: string; slug: string }[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState<FlashSaleRule | null>(null);
  const [form, setForm] = useState({
    productId: "",
    startAt: "",
    endAt: "",
    discountPct: 15,
    isActive: true,
  });
  const [saving, setSaving] = useState(false);

  const fetchData = () => {
    Promise.all([
      fetch("/api/admin/flash-sale").then((r) => (r.status === 401 ? [] : r.json())),
      fetch("/api/admin/products?limit=200").then((r) => (r.status === 401 ? [] : r.json())),
    ]).then(([rulesData, productsData]) => {
      setRules(Array.isArray(rulesData) ? rulesData : []);
      setProducts(productsData?.products?.map((p: { id: string; nameEn: string; slug: string }) => ({ id: p.id, nameEn: p.nameEn, slug: p.slug })) ?? []);
    }).finally(() => setLoading(false));
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.productId || !form.startAt || !form.endAt) return;
    setSaving(true);
    try {
      const url = editing ? `/api/admin/flash-sale/${editing.id}` : "/api/admin/flash-sale";
      const method = editing ? "PATCH" : "POST";
      const toISO = (v: string) => (v ? new Date(v).toISOString() : v);
      const body = editing
        ? { startAt: toISO(form.startAt), endAt: toISO(form.endAt), discountPct: form.discountPct, isActive: form.isActive }
        : { ...form, startAt: toISO(form.startAt), endAt: toISO(form.endAt) };
      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
      if (res.ok) {
        setShowForm(false);
        setEditing(null);
        setForm({ productId: "", startAt: "", endAt: "", discountPct: 15, isActive: true });
        fetchData();
      }
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Delete this flash sale rule?")) return;
    const res = await fetch(`/api/admin/flash-sale/${id}`, { method: "DELETE" });
    if (res.ok) fetchData();
  };

  const startEdit = (rule: FlashSaleRule) => {
    setEditing(rule);
    setForm({
      productId: rule.productId,
      startAt: rule.startAt.slice(0, 16),
      endAt: rule.endAt.slice(0, 16),
      discountPct: rule.discountPct,
      isActive: rule.isActive,
    });
    setShowForm(true);
  };

  if (loading) {
    return (
      <div className="flex h-64 items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-slate-900">Flash Sale Rules</h1>
      <p className="text-slate-600">
        Create and manage flash sale rules. Products with active rules appear in the Flash Sale section on the homepage (when enabled in Homepage Builder).
      </p>

      <button
        type="button"
        onClick={() => {
          setEditing(null);
          setForm({ productId: "", startAt: "", endAt: "", discountPct: 15, isActive: true });
          setShowForm(!showForm);
        }}
        className="flex items-center gap-2 rounded-lg bg-accent px-4 py-2 text-sm font-medium text-white hover:bg-accent/90"
      >
        <Plus className="h-4 w-4" />
        {showForm ? "Cancel" : "Add Rule"}
      </button>

      {showForm && (
        <form onSubmit={handleSubmit} className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
          <h2 className="mb-4 font-semibold text-slate-900">{editing ? "Edit Rule" : "New Rule"}</h2>
          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label className="mb-1 block text-sm font-medium text-slate-700">Product</label>
              <select
                value={form.productId}
                onChange={(e) => setForm({ ...form, productId: e.target.value })}
                required
                disabled={!!editing}
                className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm"
              >
                <option value="">Select product</option>
                {products.map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.nameEn}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="mb-1 block text-sm font-medium text-slate-700">Discount %</label>
              <input
                type="number"
                min={1}
                max={99}
                value={form.discountPct}
                onChange={(e) => setForm({ ...form, discountPct: parseInt(e.target.value, 10) || 0 })}
                className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm"
              />
            </div>
            <div>
              <label className="mb-1 block text-sm font-medium text-slate-700">Start</label>
              <input
                type="datetime-local"
                value={form.startAt}
                onChange={(e) => setForm({ ...form, startAt: e.target.value })}
                required
                className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm"
              />
            </div>
            <div>
              <label className="mb-1 block text-sm font-medium text-slate-700">End</label>
              <input
                type="datetime-local"
                value={form.endAt}
                onChange={(e) => setForm({ ...form, endAt: e.target.value })}
                required
                className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm"
              />
            </div>
            <div className="sm:col-span-2">
              <label className="flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={form.isActive}
                  onChange={(e) => setForm({ ...form, isActive: e.target.checked })}
                  className="h-4 w-4 rounded border-slate-300 text-blue-600"
                />
                <span className="text-sm font-medium text-slate-700">Active</span>
              </label>
            </div>
          </div>
          <div className="mt-4 flex gap-2">
            <button
              type="submit"
              disabled={saving}
              className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700 disabled:opacity-50"
            >
              {saving ? "Saving…" : editing ? "Update" : "Create"}
            </button>
            <button
              type="button"
              onClick={() => setShowForm(false)}
              className="rounded-lg border border-slate-200 px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50"
            >
              Cancel
            </button>
          </div>
        </form>
      )}

      <div className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
        {rules.length === 0 ? (
          <div className="p-8 text-center text-slate-500">No flash sale rules. Add one to show flash sale products on the homepage.</div>
        ) : (
          <table className="w-full text-left text-sm">
            <thead className="border-b border-slate-200 bg-slate-50">
              <tr>
                <th className="p-3 font-medium text-slate-900">Product</th>
                <th className="p-3 font-medium text-slate-900">Discount</th>
                <th className="p-3 font-medium text-slate-900">Start</th>
                <th className="p-3 font-medium text-slate-900">End</th>
                <th className="p-3 font-medium text-slate-900">Status</th>
                <th className="p-3 font-medium text-slate-900">Actions</th>
              </tr>
            </thead>
            <tbody>
              {rules.map((r) => (
                <tr key={r.id} className="border-b border-slate-100">
                  <td className="p-3">
                    <Link href={`/admin/products?search=${r.product?.nameEn ?? ""}`} className="font-medium text-primary hover:underline">
                      {r.product?.nameEn ?? r.productId.slice(0, 8)}
                    </Link>
                  </td>
                  <td className="p-3">{r.discountPct}%</td>
                  <td className="p-3 text-slate-600">{new Date(r.startAt).toLocaleString()}</td>
                  <td className="p-3 text-slate-600">{new Date(r.endAt).toLocaleString()}</td>
                  <td className="p-3">
                    <span className={`rounded px-2 py-0.5 text-xs font-medium ${r.isActive ? "bg-emerald-100 text-emerald-800" : "bg-slate-100 text-slate-600"}`}>
                      {r.isActive ? "Active" : "Inactive"}
                    </span>
                  </td>
                  <td className="p-3">
                    <button
                      type="button"
                      onClick={() => startEdit(r)}
                      className="mr-2 text-blue-600 hover:underline"
                    >
                      Edit
                    </button>
                    <button
                      type="button"
                      onClick={() => handleDelete(r.id)}
                      className="text-red-600 hover:underline"
                    >
                      Delete
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
