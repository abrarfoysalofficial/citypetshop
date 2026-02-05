"use client";

import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { useCategories } from "@/context/CategoriesContext";
import { useState, useEffect } from "react";
import type { CategoryItem } from "@/lib/types";

export default function AdminEditCategoryPage() {
  const params = useParams();
  const router = useRouter();
  const slugParam = String(params.slug ?? "");
  const { getCategoryBySlug, updateCategory } = useCategories();
  const existing = getCategoryBySlug(decodeURIComponent(slugParam));

  const [slug, setSlug] = useState("");
  const [name, setName] = useState("");
  const [subcategories, setSubcategories] = useState("");

  useEffect(() => {
    if (existing) {
      setSlug(existing.slug);
      setName(existing.name);
      setSubcategories(existing.subcategories?.join(", ") ?? "");
    }
  }, [existing]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const slugTrim = slug.trim().toLowerCase().replace(/\s+/g, "-");
    const nameTrim = name.trim();
    if (!slugTrim || !nameTrim) return;
    const item: CategoryItem = {
      slug: slugTrim,
      name: nameTrim,
      subcategories: subcategories
        .split(",")
        .map((s) => s.trim())
        .filter(Boolean),
    };
    updateCategory(slugParam, item);
    router.push("/admin/categories");
  };

  if (!existing) {
    return (
      <div>
        <Link href="/admin/categories" className="text-sm text-primary hover:underline">
          ← Back to Categories
        </Link>
        <p className="mt-4 text-slate-600">Category not found.</p>
      </div>
    );
  }

  return (
    <div className="max-w-xl space-y-6">
      <div>
        <Link href="/admin/categories" className="text-sm text-primary hover:underline">
          ← Back to Categories
        </Link>
        <h1 className="mt-2 text-2xl font-bold text-slate-900">Edit Category</h1>
      </div>

      <form onSubmit={handleSubmit} className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-slate-700">Slug (URL)</label>
            <input
              type="text"
              value={slug}
              onChange={(e) => setSlug(e.target.value)}
              className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700">Name</label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700">Subcategories (comma-separated)</label>
            <input
              type="text"
              value={subcategories}
              onChange={(e) => setSubcategories(e.target.value)}
              className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2"
            />
          </div>
        </div>
        <div className="mt-6 flex gap-3">
          <button
            type="submit"
            className="rounded-lg bg-primary px-4 py-2 text-sm font-medium text-white hover:bg-primary/90"
          >
            Update Category
          </button>
          <Link
            href="/admin/categories"
            className="rounded-lg border border-slate-300 px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50"
          >
            Cancel
          </Link>
        </div>
      </form>
    </div>
  );
}
