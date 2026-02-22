"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { Plus, Pencil, Trash2, Loader2 } from "lucide-react";

type CmsPage = {
  id: string;
  slug: string;
  titleEn: string;
  template?: string | null;
  isPublished: boolean;
  updatedAt: string;
};

export default function AdminCmsPagesPage() {
  const [pages, setPages] = useState<CmsPage[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/admin/cms-pages")
      .then((r) => {
        if (r.status === 401) {
          window.location.href = "/admin/login";
          return null;
        }
        return r.json();
      })
      .then((d) => {
        if (Array.isArray(d)) setPages(d);
      })
      .finally(() => setLoading(false));
  }, []);

  const handleDelete = async (id: string) => {
    if (!confirm("Delete this page?")) return;
    const res = await fetch(`/api/admin/cms-pages/${id}`, { method: "DELETE" });
    if (res.ok) setPages((p) => p.filter((x) => x.id !== id));
  };

  if (loading) {
    return (
      <div className="flex h-64 items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-slate-900">Site Pages</h1>
        <Link
          href="/admin/pages/new"
          className="flex items-center gap-2 rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700"
        >
          <Plus className="h-4 w-4" />
          New Page
        </Link>
      </div>
      <p className="text-slate-600">
        Manage About, Contact, Privacy, Terms and other static pages.
      </p>

      <div className="rounded-xl border border-slate-200 bg-white shadow-sm overflow-hidden">
        {pages.length === 0 ? (
          <div className="p-12 text-center text-slate-500">No pages yet.</div>
        ) : (
          <table className="w-full text-left text-sm">
            <thead className="border-b border-slate-200 bg-slate-50">
              <tr>
                <th className="p-4 font-medium text-slate-700">Title</th>
                <th className="p-4 font-medium text-slate-700">Slug</th>
                <th className="p-4 font-medium text-slate-700">Template</th>
                <th className="p-4 font-medium text-slate-700">Status</th>
                <th className="p-4 font-medium text-slate-700">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {pages.map((p) => (
                <tr key={p.id} className="hover:bg-slate-50">
                  <td className="p-4 font-medium">{p.titleEn}</td>
                  <td className="p-4 font-mono text-slate-600">{p.slug}</td>
                  <td className="p-4 text-slate-600">{p.template ?? "page"}</td>
                  <td className="p-4">
                    <span
                      className={`rounded-full px-2 py-0.5 text-xs font-medium ${
                        p.isPublished ? "bg-green-100 text-green-700" : "bg-slate-100 text-slate-600"
                      }`}
                    >
                      {p.isPublished ? "Published" : "Draft"}
                    </span>
                  </td>
                  <td className="p-4">
                    <div className="flex gap-2">
                      <Link
                        href={`/admin/pages/${p.id}/edit`}
                        className="rounded p-2 text-slate-600 hover:bg-slate-100 hover:text-blue-600"
                      >
                        <Pencil className="h-4 w-4" />
                      </Link>
                      <button
                        onClick={() => handleDelete(p.id)}
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
    </div>
  );
}
