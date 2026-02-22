"use client";

import { useState, useEffect, useCallback } from "react";
import { useParams, useRouter } from "next/navigation";

type ProductData = {
  id: string;
  nameEn: string;
  nameBn?: string | null;
  slug: string;
  descriptionEn?: string | null;
  descriptionBn?: string | null;
  sellingPrice: number;
  buyingPrice: number;
  stock: number;
  lowStockThreshold?: number | null;
  sku?: string | null;
  categorySlug: string;
  isFeatured: boolean;
  isActive: boolean;
  seoTitle?: string | null;
  seoDescription?: string | null;
  metaOgImage?: string | null;
};

export default function ProductEditPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const [product, setProduct] = useState<ProductData | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [msg, setMsg] = useState<{ ok: boolean; text: string } | null>(null);

  const fetchProduct = useCallback(() => {
    if (!id) return;
    setLoading(true);
    fetch(`/api/admin/products?id=${id}`)
      .then((r) => {
        if (r.status === 401) { router.push("/admin/login"); return null; }
        return r.json();
      })
      .then((d) => {
        if (d) {
          // Normalize: API may return array or single product
          const p = Array.isArray(d) ? d.find((x: ProductData) => x.id === id) : (d.product ?? d);
          setProduct(p ?? null);
        }
      })
      .finally(() => setLoading(false));
  }, [id, router]);

  useEffect(() => { fetchProduct(); }, [fetchProduct]);

  const handleChange = (field: keyof ProductData, value: unknown) => {
    setProduct((prev) => prev ? { ...prev, [field]: value } : prev);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!product) return;
    setSaving(true);
    setMsg(null);
    const res = await fetch(`/api/admin/products`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(product),
    });
    const data = await res.json().catch(() => ({}));
    if (res.ok) {
      setMsg({ ok: true, text: "Product saved successfully" });
    } else {
      setMsg({ ok: false, text: data.error ?? "Save failed" });
    }
    setSaving(false);
  };

  if (loading) {
    return (
      <div className="flex h-64 items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-blue-600 border-t-transparent" />
      </div>
    );
  }

  if (!product) {
    return <div className="rounded-xl border p-8 text-center text-slate-400">Product not found.</div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <h1 className="text-2xl font-bold text-slate-900">Edit Product</h1>
        <button onClick={() => router.back()} className="text-primary hover:underline">← Back</button>
      </div>

      {msg && (
        <div className={`rounded-lg px-4 py-3 text-sm ${msg.ok ? "bg-green-50 text-green-800" : "bg-red-50 text-red-800"}`}>
          {msg.text}
        </div>
      )}

      <form onSubmit={handleSave} className="space-y-6">
        {/* Basic Info */}
        <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
          <h2 className="mb-4 text-lg font-semibold">Basic Information</h2>
          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label className="mb-1 block text-sm font-medium text-slate-700">Name (English) *</label>
              <input
                required
                value={product.nameEn}
                onChange={(e) => handleChange("nameEn", e.target.value)}
                className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="mb-1 block text-sm font-medium text-slate-700">Name (Bangla)</label>
              <input
                value={product.nameBn ?? ""}
                onChange={(e) => handleChange("nameBn", e.target.value || null)}
                className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm"
              />
            </div>
            <div>
              <label className="mb-1 block text-sm font-medium text-slate-700">Slug *</label>
              <input
                required
                value={product.slug}
                onChange={(e) => handleChange("slug", e.target.value)}
                className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm font-mono"
              />
            </div>
            <div>
              <label className="mb-1 block text-sm font-medium text-slate-700">SKU</label>
              <input
                value={product.sku ?? ""}
                onChange={(e) => handleChange("sku", e.target.value || null)}
                className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm"
              />
            </div>
          </div>
          <div className="mt-4">
            <label className="mb-1 block text-sm font-medium text-slate-700">Description (English)</label>
            <textarea
              rows={4}
              value={product.descriptionEn ?? ""}
              onChange={(e) => handleChange("descriptionEn", e.target.value || null)}
              className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm"
            />
          </div>
        </div>

        {/* Pricing + Stock */}
        <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
          <h2 className="mb-4 text-lg font-semibold">Pricing & Stock</h2>
          <div className="grid gap-4 sm:grid-cols-4">
            <div>
              <label className="mb-1 block text-sm font-medium text-slate-700">Selling Price (৳) *</label>
              <input
                type="number"
                required
                min={0}
                step="0.01"
                value={product.sellingPrice}
                onChange={(e) => handleChange("sellingPrice", parseFloat(e.target.value) || 0)}
                className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm"
              />
            </div>
            <div>
              <label className="mb-1 block text-sm font-medium text-slate-700">Buying Price (৳)</label>
              <input
                type="number"
                min={0}
                step="0.01"
                value={product.buyingPrice}
                onChange={(e) => handleChange("buyingPrice", parseFloat(e.target.value) || 0)}
                className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm"
              />
            </div>
            <div>
              <label className="mb-1 block text-sm font-medium text-slate-700">Stock Qty</label>
              <input
                type="number"
                min={0}
                value={product.stock}
                onChange={(e) => handleChange("stock", parseInt(e.target.value, 10) || 0)}
                className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm"
              />
            </div>
            <div>
              <label className="mb-1 block text-sm font-medium text-slate-700">Low Stock Alert</label>
              <input
                type="number"
                min={0}
                placeholder="e.g. 5"
                value={product.lowStockThreshold ?? ""}
                onChange={(e) => handleChange("lowStockThreshold", e.target.value ? parseInt(e.target.value, 10) : null)}
                className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm"
              />
            </div>
          </div>
        </div>

        {/* Visibility */}
        <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
          <h2 className="mb-4 text-lg font-semibold">Visibility</h2>
          <div className="flex gap-6">
            <label className="flex items-center gap-2 text-sm">
              <input
                type="checkbox"
                checked={product.isActive}
                onChange={(e) => handleChange("isActive", e.target.checked)}
                className="rounded"
              />
              Active (visible in store)
            </label>
            <label className="flex items-center gap-2 text-sm">
              <input
                type="checkbox"
                checked={product.isFeatured}
                onChange={(e) => handleChange("isFeatured", e.target.checked)}
                className="rounded"
              />
              Featured
            </label>
          </div>
        </div>

        {/* SEO */}
        <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
          <h2 className="mb-4 text-lg font-semibold">SEO</h2>
          <div className="space-y-3">
            <div>
              <label className="mb-1 block text-sm font-medium text-slate-700">SEO Title</label>
              <input
                value={product.seoTitle ?? ""}
                onChange={(e) => handleChange("seoTitle", e.target.value || null)}
                className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm"
              />
            </div>
            <div>
              <label className="mb-1 block text-sm font-medium text-slate-700">SEO Description</label>
              <textarea
                rows={2}
                value={product.seoDescription ?? ""}
                onChange={(e) => handleChange("seoDescription", e.target.value || null)}
                className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm"
              />
            </div>
            <div>
              <label className="mb-1 block text-sm font-medium text-slate-700">OG Image URL</label>
              <input
                value={product.metaOgImage ?? ""}
                onChange={(e) => handleChange("metaOgImage", e.target.value || null)}
                className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm font-mono text-xs"
              />
            </div>
          </div>
        </div>

        <div className="flex justify-end gap-3">
          <button
            type="button"
            onClick={() => router.back()}
            className="rounded-lg border border-slate-300 px-5 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={saving}
            className="rounded-lg bg-blue-600 px-5 py-2 text-sm font-medium text-white hover:bg-blue-700 disabled:opacity-50"
          >
            {saving ? "Saving…" : "Save Changes"}
          </button>
        </div>
      </form>
    </div>
  );
}
