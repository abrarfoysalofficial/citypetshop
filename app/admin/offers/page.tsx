"use client";

import { useState } from "react";
import Link from "next/link";
import { useOffers } from "@store/OffersContext";
import { Plus, Pencil, Trash2 } from "lucide-react";
import type { Offer } from "@lib/types";

export default function AdminOffersPage() {
  const { offers, addOffer, updateOffer, deleteOffer, getOffer, lastUpdated } = useOffers();
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState<Partial<Offer>>({
    title: "",
    description: "",
    discountType: "percent",
    discountValue: 0,
    startDate: new Date().toISOString().slice(0, 10),
    endDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().slice(0, 10),
    active: true,
    minPurchase: 0,
  });

  const resetForm = () => {
    setForm({
      title: "",
      description: "",
      discountType: "percent",
      discountValue: 0,
      startDate: new Date().toISOString().slice(0, 10),
      endDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().slice(0, 10),
      active: true,
      minPurchase: 0,
    });
    setShowForm(false);
    setEditingId(null);
  };

  const handleEdit = (id: string) => {
    const o = getOffer(id);
    if (!o) return;
    setForm({
      title: o.title,
      description: o.description,
      discountType: o.discountType,
      discountValue: o.discountValue,
      startDate: o.startDate.slice(0, 10),
      endDate: o.endDate.slice(0, 10),
      active: o.active,
      minPurchase: o.minPurchase ?? 0,
    });
    setEditingId(id);
    setShowForm(true);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.title || form.discountValue == null) return;
    if (editingId) {
      updateOffer(editingId, {
        ...form,
        startDate: form.startDate!,
        endDate: form.endDate!,
      });
    } else {
      addOffer({
        title: form.title!,
        description: form.description ?? "",
        discountType: (form.discountType as "percent" | "fixed") ?? "percent",
        discountValue: Number(form.discountValue) || 0,
        startDate: form.startDate!,
        endDate: form.endDate!,
        active: form.active ?? true,
        minPurchase: form.minPurchase ? Number(form.minPurchase) : undefined,
      });
    }
    resetForm();
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Offers & Flash Sale</h1>
          <p className="mt-1 text-slate-600">
            Create and manage offers. Last updated:{" "}
            {lastUpdated ? new Date(lastUpdated).toLocaleString() : "—"}
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
          Create Offer
        </button>
      </div>

      {showForm && (
        <form
          onSubmit={handleSubmit}
          className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm"
        >
          <h2 className="mb-4 text-lg font-semibold text-slate-900">
            {editingId ? "Edit Offer" : "New Offer"}
          </h2>
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="sm:col-span-2">
              <label className="block text-sm font-medium text-slate-700">Title</label>
              <input
                type="text"
                value={form.title ?? ""}
                onChange={(e) => setForm((f) => ({ ...f, title: e.target.value }))}
                className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2"
                required
              />
            </div>
            <div className="sm:col-span-2">
              <label className="block text-sm font-medium text-slate-700">Description</label>
              <textarea
                value={form.description ?? ""}
                onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))}
                className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2"
                rows={2}
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
              <label className="block text-sm font-medium text-slate-700">Discount Value</label>
              <input
                type="number"
                min={0}
                value={form.discountValue ?? 0}
                onChange={(e) => setForm((f) => ({ ...f, discountValue: Number(e.target.value) }))}
                className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700">Min Purchase (৳)</label>
              <input
                type="number"
                min={0}
                value={form.minPurchase ?? 0}
                onChange={(e) => setForm((f) => ({ ...f, minPurchase: Number(e.target.value) }))}
                className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700">Start Date</label>
              <input
                type="date"
                value={form.startDate ?? ""}
                onChange={(e) => setForm((f) => ({ ...f, startDate: e.target.value }))}
                className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700">End Date</label>
              <input
                type="date"
                value={form.endDate ?? ""}
                onChange={(e) => setForm((f) => ({ ...f, endDate: e.target.value }))}
                className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2"
              />
            </div>
            <div className="flex items-center gap-2 sm:col-span-2">
              <input
                type="checkbox"
                id="offer-active"
                checked={form.active ?? true}
                onChange={(e) => setForm((f) => ({ ...f, active: e.target.checked }))}
                className="rounded border-slate-300"
              />
              <label htmlFor="offer-active" className="text-sm text-slate-700">
                Active
              </label>
            </div>
          </div>
          <div className="mt-4 flex gap-3">
            <button
              type="submit"
              className="rounded-lg bg-primary px-4 py-2 text-sm font-medium text-white hover:bg-primary/90"
            >
              {editingId ? "Update" : "Create"} Offer
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
              <th className="p-3 font-medium text-slate-900">Title</th>
              <th className="p-3 font-medium text-slate-900">Discount</th>
              <th className="p-3 font-medium text-slate-900">Period</th>
              <th className="p-3 font-medium text-slate-900">Active</th>
              <th className="p-3 font-medium text-slate-900">Actions</th>
            </tr>
          </thead>
          <tbody>
            {offers.length === 0 ? (
              <tr>
                <td colSpan={5} className="p-6 text-center text-slate-500">
                  No offers yet. Create one above.
                </td>
              </tr>
            ) : (
              offers.map((o) => (
                <tr key={o.id} className="border-b border-slate-100">
                  <td className="p-3 font-medium text-slate-900">{o.title}</td>
                  <td className="p-3">
                    {o.discountType === "percent" ? `${o.discountValue}%` : `৳${o.discountValue}`}
                  </td>
                  <td className="p-3 text-slate-600">
                    {o.startDate.slice(0, 10)} – {o.endDate.slice(0, 10)}
                  </td>
                  <td className="p-3">{o.active ? "Yes" : "No"}</td>
                  <td className="p-3">
                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        onClick={() => handleEdit(o.id)}
                        className="rounded p-2 text-slate-600 hover:bg-slate-100"
                        aria-label="Edit"
                      >
                        <Pencil className="h-4 w-4" />
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          if (confirm("Delete this offer?")) deleteOffer(o.id);
                        }}
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
