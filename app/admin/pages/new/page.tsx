"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Loader2 } from "lucide-react";

export default function NewCmsPagePage() {
  const router = useRouter();
  const [slug, setSlug] = useState("");
  const [titleEn, setTitleEn] = useState("");
  const [contentEn, setContentEn] = useState("");
  const [template, setTemplate] = useState("page");
  const [isPublished, setIsPublished] = useState(false);
  const [saving, setSaving] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!slug.trim() || !titleEn.trim()) return;
    setSaving(true);
    try {
      const res = await fetch("/api/admin/cms-pages", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          slug: slug.trim().toLowerCase().replace(/\s+/g, "-"),
          titleEn: titleEn.trim(),
          contentEn: contentEn.trim() || undefined,
          template,
          isPublished,
        }),
      });
      const data = await res.json();
      if (res.ok) {
        router.push(`/admin/pages/${data.id}/edit`);
      } else {
        alert(data.error ?? "Failed to create");
      }
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-slate-900">New Page</h1>
      <form onSubmit={handleSubmit} className="max-w-2xl space-y-4">
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1">Title *</label>
          <input
            type="text"
            value={titleEn}
            onChange={(e) => {
              setTitleEn(e.target.value);
              if (!slug) setSlug(e.target.value.toLowerCase().replace(/\s+/g, "-"));
            }}
            required
            className="w-full rounded-lg border border-slate-200 px-3 py-2"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1">Slug *</label>
          <input
            type="text"
            value={slug}
            onChange={(e) => setSlug(e.target.value)}
            required
            className="w-full rounded-lg border border-slate-200 px-3 py-2 font-mono"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1">Template</label>
          <select
            value={template}
            onChange={(e) => setTemplate(e.target.value)}
            className="w-full rounded-lg border border-slate-200 px-3 py-2"
          >
            <option value="page">Page</option>
            <option value="blog">Blog</option>
          </select>
        </div>
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1">Content</label>
          <textarea
            value={contentEn}
            onChange={(e) => setContentEn(e.target.value)}
            rows={8}
            className="w-full rounded-lg border border-slate-200 px-3 py-2"
          />
        </div>
        <div className="flex items-center gap-2">
          <input type="checkbox" id="pub" checked={isPublished} onChange={(e) => setIsPublished(e.target.checked)} />
          <label htmlFor="pub">Published</label>
        </div>
        <div className="flex gap-2">
          <button type="submit" disabled={saving} className="flex items-center gap-2 rounded-lg bg-blue-600 px-4 py-2 text-white disabled:opacity-50">
            {saving && <Loader2 className="h-4 w-4 animate-spin" />}
            Create
          </button>
          <Link href="/admin/pages" className="rounded-lg border border-slate-200 px-4 py-2 text-slate-700 hover:bg-slate-50">
            Cancel
          </Link>
        </div>
      </form>
    </div>
  );
}
