"use client";

import Link from "next/link";
import { useProducts } from "@/context/ProductsContext";
import { Upload, Pencil } from "lucide-react";

export default function AdminProductsPage() {
  const { products } = useProducts();

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-slate-900">Products</h1>
        <div className="flex gap-2">
          <Link
            href="/admin/products/new"
            className="inline-flex items-center gap-2 rounded-lg border border-slate-300 px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50"
          >
            <Pencil className="h-4 w-4" />
            New Product
          </Link>
          <Link
            href="/admin/products/bulk"
            className="inline-flex items-center gap-2 rounded-lg bg-primary px-4 py-2 text-sm font-medium text-white hover:bg-primary/90"
          >
            <Upload className="h-4 w-4" />
            Bulk Add (CSV)
          </Link>
        </div>
      </div>
      <p className="text-slate-600">Total: {products.length} products. Edit or add via New Product / Bulk Add.</p>
      <div className="rounded-xl border border-slate-200 bg-white shadow-sm overflow-hidden">
        <table className="w-full text-left text-sm">
          <thead className="border-b border-slate-200 bg-slate-50">
            <tr>
              <th className="p-3 font-medium text-slate-900">Name</th>
              <th className="p-3 font-medium text-slate-900">Price (৳)</th>
              <th className="p-3 font-medium text-slate-900">Category</th>
              <th className="p-3 font-medium text-slate-900">Stock</th>
              <th className="p-3 font-medium text-slate-900">Actions</th>
            </tr>
          </thead>
          <tbody>
            {products.slice(0, 50).map((p) => (
              <tr key={p.id} className="border-b border-slate-100">
                <td className="p-3 font-medium text-slate-900">{p.name}</td>
                <td className="p-3">{p.price}</td>
                <td className="p-3">{p.categorySlug}</td>
                <td className="p-3">{p.inStock !== false ? "Yes" : "No"}</td>
                <td className="p-3">
                  <Link
                    href={`/admin/products/${p.id}/edit`}
                    className="inline-flex items-center gap-1 rounded p-2 text-slate-600 hover:bg-slate-100"
                    aria-label="Edit"
                  >
                    <Pencil className="h-4 w-4" />
                    Edit
                  </Link>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {products.length > 50 && <p className="p-3 text-xs text-slate-500">Showing 50 of {products.length}</p>}
      </div>
    </div>
  );
}
