"use client";

import Link from "next/link";
import { useBlog } from "@/context/BlogContext";
import { Plus, Pencil, Trash2 } from "lucide-react";

export default function AdminBlogPage() {
  const { posts, deletePost, lastUpdated } = useBlog();

  const handleDelete = (slug: string) => {
    if (!confirm("Delete this blog post?")) return;
    deletePost(slug);
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Blog</h1>
          <p className="mt-1 text-slate-600">
            Manage blog posts. Last updated:{" "}
            {lastUpdated ? new Date(lastUpdated).toLocaleString() : "—"}
          </p>
        </div>
        <Link
          href="/admin/blog/new"
          className="inline-flex items-center gap-2 rounded-lg bg-primary px-4 py-2 text-sm font-medium text-white hover:bg-primary/90"
        >
          <Plus className="h-4 w-4" />
          New Post
        </Link>
      </div>

      <div className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
        <table className="w-full text-left text-sm">
          <thead className="border-b border-slate-200 bg-slate-50">
            <tr>
              <th className="p-3 font-medium text-slate-900">Title</th>
              <th className="p-3 font-medium text-slate-900">Slug</th>
              <th className="p-3 font-medium text-slate-900">Date</th>
              <th className="p-3 font-medium text-slate-900">Actions</th>
            </tr>
          </thead>
          <tbody>
            {posts.map((p) => (
              <tr key={p.slug} className="border-b border-slate-100">
                <td className="p-3 font-medium text-slate-900">{p.title}</td>
                <td className="p-3 font-mono text-slate-600">{p.slug}</td>
                <td className="p-3 text-slate-600">{p.date}</td>
                <td className="p-3">
                  <div className="flex items-center gap-2">
                    <Link
                      href={`/blog/${p.slug}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-sm text-primary hover:underline"
                    >
                      View
                    </Link>
                    <Link
                      href={`/admin/blog/${encodeURIComponent(p.slug)}/edit`}
                      className="rounded p-2 text-slate-600 hover:bg-slate-100"
                      aria-label="Edit"
                    >
                      <Pencil className="h-4 w-4" />
                    </Link>
                    <button
                      type="button"
                      onClick={() => handleDelete(p.slug)}
                      className="rounded p-2 text-red-600 hover:bg-red-50"
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
