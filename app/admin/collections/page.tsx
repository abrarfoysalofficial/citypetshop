"use client";

import { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import { Plus, Pencil, Trash2, Loader2 } from "lucide-react";

type Collection = {
  id: string;
  slug: string;
  nameEn: string;
  nameBn?: string | null;
  productIds: string[];
  sortOrder: number;
  isActive: boolean;
};

export default function AdminCollectionsPage() {
  const [collections, setCollections] = useState<Collection[]>([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState<Collection | null>(null);
  const [slug, setSlug] = useState("");
  const [nameEn, setNameEn] = useState("");
  const [nameBn, setNameBn] = useState("");
  const [productIds, setProductIds] = useState<string[]>([]);
  const [productIdInput, setProductIdInput] = useState("");
  const [sortOrder, setSortOrder] = useState(0);
  const [isActive, setIsActive] = useState(true);
  const [saving, setSaving] = useState(false);

  const fetchCollections = useCallback(() => {
    fetch("/api/admin/collections")
      .then((r) => {
        if (r.status === 401) {
          window.location.href = "/admin/login";
          return null;
        }
        return r.json();
      })
      .then((d) => {
        if (Array.isArray(d)) setCollections(d);
      })
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    fetchCollections();
  }, [fetchCollections]);

  const openCreate = () => {
    setEditing(null);
    setSlug("");
    setNameEn("");
    setNameBn("");
    setProductIds([]);
    setProductIdInput("");
    setSortOrder(0);
    setIsActive(true);
    setModalOpen(true);
  };

  const openEdit = (c: Collection) => {
    setEditing(c);
    setSlug(c.slug);
    setNameEn(c.nameEn);
    setNameBn(c.nameBn ?? "");
    setProductIds(Array.isArray(c.productIds) ? c.productIds : []);
    setProductIdInput("");
    setSortOrder(c.sortOrder);
    setIsActive(c.isActive);
    setModalOpen(true);
  };

  const addProductId = () => {
    const id = productIdInput.trim();
    if (id && !productIds.includes(id)) {
      setProductIds([...productIds, id]);
      setProductIdInput("");
    }
  };

  const removeProductId = (id: string) => {
    setProductIds(productIds.filter((p) => p !== id));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!nameEn.trim() || !slug.trim()) return;
    setSaving(true);
    try {
      if (editing) {
        const res = await fetch(`/api/admin/collections/${editing.id}`, {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            nameEn: nameEn.trim(),
            nameBn: nameBn.trim() || undefined,
            productIds,
            sortOrder,
            isActive,
          }),
        });
        if (res.ok) {
          setModalOpen(false);
          fetchCollections();
        } else {
          const d = await res.json();
          alert(d.error ?? "Failed to update");
        }
      } else {
        const res = await fetch("/api/admin/collections", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            slug: slug.trim(),
            nameEn: nameEn.trim(),
            nameBn: nameBn.trim() || undefined,
            productIds,
            sortOrder,
            isActive,
          }),
        });
        if (res.ok) {
          setModalOpen(false);
          fetchCollections();
        } else {
          const d = await res.json();
          alert(d.error ?? "Failed to create");
        }
      }
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Delete this collection?")) return;
    const res = await fetch(`/api/admin/collections/${id}`, { method: "DELETE" });
    if (res.ok) fetchCollections();
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
        <h1 className="text-2xl font-bold text-slate-900">Product Catalogs</h1>
        <button
          onClick={openCreate}
          className="flex items-center gap-2 rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700"
        >
          <Plus className="h-4 w-4" />
          Add Collection
        </button>
      </div>
      <p className="text-slate-600">
        Product collections (catalogs) for display on the storefront.
      </p>

      <div className="rounded-xl border border-slate-200 bg-white shadow-sm overflow-hidden">
        {collections.length === 0 ? (
          <div className="p-12 text-center text-slate-500">
            No collections yet. Create one to get started.
          </div>
        ) : (
          <table className="w-full text-left text-sm">
            <thead className="border-b border-slate-200 bg-slate-50">
              <tr>
                <th className="p-4 font-medium text-slate-700">Name</th>
                <th className="p-4 font-medium text-slate-700">Slug</th>
                <th className="p-4 font-medium text-slate-700">Products</th>
                <th className="p-4 font-medium text-slate-700">Status</th>
                <th className="p-4 font-medium text-slate-700">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {collections.map((c) => (
                <tr key={c.id} className="hover:bg-slate-50">
                  <td className="p-4 font-medium text-slate-900">{c.nameEn}</td>
                  <td className="p-4 text-slate-600">{c.slug}</td>
                  <td className="p-4 text-slate-600">
                    {Array.isArray(c.productIds) ? c.productIds.length : 0} products
                  </td>
                  <td className="p-4">
                    <span
                      className={`rounded-full px-2 py-0.5 text-xs font-medium ${
                        c.isActive ? "bg-green-100 text-green-700" : "bg-slate-100 text-slate-600"
                      }`}
                    >
                      {c.isActive ? "Active" : "Inactive"}
                    </span>
                  </td>
                  <td className="p-4">
                    <div className="flex gap-2">
                      <button
                        onClick={() => openEdit(c)}
                        className="rounded p-2 text-slate-600 hover:bg-slate-100 hover:text-blue-600"
                      >
                        <Pencil className="h-4 w-4" />
                      </button>
                      <button
                        onClick={() => handleDelete(c.id)}
                        className="rounded p-2 text-slate-600 hover:bg-slate-100 hover:text-red-600"
                      >
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
              {editing ? "Edit Collection" : "New Collection"}
            </h2>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Name (EN) *</label>
                <input
                  type="text"
                  value={nameEn}
                  onChange={(e) => setNameEn(e.target.value)}
                  required
                  className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Slug *</label>
                <input
                  type="text"
                  value={slug}
                  onChange={(e) => setSlug(e.target.value.toLowerCase().replace(/\s+/g, "-"))}
                  required
                  disabled={!!editing}
                  className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm disabled:bg-slate-100"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Product IDs</label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={productIdInput}
                    onChange={(e) => setProductIdInput(e.target.value)}
                    onKeyDown={(e) => e.key === "Enter" && (e.preventDefault(), addProductId())}
                    placeholder="Product UUID"
                    className="flex-1 rounded-lg border border-slate-200 px-3 py-2 text-sm"
                  />
                  <button type="button" onClick={addProductId} className="rounded-lg border border-slate-200 px-3 py-2 text-sm">
                    Add
                  </button>
                </div>
                {productIds.length > 0 && (
                  <div className="mt-2 flex flex-wrap gap-2">
                    {productIds.map((id) => (
                      <span
                        key={id}
                        className="flex items-center gap-1 rounded bg-slate-100 px-2 py-1 text-xs"
                      >
                        {id.slice(0, 8)}…
                        <button type="button" onClick={() => removeProductId(id)} className="text-red-600 hover:underline">
                          ×
                        </button>
                      </span>
                    ))}
                  </div>
                )}
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
                <input
                  type="checkbox"
                  id="isActive"
                  checked={isActive}
                  onChange={(e) => setIsActive(e.target.checked)}
                />
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
