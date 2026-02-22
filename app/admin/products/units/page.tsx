"use client";

import { useState, useEffect, useCallback } from "react";
import { Plus, Pencil, Trash2, Loader2 } from "lucide-react";

type Unit = { id: string; value: string; sortOrder: number; isActive: boolean; _type: "size" | "weight" | "ram" };

export default function AdminUnitsPage() {
  const [sizes, setSizes] = useState<Unit[]>([]);
  const [weights, setWeights] = useState<Unit[]>([]);
  const [rams, setRams] = useState<Unit[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<"size" | "weight" | "ram">("size");
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState<Unit | null>(null);
  const [value, setValue] = useState("");
  const [sortOrder, setSortOrder] = useState(0);
  const [isActive, setIsActive] = useState(true);
  const [saving, setSaving] = useState(false);

  const fetchUnits = useCallback(() => {
    fetch("/api/admin/units")
      .then((r) => {
        if (r.status === 401) {
          window.location.href = "/admin/login";
          return null;
        }
        return r.json();
      })
      .then((d) => {
        if (d) {
          setSizes(d.sizes ?? []);
          setWeights(d.weights ?? []);
          setRams(d.rams ?? []);
        }
      })
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    fetchUnits();
  }, [fetchUnits]);

  const openCreate = (type: "size" | "weight" | "ram") => {
    setActiveTab(type);
    setEditing(null);
    setValue("");
    setSortOrder(0);
    setIsActive(true);
    setModalOpen(true);
  };

  const openEdit = (u: Unit) => {
    setActiveTab(u._type);
    setEditing(u);
    setValue(u.value);
    setSortOrder(u.sortOrder);
    setIsActive(u.isActive);
    setModalOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!value.trim()) return;
    setSaving(true);
    try {
      if (editing) {
        const res = await fetch(`/api/admin/units/${editing.id}`, {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ type: activeTab, value: value.trim(), sortOrder, isActive }),
        });
        if (res.ok) {
          setModalOpen(false);
          fetchUnits();
        } else {
          const d = await res.json();
          alert(d.error ?? "Failed");
        }
      } else {
        const res = await fetch("/api/admin/units", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ type: activeTab, value: value.trim(), sortOrder, isActive }),
        });
        if (res.ok) {
          setModalOpen(false);
          fetchUnits();
        } else {
          const d = await res.json();
          alert(d.error ?? "Failed");
        }
      }
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (u: Unit) => {
    if (!confirm(`Delete "${u.value}"?`)) return;
    const res = await fetch(`/api/admin/units/${u.id}?type=${u._type}`, { method: "DELETE" });
    if (res.ok) fetchUnits();
  };

  const tabs = [
    { key: "size" as const, label: "Sizes", items: sizes },
    { key: "weight" as const, label: "Weights", items: weights },
    { key: "ram" as const, label: "RAMs", items: rams },
  ];

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
        <h1 className="text-2xl font-bold text-slate-900">Units</h1>
        <div className="flex gap-2">
          {tabs.map((t) => (
            <button
              key={t.key}
              onClick={() => setActiveTab(t.key)}
              className={`rounded-lg px-4 py-2 text-sm font-medium ${
                activeTab === t.key ? "bg-blue-600 text-white" : "bg-slate-100 text-slate-700 hover:bg-slate-200"
              }`}
            >
              {t.label}
            </button>
          ))}
        </div>
      </div>
      <p className="text-slate-600">
        Manage product units: sizes, weights, and RAM variants.
      </p>

      {tabs.map((t) => (
        <div key={t.key} className={`rounded-xl border border-slate-200 bg-white shadow-sm ${activeTab !== t.key ? "hidden" : ""}`}>
          <div className="flex items-center justify-between border-b border-slate-200 p-4">
            <h2 className="font-semibold text-slate-900">{t.label}</h2>
            <button
              onClick={() => openCreate(t.key)}
              className="flex items-center gap-2 rounded-lg bg-blue-600 px-3 py-1.5 text-sm font-medium text-white hover:bg-blue-700"
            >
              <Plus className="h-4 w-4" />
              Add
            </button>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-slate-200 bg-slate-50">
                  <th className="p-3 text-left font-medium">Value</th>
                  <th className="p-3 text-left">Sort</th>
                  <th className="p-3 text-left">Active</th>
                  <th className="p-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody>
                {t.items.length === 0 ? (
                  <tr>
                    <td colSpan={4} className="p-8 text-center text-slate-500">
                      No {t.label.toLowerCase()} yet.
                    </td>
                  </tr>
                ) : (
                  t.items.map((u) => (
                    <tr key={u.id} className="border-b border-slate-100">
                      <td className="p-3 font-medium">{u.value}</td>
                      <td className="p-3">{u.sortOrder}</td>
                      <td className="p-3">{u.isActive ? "Yes" : "No"}</td>
                      <td className="p-3 text-right">
                        <button
                          onClick={() => openEdit(u)}
                          className="rounded p-1.5 text-slate-600 hover:bg-slate-100 hover:text-blue-600"
                        >
                          <Pencil className="h-4 w-4" />
                        </button>
                        <button
                          onClick={() => handleDelete(u)}
                          className="rounded p-1.5 text-slate-600 hover:bg-slate-100 hover:text-red-600"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      ))}

      {modalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
          <div className="w-full max-w-md rounded-xl bg-white p-6 shadow-xl">
            <h2 className="mb-4 text-lg font-semibold text-slate-900">
              {editing ? `Edit ${activeTab}` : `Add ${activeTab}`}
            </h2>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Value *</label>
                <input
                  type="text"
                  value={value}
                  onChange={(e) => setValue(e.target.value)}
                  required
                  placeholder={activeTab === "size" ? "e.g. Large" : activeTab === "weight" ? "e.g. 1kg" : "e.g. 4GB"}
                  className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm"
                />
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
                <button
                  type="button"
                  onClick={() => setModalOpen(false)}
                  className="rounded-lg border border-slate-200 px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50"
                >
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
