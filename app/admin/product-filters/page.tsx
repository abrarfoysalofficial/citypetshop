"use client";

import { useState, useEffect, useCallback } from "react";
import { Plus, Pencil, Trash2, Loader2 } from "lucide-react";

type Filter = {
  id: string;
  key: string;
  labelEn: string;
  labelBn?: string | null;
  type: string;
  config?: unknown;
  sortOrder: number;
  isActive: boolean;
};

export default function AdminProductFiltersPage() {
  const [filters, setFilters] = useState<Filter[]>([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState<Filter | null>(null);
  const [key, setKey] = useState("");
  const [labelEn, setLabelEn] = useState("");
  const [labelBn, setLabelBn] = useState("");
  const [type, setType] = useState<"select" | "range" | "checkbox">("select");
  const [sortOrder, setSortOrder] = useState(0);
  const [isActive, setIsActive] = useState(true);
  const [saving, setSaving] = useState(false);

  const fetchFilters = useCallback(() => {
    fetch("/api/admin/product-filters")
      .then((r) => {
        if (r.status === 401) {
          window.location.href = "/admin/login";
          return null;
        }
        return r.json();
      })
      .then((d) => {
        if (Array.isArray(d)) setFilters(d);
      })
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    fetchFilters();
  }, [fetchFilters]);

  const openCreate = () => {
    setEditing(null);
    setKey("");
    setLabelEn("");
    setLabelBn("");
    setType("select");
    setSortOrder(0);
    setIsActive(true);
    setModalOpen(true);
  };

  const openEdit = (f: Filter) => {
    setEditing(f);
    setKey(f.key);
    setLabelEn(f.labelEn);
    setLabelBn(f.labelBn ?? "");
    setType(f.type as "select" | "range" | "checkbox");
    setSortOrder(f.sortOrder);
    setIsActive(f.isActive);
    setModalOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!key.trim() || !labelEn.trim()) return;
    setSaving(true);
    try {
      if (editing) {
        const res = await fetch(`/api/admin/product-filters/${editing.id}`, {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ labelEn: labelEn.trim(), labelBn: labelBn.trim() || undefined, type, sortOrder, isActive }),
        });
        if (res.ok) {
          setModalOpen(false);
          fetchFilters();
        } else {
          const d = await res.json();
          alert(d.error ?? "Failed");
        }
      } else {
        const res = await fetch("/api/admin/product-filters", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            key: key.trim().toLowerCase().replace(/\s+/g, "_"),
            labelEn: labelEn.trim(),
            labelBn: labelBn.trim() || undefined,
            type,
            sortOrder,
            isActive,
          }),
        });
        if (res.ok) {
          setModalOpen(false);
          fetchFilters();
        } else {
          const d = await res.json();
          alert(d.error ?? "Failed");
        }
      }
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Delete this filter?")) return;
    const res = await fetch(`/api/admin/product-filters/${id}`, { method: "DELETE" });
    if (res.ok) fetchFilters();
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
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-slate-900">Product Filters</h1>
        <button
          onClick={openCreate}
          className="flex items-center gap-2 rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700"
        >
          <Plus className="h-4 w-4" />
          Add Filter
        </button>
      </div>
      <p className="text-slate-600">
        Configurable filters for the shop (brand, price range, category).
      </p>

      <div className="rounded-xl border border-slate-200 bg-white shadow-sm overflow-hidden">
        {filters.length === 0 ? (
          <div className="p-12 text-center text-slate-500">
            No filters yet. Add brand, price_range, or category.
          </div>
        ) : (
          <table className="w-full text-left text-sm">
            <thead className="border-b border-slate-200 bg-slate-50">
              <tr>
                <th className="p-4 font-medium text-slate-700">Key</th>
                <th className="p-4 font-medium text-slate-700">Label</th>
                <th className="p-4 font-medium text-slate-700">Type</th>
                <th className="p-4 font-medium text-slate-700">Status</th>
                <th className="p-4 font-medium text-slate-700">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filters.map((f) => (
                <tr key={f.id} className="hover:bg-slate-50">
                  <td className="p-4 font-mono text-slate-700">{f.key}</td>
                  <td className="p-4 font-medium">{f.labelEn}</td>
                  <td className="p-4 text-slate-600">{f.type}</td>
                  <td className="p-4">
                    <span
                      className={`rounded-full px-2 py-0.5 text-xs font-medium ${
                        f.isActive ? "bg-green-100 text-green-700" : "bg-slate-100 text-slate-600"
                      }`}
                    >
                      {f.isActive ? "Active" : "Inactive"}
                    </span>
                  </td>
                  <td className="p-4">
                    <div className="flex gap-2">
                      <button onClick={() => openEdit(f)} className="rounded p-2 text-slate-600 hover:bg-slate-100 hover:text-blue-600">
                        <Pencil className="h-4 w-4" />
                      </button>
                      <button onClick={() => handleDelete(f.id)} className="rounded p-2 text-slate-600 hover:bg-slate-100 hover:text-red-600">
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {modalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
          <div className="w-full max-w-md rounded-xl bg-white p-6 shadow-xl">
            <h2 className="mb-4 text-lg font-semibold text-slate-900">
              {editing ? "Edit Filter" : "New Filter"}
            </h2>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Key *</label>
                <input
                  type="text"
                  value={key}
                  onChange={(e) => setKey(e.target.value.toLowerCase().replace(/\s+/g, "_"))}
                  required
                  disabled={!!editing}
                  placeholder="e.g. brand, price_range"
                  className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm disabled:bg-slate-100"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Label (EN) *</label>
                <input
                  type="text"
                  value={labelEn}
                  onChange={(e) => setLabelEn(e.target.value)}
                  required
                  className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Type</label>
                <select
                  value={type}
                  onChange={(e) => setType(e.target.value as "select" | "range" | "checkbox")}
                  className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm"
                >
                  <option value="select">Select</option>
                  <option value="range">Range</option>
                  <option value="checkbox">Checkbox</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Sort order</label>
                <input
                  type="number"
                  value={sortOrder}
                  onChange={(e) => setSortOrder(parseInt(e.target.value, 10) || 0)}
                  className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm"
                />
              </div>
              <div className="flex items-center gap-2">
                <input type="checkbox" id="isActive" checked={isActive} onChange={(e) => setIsActive(e.target.checked)} />
                <label htmlFor="isActive" className="text-sm text-slate-700">Active</label>
              </div>
              <div className="flex gap-2 pt-4">
                <button
                  type="submit"
                  disabled={saving}
                  className="flex items-center gap-2 rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700 disabled:opacity-50"
                >
                  {saving && <Loader2 className="h-4 w-4 animate-spin" />}
                  {editing ? "Update" : "Create"}
                </button>
                <button type="button" onClick={() => setModalOpen(false)} className="rounded-lg border border-slate-200 px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50">
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
