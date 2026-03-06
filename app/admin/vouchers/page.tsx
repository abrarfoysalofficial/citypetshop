"use client";

import { useState, useEffect } from "react";
import { useVouchers } from "@/store/VouchersContext";
import { Plus, Pencil, Trash2, Loader2 } from "lucide-react";
import type { Voucher } from "@/lib/types";

export default function AdminVouchersPage() {
  const { vouchers: contextVouchers, addVoucher, updateVoucher, deleteVoucher, getVoucher } = useVouchers();
  const [vouchers, setVouchers] = useState<Voucher[]>([]);
  const [useApi, setUseApi] = useState<boolean | null>(null);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState<Partial<Voucher>>({
    code: "",
    discountType: "percent",
    value: 0,
    minSpend: 0,
    maxUses: 1,
    validFrom: new Date().toISOString().slice(0, 10),
    validTo: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().slice(0, 10),
    active: true,
  });

  useEffect(() => {
    fetchVouchers();
    // eslint-disable-next-line react-hooks/exhaustive-deps -- fetch on mount only
  }, []);

  const fetchVouchers = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/admin/vouchers");
      if (res.ok) {
        const data = await res.json();
        setVouchers(Array.isArray(data) ? data : []);
        setUseApi(true);
      } else {
        setVouchers(contextVouchers);
        setUseApi(false);
      }
    } catch {
      setVouchers(contextVouchers);
      setUseApi(false);
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setForm({
      code: "",
      discountType: "percent",
      value: 0,
      minSpend: 0,
      maxUses: 1,
      validFrom: new Date().toISOString().slice(0, 10),
      validTo: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().slice(0, 10),
      active: true,
    });
    setShowForm(false);
    setEditingId(null);
  };

  const handleEdit = (id: string) => {
    const v = useApi ? vouchers.find((x) => x.id === id) : getVoucher(id);
    if (!v) return;
    setForm({
      code: v.code,
      discountType: v.discountType,
      value: v.value,
      minSpend: v.minSpend,
      maxUses: v.maxUses,
      validFrom: v.validFrom?.slice(0, 10),
      validTo: v.validTo?.slice(0, 10),
      active: v.active,
    });
    setEditingId(id);
    setShowForm(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.code || form.value == null) return;

    if (useApi) {
      if (editingId) {
        const res = await fetch(`/api/admin/vouchers/${editingId}`, {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            discountType: form.discountType,
            value: form.value,
            minSpend: form.minSpend,
            maxUses: form.maxUses,
            validTo: form.validTo,
            active: form.active,
          }),
        });
        if (res.ok) await fetchVouchers();
      } else {
        const res = await fetch("/api/admin/vouchers", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            code: form.code.toUpperCase().trim(),
            discountType: form.discountType ?? "percent",
            value: Number(form.value) || 0,
            minSpend: Number(form.minSpend) || 0,
            maxUses: Number(form.maxUses) || 1,
            validTo: form.validTo,
            active: form.active ?? true,
          }),
        });
        if (res.ok) await fetchVouchers();
      }
    } else {
      if (editingId) {
        updateVoucher(editingId, {
          ...form,
          validFrom: form.validFrom!,
          validTo: form.validTo!,
        });
      } else {
        addVoucher({
          code: form.code!.toUpperCase().trim(),
          discountType: (form.discountType as "percent" | "fixed") ?? "percent",
          value: Number(form.value) || 0,
          minSpend: Number(form.minSpend) || 0,
          maxUses: Number(form.maxUses) || 1,
          validFrom: form.validFrom!,
          validTo: form.validTo!,
          active: form.active ?? true,
        });
      }
      setVouchers(contextVouchers);
    }
    resetForm();
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Delete this voucher?")) return;
    if (useApi) {
      const res = await fetch(`/api/admin/vouchers/${id}`, { method: "DELETE" });
      if (res.ok) await fetchVouchers();
    } else {
      deleteVoucher(id);
      setVouchers((prev) => prev.filter((v) => v.id !== id));
    }
  };

  const displayVouchers = useApi ? vouchers : contextVouchers;

  if (loading) {
    return (
      <div className="flex h-96 items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Vouchers</h1>
          <p className="mt-1 text-slate-600">
            Create voucher codes: fixed/percent, min spend, usage limits, validity.
            Stored in database.
          </p>
        </div>
        <button
          type="button"
          onClick={() => {
            resetForm();
            setShowForm(true);
          }}
          className="inline-flex items-center gap-2 rounded-lg bg-primary px-4 py-2 text-sm font-medium text-white hover:bg-primary/90"
        >
          <Plus className="h-4 w-4" />
          Create Voucher
        </button>
      </div>

      {showForm && (
        <form
          onSubmit={handleSubmit}
          className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm"
        >
          <h2 className="mb-4 text-lg font-semibold text-slate-900">
            {editingId ? "Edit Voucher" : "New Voucher"}
          </h2>
          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label className="block text-sm font-medium text-slate-700">Code</label>
              <input
                type="text"
                value={form.code ?? ""}
                onChange={(e) => setForm((f) => ({ ...f, code: e.target.value }))}
                className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 font-mono uppercase"
                placeholder="SAVE10"
                required
                disabled={!!editingId}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700">Discount Type</label>
              <select
                value={form.discountType ?? "percent"}
                onChange={(e) =>
                  setForm((f) => ({ ...f, discountType: e.target.value as "percent" | "fixed" }))
                }
                className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2"
              >
                <option value="percent">Percent (%)</option>
                <option value="fixed">Fixed (৳)</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700">Value</label>
              <input
                type="number"
                min={0}
                value={form.value ?? 0}
                onChange={(e) => setForm((f) => ({ ...f, value: Number(e.target.value) }))}
                className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700">Min Spend (৳)</label>
              <input
                type="number"
                min={0}
                value={form.minSpend ?? 0}
                onChange={(e) => setForm((f) => ({ ...f, minSpend: Number(e.target.value) }))}
                className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700">Max Uses</label>
              <input
                type="number"
                min={1}
                value={form.maxUses ?? 1}
                onChange={(e) => setForm((f) => ({ ...f, maxUses: Number(e.target.value) }))}
                className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700">Valid From</label>
              <input
                type="date"
                value={form.validFrom ?? ""}
                onChange={(e) => setForm((f) => ({ ...f, validFrom: e.target.value }))}
                className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700">Valid To</label>
              <input
                type="date"
                value={form.validTo ?? ""}
                onChange={(e) => setForm((f) => ({ ...f, validTo: e.target.value }))}
                className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2"
              />
            </div>
            <div className="flex items-center gap-2 sm:col-span-2">
              <input
                type="checkbox"
                id="voucher-active"
                checked={form.active ?? true}
                onChange={(e) => setForm((f) => ({ ...f, active: e.target.checked }))}
                className="rounded border-slate-300"
              />
              <label htmlFor="voucher-active" className="text-sm text-slate-700">
                Active
              </label>
            </div>
          </div>
          <div className="mt-4 flex gap-3">
            <button
              type="submit"
              className="rounded-lg bg-primary px-4 py-2 text-sm font-medium text-white hover:bg-primary/90"
            >
              {editingId ? "Update" : "Create"} Voucher
            </button>
            <button
              type="button"
              onClick={resetForm}
              className="rounded-lg border border-slate-300 px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50"
            >
              Cancel
            </button>
          </div>
        </form>
      )}

      <div className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
        <table className="w-full text-left text-sm">
          <thead className="border-b border-slate-200 bg-slate-50">
            <tr>
              <th className="p-3 font-medium text-slate-900">Code</th>
              <th className="p-3 font-medium text-slate-900">Discount</th>
              <th className="p-3 font-medium text-slate-900">Min Spend</th>
              <th className="p-3 font-medium text-slate-900">Uses</th>
              <th className="p-3 font-medium text-slate-900">Valid</th>
              <th className="p-3 font-medium text-slate-900">Active</th>
              <th className="p-3 font-medium text-slate-900">Actions</th>
            </tr>
          </thead>
          <tbody>
            {displayVouchers.length === 0 ? (
              <tr>
                <td colSpan={7} className="p-6 text-center text-slate-500">
                  No vouchers yet. Create one above.
                </td>
              </tr>
            ) : (
              displayVouchers.map((v) => (
                <tr key={v.id} className="border-b border-slate-100">
                  <td className="p-3 font-mono font-medium text-slate-900">{v.code}</td>
                  <td className="p-3">
                    {v.discountType === "percent" ? `${v.value}%` : `৳${v.value}`}
                  </td>
                  <td className="p-3">৳{v.minSpend ?? 0}</td>
                  <td className="p-3">
                    {v.usedCount ?? 0} / {v.maxUses ?? 1}
                  </td>
                  <td className="p-3 text-slate-600">
                    {v.validFrom?.slice(0, 10) ?? "—"} – {v.validTo?.slice(0, 10) ?? "—"}
                  </td>
                  <td className="p-3">{v.active ? "Yes" : "No"}</td>
                  <td className="p-3">
                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        onClick={() => handleEdit(v.id)}
                        className="rounded p-2 text-slate-600 hover:bg-slate-100"
                        aria-label="Edit"
                      >
                        <Pencil className="h-4 w-4" />
                      </button>
                      <button
                        type="button"
                        onClick={() => handleDelete(v.id)}
                        className="rounded p-2 text-red-600 hover:bg-red-50"
                        aria-label="Delete"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
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
