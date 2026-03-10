"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useCategories } from "@store/CategoriesContext";
import { Loader2 } from "lucide-react";

export default function AdminNewCategoryPage() {
  const router = useRouter();
  const { refetch } = useCategories();
  const [slug, setSlug] = useState("");
  const [name, setName] = useState("");
  const [subcategories, setSubcategories] = useState("");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const slugTrim = slug.trim().toLowerCase().replace(/\s+/g, "-");
    const nameTrim = name.trim();
    if (!slugTrim || !nameTrim) return;

    setSaving(true);
    setError(null);
    try {
      const res = await fetch("/api/admin/categories", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          slug: slugTrim,
          nameEn: nameTrim,
          nameBn: null,
          isActive: true,
        }),
      });
      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "Failed to create category");
      }
      await refetch();
      if (typeof window !== "undefined") window.dispatchEvent(new CustomEvent("categories-updated"));
      router.push("/admin/categories");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to create category");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="max-w-xl space-y-6">
      <div>
        <Link href="/admin/categories" className="text-sm text-primary hover:underline">
          ← Back to Categories
        </Link>
        <h1 className="mt-2 text-2xl font-bold text-slate-900">Add Category</h1>
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
              placeholder="e.g. dog-food"
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
              placeholder="e.g. Dog Food"
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
              placeholder="Dry Food, Wet Food, Treats"
            />
          </div>
        </div>
        {error && <p className="mt-4 text-sm text-red-600">{error}</p>}
        <div className="mt-6 flex gap-3">
          <button
            type="submit"
            disabled={saving}
            className="inline-flex items-center rounded-lg bg-primary px-4 py-2 text-sm font-medium text-white hover:bg-primary/90 disabled:opacity-70"
          >
            {saving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            Save Category
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
