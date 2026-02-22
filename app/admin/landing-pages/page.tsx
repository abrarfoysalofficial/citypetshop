"use client";

import { useState, useEffect, useCallback } from "react";
import Link from "next/link";

type LandingPage = {
  id: string;
  slug: string;
  title: string;
  isPublished: boolean;
  updatedAt: string;
};

export default function AdminLandingPagesPage() {
  const [pages, setPages] = useState<LandingPage[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchData = useCallback(() => {
    fetch("/api/admin/landing-pages")
      .then((r) => {
        if (r.status === 401) {
          window.location.href = "/admin/login";
          return null;
        }
        return r.json();
      })
      .then((d) => {
        if (d?.pages) setPages(d.pages);
      })
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const handleCreate = () => {
    const title = prompt("Page title?");
    if (!title) return;
    fetch("/api/admin/landing-pages", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ title, slug: title.toLowerCase().replace(/\s+/g, "-") }),
    })
      .then((r) => r.json())
      .then((d) => {
        if (d.page) window.location.href = `/admin/landing-pages/${d.page.id}`;
      });
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
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Landing Pages</h1>
          <p className="text-slate-600">
            Build and manage landing pages with blocks.
          </p>
        </div>
        <button
          onClick={handleCreate}
          className="rounded-lg bg-primary px-4 py-2 text-sm font-medium text-white hover:bg-primary/90"
        >
          Create page
        </button>
      </div>

      {pages.length === 0 ? (
        <div className="rounded-xl border border-slate-200 bg-slate-50 p-12 text-center">
          <p className="text-slate-600">No landing pages yet.</p>
          <button
            onClick={handleCreate}
            className="mt-4 rounded-lg bg-primary px-4 py-2 text-sm font-medium text-white hover:bg-primary/90"
          >
            Create first page
          </button>
        </div>
      ) : (
        <div className="rounded-xl border border-slate-200 bg-white shadow-sm">
          <table className="w-full text-left text-sm">
            <thead className="border-b border-slate-200 bg-slate-50">
              <tr>
                <th className="p-4 font-medium text-slate-900">Title</th>
                <th className="p-4 font-medium text-slate-900">Slug</th>
                <th className="p-4 font-medium text-slate-900">Status</th>
                <th className="p-4 font-medium text-slate-900">Updated</th>
                <th className="p-4 font-medium text-slate-900">Actions</th>
              </tr>
            </thead>
            <tbody>
              {pages.map((p) => (
                <tr key={p.id} className="border-b border-slate-100">
                  <td className="p-4 font-medium text-slate-900">{p.title}</td>
                  <td className="p-4 font-mono text-slate-600">{p.slug}</td>
                  <td className="p-4">
                    <span className={`inline-flex rounded-full px-2 py-1 text-xs font-medium ${p.isPublished ? "bg-green-100 text-green-700" : "bg-slate-100 text-slate-600"}`}>
                      {p.isPublished ? "Published" : "Draft"}
                    </span>
                  </td>
                  <td className="p-4 text-slate-500">{new Date(p.updatedAt).toLocaleString()}</td>
                  <td className="p-4">
                    <Link href={`/admin/landing-pages/${p.id}`} className="text-primary hover:underline">
                      Edit
                    </Link>
                    {p.isPublished && (
                      <>
                        {" | "}
                        <a href={`/landing/${p.slug}`} target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">
                          View
                        </a>
                      </>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
