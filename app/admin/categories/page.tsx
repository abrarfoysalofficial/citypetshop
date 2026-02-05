"use client";

import Link from "next/link";
import { useCategories } from "@/context/CategoriesContext";
import { Plus, Pencil, Trash2 } from "lucide-react";
import { useState } from "react";
import type { CategoryItem } from "@/lib/types";

export default function AdminCategoriesPage() {
  const { categories, deleteCategory, lastUpdated } = useCategories();
  const [deletingSlug, setDeletingSlug] = useState<string | null>(null);

  const handleDelete = (slug: string) => {
    if (!confirm("Delete this category? Products using it may need reassignment.")) return;
    setDeletingSlug(slug);
    deleteCategory(slug);
    setDeletingSlug(null);
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Categories</h1>
          <p className="mt-1 text-slate-600">
            Add, edit, or delete product categories. Last updated:{" "}
            {lastUpdated ? new Date(lastUpdated).toLocaleString() : "—"}
          </p>
        </div>
        <Link
          href="/admin/categories/new"
          className="inline-flex items-center gap-2 rounded-lg bg-primary px-4 py-2 text-sm font-medium text-white hover:bg-primary/90"
        >
          <Plus className="h-4 w-4" />
          Add Category
        </Link>
      </div>

      <div className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
        <table className="w-full text-left text-sm">
          <thead className="border-b border-slate-200 bg-slate-50">
            <tr>
              <th className="p-3 font-medium text-slate-900">Slug</th>
              <th className="p-3 font-medium text-slate-900">Name</th>
              <th className="p-3 font-medium text-slate-900">Subcategories</th>
              <th className="p-3 font-medium text-slate-900">Actions</th>
            </tr>
          </thead>
          <tbody>
            {categories.map((c) => (
              <tr key={c.slug} className="border-b border-slate-100">
                <td className="p-3 font-mono text-slate-700">{c.slug}</td>
                <td className="p-3 font-medium text-slate-900">{c.name}</td>
                <td className="p-3 text-slate-600">
                  {c.subcategories?.length ? c.subcategories.join(", ") : "—"}
                </td>
                <td className="p-3">
                  <div className="flex items-center gap-2">
                    <Link
                      href={`/admin/categories/${encodeURIComponent(c.slug)}/edit`}
                      className="rounded p-2 text-slate-600 hover:bg-slate-100"
                      aria-label="Edit"
                    >
                      <Pencil className="h-4 w-4" />
                    </Link>
                    <button
                      type="button"
                      onClick={() => handleDelete(c.slug)}
                      disabled={deletingSlug === c.slug}
                      className="rounded p-2 text-red-600 hover:bg-red-50 disabled:opacity-50"
                      aria-label="Delete"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
