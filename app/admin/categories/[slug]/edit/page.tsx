"use client";

import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { useCategories } from "@/store/CategoriesContext";
import { useState, useEffect } from "react";
import { Loader2 } from "lucide-react";

type CategoryRow = { id: string; slug: string; nameEn: string; nameBn?: string | null };

export default function AdminEditCategoryPage() {
  const params = useParams();
  const router = useRouter();
  const slugParam = decodeURIComponent(String(params.slug ?? ""));
  const { refetch } = useCategories();

  const [category, setCategory] = useState<CategoryRow | null>(null);
  const [loading, setLoading] = useState(true);
  const [slug, setSlug] = useState("");
  const [name, setName] = useState("");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetch("/api/admin/categories")
      .then((r) => (r.ok ? r.json() : []))
      .then((data: CategoryRow[]) => {
        const found = data.find((c) => c.slug === slugParam);
        setCategory(found ?? null);
        if (found) {
          setSlug(found.slug);
          setName(found.nameEn);
        }
      })
      .catch(() => setCategory(null))
      .finally(() => setLoading(false));
  }, [slugParam]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!category) return;
    const slugTrim = slug.trim().toLowerCase().replace(/\s+/g, "-");
    const nameTrim = name.trim();
    if (!slugTrim || !nameTrim) return;

    setSaving(true);
    setError(null);
    try {
      const res = await fetch("/api/admin/categories", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          id: category.id,
          slug: slugTrim,
          nameEn: nameTrim,
        }),
      });
      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "Failed to update category");
      }
      await refetch();
      if (typeof window !== "undefined") window.dispatchEvent(new CustomEvent("categories-updated"));
      router.push("/admin/categories");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to update category");
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex h-48 items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-slate-400" />
      </div>
    );
  }

  if (!category) {
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
        </div>
        {error && <p className="mt-4 text-sm text-red-600">{error}</p>}
        <div className="mt-6 flex gap-3">
          <button
            type="submit"
            disabled={saving}
            className="inline-flex items-center rounded-lg bg-primary px-4 py-2 text-sm font-medium text-white hover:bg-primary/90 disabled:opacity-70"
          >
            {saving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
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
