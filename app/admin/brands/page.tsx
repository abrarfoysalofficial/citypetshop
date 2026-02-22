"use client";

import { useState, useEffect, useCallback } from "react";
import { Loader2, Plus, Pencil, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";

type Brand = {
  id: string;
  name: string;
  slug: string;
  description?: string | null;
  logoUrl?: string | null;
  isActive: boolean;
  _count?: { products: number };
};

function slugify(s: string): string {
  return s
    .toLowerCase()
    .trim()
    .replace(/\s+/g, "-")
    .replace(/[^a-z0-9-]/g, "");
}

export default function AdminBrandsPage() {
  const [brands, setBrands] = useState<Brand[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editing, setEditing] = useState<Brand | null>(null);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [form, setForm] = useState({
    name: "",
    slug: "",
    description: "",
    logoUrl: "",
    isActive: true,
  });

  const fetchBrands = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/admin/brands");
      if (res.status === 401) {
        window.location.href = "/admin/login";
        return;
      }
      if (res.ok) setBrands(await res.json());
    } catch {
      setError("Failed to load brands");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchBrands();
  }, [fetchBrands]);

  const resetForm = () => {
    setForm({
      name: "",
      slug: "",
      description: "",
      logoUrl: "",
      isActive: true,
    });
    setEditing(null);
    setError(null);
  };

  const openCreate = () => {
    resetForm();
    setShowModal(true);
  };

  const openEdit = (b: Brand) => {
    setForm({
      name: b.name,
      slug: b.slug,
      description: b.description ?? "",
      logoUrl: b.logoUrl ?? "",
      isActive: b.isActive,
    });
    setEditing(b);
    setShowModal(true);
  };

  const handleNameChange = (name: string) => {
    setForm((f) => ({
      ...f,
      name,
      slug: editing ? f.slug : slugify(name),
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.name.trim()) {
      setError("Name is required");
      return;
    }
    if (!form.slug.trim()) {
      setError("Slug is required");
      return;
    }

    setSaving(true);
    setError(null);

    try {
      if (editing) {
        const res = await fetch(`/api/admin/brands/${editing.id}`, {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            name: form.name.trim(),
            slug: form.slug.trim().toLowerCase(),
            description: form.description.trim() || null,
            logoUrl: form.logoUrl.trim() || null,
            isActive: form.isActive,
          }),
        });
        const data = await res.json();
        if (!res.ok) {
          setError(data.error ?? "Failed to update");
          return;
        }
      } else {
        const res = await fetch("/api/admin/brands", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            name: form.name.trim(),
            slug: form.slug.trim().toLowerCase(),
            description: form.description.trim() || null,
            logoUrl: form.logoUrl.trim() || null,
            isActive: form.isActive,
          }),
        });
        const data = await res.json();
        if (!res.ok) {
          setError(data.error ?? "Failed to create");
          return;
        }
      }
      setShowModal(false);
      resetForm();
      fetchBrands();
    } catch {
      setError("Request failed");
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (b: Brand) => {
    if (!confirm(`Delete brand "${b.name}"? Products using it must be unassigned first.`)) return;
    try {
      const res = await fetch(`/api/admin/brands/${b.id}`, { method: "DELETE" });
      const data = await res.json();
      if (!res.ok) {
        alert(data.error ?? "Failed to delete");
        return;
      }
      fetchBrands();
    } catch {
      alert("Request failed");
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="h-8 w-8 animate-spin text-slate-400" />
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Brands</h1>
          <p className="mt-1 text-sm text-slate-600">Manage product brands. Used in product catalog.</p>
        </div>
        <Button onClick={openCreate}>
          <Plus className="mr-2 h-4 w-4" />
          Add Brand
        </Button>
      </div>

      <div className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Name</TableHead>
              <TableHead>Slug</TableHead>
              <TableHead>Products</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="w-[100px]">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {brands.length === 0 ? (
              <TableRow>
                <TableCell colSpan={5} className="py-8 text-center text-slate-500">
                  No brands yet. Click &quot;Add Brand&quot; to create one.
                </TableCell>
              </TableRow>
            ) : (
              brands.map((b) => (
                <TableRow key={b.id}>
                  <TableCell className="font-medium">{b.name}</TableCell>
                  <TableCell className="text-slate-600">{b.slug}</TableCell>
                  <TableCell>{b._count?.products ?? 0}</TableCell>
                  <TableCell>
                    <span className={b.isActive ? "text-emerald-600" : "text-slate-400"}>
                      {b.isActive ? "Active" : "Inactive"}
                    </span>
                  </TableCell>
                  <TableCell>
                    <div className="flex gap-2">
                      <Button variant="outline" size="sm" onClick={() => openEdit(b)}>
                        <Pencil className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleDelete(b)}
                        disabled={(b._count?.products ?? 0) > 0}
                        title={(b._count?.products ?? 0) > 0 ? "Unassign products first" : "Delete"}
                      >
                        <Trash2 className="h-4 w-4 text-red-600" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      <Dialog open={showModal} onOpenChange={(o) => { setShowModal(o); if (!o) resetForm(); }}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{editing ? "Edit Brand" : "Add Brand"}</DialogTitle>
            <DialogDescription>
              {editing ? "Update brand details." : "Create a new brand for your catalog."}
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleSubmit} className="space-y-4">
            {error && (
              <div className="rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">
                {error}
              </div>
            )}
            <div>
              <label className="block text-sm font-medium text-slate-700">Name *</label>
              <Input
                value={form.name}
                onChange={(e) => handleNameChange(e.target.value)}
                placeholder="e.g. Royal Canin"
                className="mt-1"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700">Slug *</label>
              <Input
                value={form.slug}
                onChange={(e) => setForm((f) => ({ ...f, slug: e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, "-") }))}
                placeholder="royal-canin"
                className="mt-1"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700">Description</label>
              <Textarea
                value={form.description}
                onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))}
                placeholder="Optional description"
                rows={2}
                className="mt-1"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700">Logo URL</label>
              <Input
                value={form.logoUrl}
                onChange={(e) => setForm((f) => ({ ...f, logoUrl: e.target.value }))}
                placeholder="https://..."
                type="url"
                className="mt-1"
              />
            </div>
            <div className="flex items-center gap-2">
              <input
                type="checkbox"
                id="isActive"
                checked={form.isActive}
                onChange={(e) => setForm((f) => ({ ...f, isActive: e.target.checked }))}
                className="h-4 w-4 rounded border-slate-300"
              />
              <label htmlFor="isActive" className="text-sm font-medium text-slate-700">
                Active
              </label>
            </div>
            <div className="flex justify-end gap-2 pt-2">
              <Button type="button" variant="outline" onClick={() => setShowModal(false)}>
                Cancel
              </Button>
              <Button type="submit" disabled={saving}>
                {saving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                {editing ? "Update" : "Create"}
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
