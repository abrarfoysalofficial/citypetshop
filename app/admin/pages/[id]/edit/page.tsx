"use client";

import { useState, useEffect } from "react";
import { useRouter, useParams } from "next/navigation";
import Link from "next/link";
import { Loader2 } from "lucide-react";

export default function EditCmsPagePage() {
  const router = useRouter();
  const params = useParams();
  const id = params.id as string;
  const [page, setPage] = useState<{
    titleEn: string;
    titleBn?: string;
    contentEn?: string;
    excerptEn?: string;
    template?: string;
    isPublished: boolean;
    seoTitle?: string;
    seoDescription?: string;
  } | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    fetch(`/api/admin/cms-pages/${id}`)
      .then((r) => {
        if (r.status === 401) {
          window.location.href = "/admin/login";
          return null;
        }
        return r.json();
      })
      .then((d) => {
        if (d) setPage(d);
      })
      .finally(() => setLoading(false));
  }, [id]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!page) return;
    setSaving(true);
    try {
      const res = await fetch(`/api/admin/cms-pages/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(page),
      });
      if (res.ok) {
        router.refresh();
      } else {
        const d = await res.json();
        alert(d.error ?? "Failed to save");
      }
    } finally {
      setSaving(false);
    }
  };

  if (loading || !page) {
    return (
      <div className="flex h-64 items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-slate-900">Edit Page</h1>
        <Link href="/admin/pages" className="text-sm text-blue-600 hover:underline">← Back</Link>
      </div>
      <form onSubmit={handleSubmit} className="max-w-2xl space-y-4">
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1">Title *</label>
          <input
            type="text"
            value={page.titleEn}
            onChange={(e) => setPage({ ...page, titleEn: e.target.value })}
            required
            className="w-full rounded-lg border border-slate-200 px-3 py-2"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1">Content</label>
          <textarea
            value={page.contentEn ?? ""}
            onChange={(e) => setPage({ ...page, contentEn: e.target.value })}
            rows={12}
            className="w-full rounded-lg border border-slate-200 px-3 py-2"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1">Excerpt</label>
          <textarea
            value={page.excerptEn ?? ""}
            onChange={(e) => setPage({ ...page, excerptEn: e.target.value })}
            rows={2}
            className="w-full rounded-lg border border-slate-200 px-3 py-2"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1">SEO Title</label>
          <input
            type="text"
            value={page.seoTitle ?? ""}
            onChange={(e) => setPage({ ...page, seoTitle: e.target.value })}
            className="w-full rounded-lg border border-slate-200 px-3 py-2"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1">SEO Description</label>
          <textarea
            value={page.seoDescription ?? ""}
            onChange={(e) => setPage({ ...page, seoDescription: e.target.value })}
            rows={2}
            className="w-full rounded-lg border border-slate-200 px-3 py-2"
          />
        </div>
        <div className="flex items-center gap-2">
          <input
            type="checkbox"
            id="pub"
            checked={page.isPublished}
            onChange={(e) => setPage({ ...page, isPublished: e.target.checked })}
          />
          <label htmlFor="pub">Published</label>
        </div>
        <div className="flex gap-2">
          <button type="submit" disabled={saving} className="flex items-center gap-2 rounded-lg bg-blue-600 px-4 py-2 text-white disabled:opacity-50">
            {saving && <Loader2 className="h-4 w-4 animate-spin" />}
            Save
          </button>
          <Link href="/admin/pages" className="rounded-lg border border-slate-200 px-4 py-2 text-slate-700 hover:bg-slate-50">
            Cancel
          </Link>
        </div>
      </form>
    </div>
  );
}
