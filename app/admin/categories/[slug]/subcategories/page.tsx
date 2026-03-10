"use client";

import { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { Loader2, Plus, Pencil, Trash2, ArrowLeft } from "lucide-react";
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
  DialogTrigger,
} from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { PageHero } from "@/components/admin/page-hero";

type Category = {
  id: string;
  slug: string;
  nameEn: string;
  nameBn?: string;
  descriptionEn?: string;
  sortOrder: number;
  isActive: boolean;
  _count?: { products: number };
};

export default function SubcategoriesPage() {
  const params = useParams();
  const slugParam = decodeURIComponent(String(params.slug ?? ""));
  const [parentCategory, setParentCategory] = useState<{ id: string; nameEn: string; slug: string } | null>(null);
  const [subcategories, setSubcategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [editingCategory, setEditingCategory] = useState<Category | null>(null);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    slug: "",
    nameEn: "",
    nameBn: "",
    descriptionEn: "",
    sortOrder: 0,
    isActive: true,
  });

  const fetchParent = useCallback(async () => {
    try {
      const res = await fetch("/api/admin/categories");
      if (res.ok) {
        const all: Category[] = await res.json();
        const parent = all.find((c) => c.slug === slugParam || c.id === slugParam);
        if (parent) setParentCategory({ id: parent.id, nameEn: parent.nameEn, slug: parent.slug });
      }
    } catch {
      setParentCategory(null);
    }
  }, [slugParam]);

  const fetchSubcategories = useCallback(async () => {
    if (!parentCategory) return;
    setLoading(true);
    try {
      const res = await fetch(`/api/admin/categories?parentId=${parentCategory.id}`);
      if (res.status === 401) {
        window.location.href = "/admin/login";
        return;
      }
      if (res.ok) {
        const data = await res.json();
        setSubcategories(Array.isArray(data) ? data : []);
      }
    } catch (err) {
      console.error("Failed to load subcategories:", err);
      setSubcategories([]);
    } finally {
      setLoading(false);
    }
  }, [parentCategory]);

  useEffect(() => {
    fetchParent();
  }, [fetchParent]);

  useEffect(() => {
    if (parentCategory) fetchSubcategories();
    else setLoading(false);
  }, [parentCategory, fetchSubcategories]);

  const resetForm = () => {
    setFormData({
      slug: "",
      nameEn: "",
      nameBn: "",
      descriptionEn: "",
      sortOrder: 0,
      isActive: true,
    });
    setEditingCategory(null);
    setError(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.nameEn || !formData.slug || !parentCategory) {
      setError("Name and slug are required");
      return;
    }

    setSaving(true);
    setError(null);

    try {
      const method = editingCategory ? "PATCH" : "POST";
      const body = editingCategory
        ? { id: editingCategory.id, parentId: parentCategory.id, ...formData }
        : { parentId: parentCategory.id, ...formData };

      const res = await fetch("/api/admin/categories", {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });

      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.error || "Failed to save subcategory");
      }

      resetForm();
      setShowCreateModal(false);
      fetchSubcategories();
      if (typeof window !== "undefined") window.dispatchEvent(new CustomEvent("categories-updated"));
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to save subcategory");
    } finally {
      setSaving(false);
    }
  };

  const handleEdit = (cat: Category) => {
    setFormData({
      slug: cat.slug,
      nameEn: cat.nameEn,
      nameBn: cat.nameBn || "",
      descriptionEn: cat.descriptionEn || "",
      sortOrder: cat.sortOrder,
      isActive: cat.isActive,
    });
    setEditingCategory(cat);
    setShowCreateModal(true);
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this subcategory?")) return;

    try {
      const res = await fetch(`/api/admin/categories?id=${id}`, { method: "DELETE" });
      if (!res.ok) throw new Error("Failed to delete subcategory");
      fetchSubcategories();
      if (typeof window !== "undefined") window.dispatchEvent(new CustomEvent("categories-updated"));
    } catch {
      setError("Failed to delete subcategory");
    }
  };

  if (!parentCategory && !loading) {
    return (
      <div className="rounded-xl border border-amber-200 bg-amber-50 p-6">
        <p className="font-medium text-amber-800">Parent category not found</p>
        <Link href="/admin/categories" className="mt-2 inline-block text-sm text-amber-700 hover:underline">
          ← Back to Categories
        </Link>
      </div>
    );
  }

  if (loading && subcategories.length === 0) {
    return (
      <div className="flex h-96 items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <PageHero
        title={`Subcategories${parentCategory ? `: ${parentCategory.nameEn}` : ""}`}
        description={`Manage subcategories under this parent (${subcategories.length} total)`}
        breadcrumb={[
          { label: "Dashboard", href: "/admin" },
          { label: "Categories", href: "/admin/categories" },
          { label: parentCategory?.nameEn ?? "Parent", href: "/admin/categories" },
          { label: "Subcategories" },
        ]}
        actions={
          <>
            <Button variant="outline" asChild>
              <Link href="/admin/categories">
                <ArrowLeft className="mr-2 h-4 w-4" />
                Back to Categories
              </Link>
            </Button>
            <Dialog open={showCreateModal} onOpenChange={(open) => { setShowCreateModal(open); if (!open) resetForm(); }}>
              <DialogTrigger asChild>
                <Button>
                  <Plus className="mr-2 h-4 w-4" />
                  New Subcategory
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-2xl">
                <DialogHeader>
                  <DialogTitle>{editingCategory ? "Edit Subcategory" : "Create Subcategory"}</DialogTitle>
                  <DialogDescription>
                    {editingCategory ? "Update subcategory details." : "Add a new subcategory under this parent."}
                  </DialogDescription>
                </DialogHeader>
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="text-sm font-medium">Name (English) *</label>
                      <Input
                        value={formData.nameEn}
                        onChange={(e) => setFormData({ ...formData, nameEn: e.target.value })}
                        placeholder="Subcategory name"
                        required
                      />
                    </div>
                    <div>
                      <label className="text-sm font-medium">Slug *</label>
                      <Input
                        value={formData.slug}
                        onChange={(e) => setFormData({ ...formData, slug: e.target.value })}
                        placeholder="subcategory-slug"
                        required
                      />
                    </div>
                  </div>
                  <div>
                    <label className="text-sm font-medium">Sort Order</label>
                    <Input
                      type="number"
                      value={formData.sortOrder}
                      onChange={(e) => setFormData({ ...formData, sortOrder: parseInt(e.target.value) || 0 })}
                      placeholder="0"
                    />
                  </div>
                  <div>
                    <label className="text-sm font-medium">Description</label>
                    <Textarea
                      value={formData.descriptionEn}
                      onChange={(e) => setFormData({ ...formData, descriptionEn: e.target.value })}
                      placeholder="Description"
                      rows={2}
                    />
                  </div>
                  <div className="flex items-center space-x-2">
                    <input
                      type="checkbox"
                      id="isActive"
                      checked={formData.isActive}
                      onChange={(e) => setFormData({ ...formData, isActive: e.target.checked })}
                      className="rounded"
                    />
                    <label htmlFor="isActive" className="text-sm font-medium">Active</label>
                  </div>
                  {error && <p className="text-sm text-destructive">{error}</p>}
                  <div className="flex justify-end gap-2">
                    <Button type="button" variant="outline" onClick={() => setShowCreateModal(false)}>Cancel</Button>
                    <Button type="submit" disabled={saving}>
                      {saving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                      {editingCategory ? "Update" : "Create"}
                    </Button>
                  </div>
                </form>
              </DialogContent>
            </Dialog>
          </>
        }
      />

      <div className="rounded-lg border bg-card shadow-sm">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Name</TableHead>
              <TableHead>Slug</TableHead>
              <TableHead>Sort Order</TableHead>
              <TableHead>Products</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {subcategories.map((cat) => (
              <TableRow key={cat.id}>
                <TableCell className="font-medium">{cat.nameEn}</TableCell>
                <TableCell className="text-muted-foreground">{cat.slug}</TableCell>
                <TableCell>{cat.sortOrder}</TableCell>
                <TableCell>{cat._count?.products ?? 0}</TableCell>
                <TableCell>{cat.isActive ? "Active" : "Inactive"}</TableCell>
                <TableCell className="text-right">
                  <Button variant="ghost" size="icon" onClick={() => handleEdit(cat)}>
                    <Pencil className="h-4 w-4" />
                  </Button>
                  <Button variant="ghost" size="icon" onClick={() => handleDelete(cat.id)}>
                    <Trash2 className="h-4 w-4 text-destructive" />
                  </Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
