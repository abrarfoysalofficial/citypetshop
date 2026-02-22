"use client";

import { useState, useEffect, useCallback } from "react";
import { Plus, Pencil, Trash2, Loader2 } from "lucide-react";

type BlogCategory = {
  id: string;
  slug: string;
  nameEn: string;
  nameBn?: string | null;
  sortOrder: number;
  isActive: boolean;
  _count?: { posts: number };
};

export default function AdminBlogCategoriesPage() {
  const [categories, setCategories] = useState<BlogCategory[]>([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState<BlogCategory | null>(null);
  const [slug, setSlug] = useState("");
  const [nameEn, setNameEn] = useState("");
  const [nameBn, setNameBn] = useState("");
  const [sortOrder, setSortOrder] = useState(0);
  const [isActive, setIsActive] = useState(true);
  const [saving, setSaving] = useState(false);

  const fetchCategories = useCallback(() => {
    fetch("/api/admin/blog-categories")
      .then((r) => {
        if (r.status === 401) {
          window.location.href = "/admin/login";
          return null;
        }
        return r.json();
      })
      .then((d) => {
        if (Array.isArray(d)) setCategories(d);
      })
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    fetchCategories();
  }, [fetchCategories]);

  const openCreate = () => {
    setEditing(null);
    setSlug("");
    setNameEn("");
    setNameBn("");
    setSortOrder(0);
    setIsActive(true);
    setModalOpen(true);
  };

  const openEdit = (c: BlogCategory) => {
    setEditing(c);
    setSlug(c.slug);
    setNameEn(c.nameEn);
    setNameBn(c.nameBn ?? "");
    setSortOrder(c.sortOrder);
    setIsActive(c.isActive);
    setModalOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!slug.trim() || !nameEn.trim()) return;
    setSaving(true);
    try {
      if (editing) {
        const res = await fetch(`/api/admin/blog-categories/${editing.id}`, {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ nameEn: nameEn.trim(), nameBn: nameBn.trim() || undefined, sortOrder, isActive }),
        });
        if (res.ok) {
          setModalOpen(false);
          fetchCategories();
        } else {
          const d = await res.json();
          alert(d.error ?? "Failed");
        }
      } else {
        const res = await fetch("/api/admin/blog-categories", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            slug: slug.trim().toLowerCase().replace(/\s+/g, "-"),
            nameEn: nameEn.trim(),
            nameBn: nameBn.trim() || undefined,
            sortOrder,
            isActive,
          }),
        });
        if (res.ok) {
          setModalOpen(false);
          fetchCategories();
        } else {
          const d = await res.json();
          alert(d.error ?? "Failed");
        }
      }
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Delete this category?")) return;
    const res = await fetch(`/api/admin/blog-categories/${id}`, { method: "DELETE" });
    if (res.ok) fetchCategories();
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
        <h1 className="text-2xl font-bold text-slate-900">Blog Categories</h1>
        <button
          onClick={openCreate}
          className="flex items-center gap-2 rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700"
        >
          <Plus className="h-4 w-4" />
          Add Category
        </button>
      </div>
      <p className="text-slate-600">Organize blog posts by category.</p>

      <div className="rounded-xl border border-slate-200 bg-white shadow-sm overflow-hidden">
        {categories.length === 0 ? (
          <div className="p-12 text-center text-slate-500">No categories yet.</div>
        ) : (
          <table className="w-full text-left text-sm">
            <thead className="border-b border-slate-200 bg-slate-50">
              <tr>
                <th className="p-4 font-medium text-slate-700">Name</th>
                <th className="p-4 font-medium text-slate-700">Slug</th>
                <th className="p-4 font-medium text-slate-700">Posts</th>
                <th className="p-4 font-medium text-slate-700">Status</th>
                <th className="p-4 font-medium text-slate-700">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {categories.map((c) => (
                <tr key={c.id} className="hover:bg-slate-50">
                  <td className="p-4 font-medium">{c.nameEn}</td>
                  <td className="p-4 font-mono text-slate-600">{c.slug}</td>
                  <td className="p-4 text-slate-600">{c._count?.posts ?? 0}</td>
                  <td className="p-4">
                    <span
                      className={`rounded-full px-2 py-0.5 text-xs font-medium ${
                        c.isActive ? "bg-green-100 text-green-700" : "bg-slate-100 text-slate-600"
                      }`}
                    >
                      {c.isActive ? "Active" : "Inactive"}
                    </span>
                  </td>
                  <td className="p-4">
                    <div className="flex gap-2">
                      <button onClick={() => openEdit(c)} className="rounded p-2 text-slate-600 hover:bg-slate-100 hover:text-blue-600">
                        <Pencil className="h-4 w-4" />
                      </button>
                      <button onClick={() => handleDelete(c.id)} className="rounded p-2 text-slate-600 hover:bg-slate-100 hover:text-red-600">
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

      {modalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
          <div className="w-full max-w-md rounded-xl bg-white p-6 shadow-xl">
            <h2 className="mb-4 text-lg font-semibold text-slate-900">
              {editing ? "Edit Category" : "New Category"}
            </h2>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Name (EN) *</label>
                <input
                  type="text"
                  value={nameEn}
                  onChange={(e) => {
                    setNameEn(e.target.value);
                    if (!editing) setSlug(e.target.value.toLowerCase().replace(/\s+/g, "-"));
                  }}
                  required
                  className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Slug *</label>
                <input
                  type="text"
                  value={slug}
                  onChange={(e) => setSlug(e.target.value)}
                  required
                  disabled={!!editing}
                  className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm disabled:bg-slate-100"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Sort order</label>
                <input
                  type="number"
                  value={sortOrder}
                  onChange={(e) => setSortOrder(parseInt(e.target.value, 10) || 0)}
                  className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm"
                />
              </div>
              <div className="flex items-center gap-2">
                <input type="checkbox" id="isActive" checked={isActive} onChange={(e) => setIsActive(e.target.checked)} />
                <label htmlFor="isActive" className="text-sm text-slate-700">Active</label>
              </div>
              <div className="flex gap-2 pt-4">
                <button
                  type="submit"
                  disabled={saving}
                  className="flex items-center gap-2 rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700 disabled:opacity-50"
                >
                  {saving && <Loader2 className="h-4 w-4 animate-spin" />}
                  {editing ? "Update" : "Create"}
                </button>
                <button type="button" onClick={() => setModalOpen(false)} className="rounded-lg border border-slate-200 px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50">
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
