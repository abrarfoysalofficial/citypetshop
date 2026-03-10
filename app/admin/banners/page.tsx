"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import { Loader2, Plus, Pencil, Trash2, ImageIcon } from "lucide-react";
import { PageHero } from "@/components/admin/page-hero";
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

type BannerSlide = {
  id: string;
  imageUrl: string;
  titleEn: string | null;
  titleBn: string | null;
  link: string | null;
  sortOrder: number;
  isActive: boolean;
};

export default function BannersPage() {
  const [slides, setSlides] = useState<BannerSlide[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editing, setEditing] = useState<BannerSlide | null>(null);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [form, setForm] = useState({
    imageUrl: "",
    titleEn: "",
    titleBn: "",
    link: "/shop",
    sortOrder: 0,
    isActive: true,
  });

  const fetchSlides = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/admin/banners");
      if (res.status === 401) {
        window.location.href = "/admin/login";
        return;
      }
      if (res.ok) {
        const data = await res.json();
        setSlides(data);
      }
    } catch (err) {
      setError("Failed to load banners");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSlides();
  }, []);

  const resetForm = () => {
    setForm({
      imageUrl: "",
      titleEn: "",
      titleBn: "",
      link: "/shop",
      sortOrder: slides.length,
      isActive: true,
    });
    setEditing(null);
    setError(null);
  };

  const handleEdit = (slide: BannerSlide) => {
    setForm({
      imageUrl: slide.imageUrl,
      titleEn: slide.titleEn ?? "",
      titleBn: slide.titleBn ?? "",
      link: slide.link ?? "/shop",
      sortOrder: slide.sortOrder,
      isActive: slide.isActive,
    });
    setEditing(slide);
    setShowModal(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.imageUrl.trim()) {
      setError("Image URL is required");
      return;
    }

    setSaving(true);
    setError(null);
    try {
      const method = editing ? "PATCH" : "POST";
      const body = editing
        ? { id: editing.id, ...form }
        : form;

      const res = await fetch("/api/admin/banners", {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "Failed to save");
      }
      resetForm();
      setShowModal(false);
      fetchSlides();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to save");
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Delete this banner?")) return;
    try {
      const res = await fetch("/api/admin/banners", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id }),
      });
      if (!res.ok) throw new Error("Failed to delete");
      fetchSlides();
    } catch (err) {
      setError("Failed to delete");
    }
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    try {
      const fd = new FormData();
      fd.append("file", file);
      fd.append("bucket", "banner-images");
      const res = await fetch("/api/admin/upload", { method: "POST", body: fd });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      setForm((f) => ({ ...f, imageUrl: data.url }));
    } catch (err) {
      setError("Upload failed");
    } finally {
      setUploading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex h-64 items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-slate-400" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <PageHero
        title="Hero Banners"
        description="Manage homepage hero slider. Changes appear on the storefront after save."
        breadcrumb={[{ label: "Dashboard", href: "/admin" }, { label: "CMS", href: "/admin/banners" }, { label: "Banners" }]}
        actions={
          <Dialog open={showModal} onOpenChange={(open) => { setShowModal(open); if (!open) resetForm(); }}>
          <DialogTrigger asChild>
            <Button onClick={resetForm}>
              <Plus className="mr-2 h-4 w-4" />
              Add Banner
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-lg">
            <DialogHeader>
              <DialogTitle>{editing ? "Edit Banner" : "Add Banner"}</DialogTitle>
              <DialogDescription>
                {editing ? "Update banner image and link." : "Add a new hero slide to the homepage."}
              </DialogDescription>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Image *</label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={form.imageUrl}
                    onChange={(e) => setForm({ ...form, imageUrl: e.target.value })}
                    placeholder="/uploads/banner-images/..."
                    className="flex-1 rounded-lg border border-slate-300 px-3 py-2 text-sm"
                  />
                  <label className="shrink-0">
                    <input type="file" accept="image/*" onChange={handleImageUpload} className="hidden" />
                    <span className="inline-flex cursor-pointer items-center rounded-lg border border-slate-300 bg-slate-50 px-3 py-2 text-sm hover:bg-slate-100">
                      {uploading ? <Loader2 className="h-4 w-4 animate-spin" /> : <ImageIcon className="h-4 w-4" />}
                    </span>
                  </label>
                </div>
                {form.imageUrl && (
                  <div className="mt-2 relative h-24 w-full overflow-hidden rounded-lg bg-slate-100">
                    <Image src={form.imageUrl} alt="Preview" fill className="object-cover" sizes="200px" />
                  </div>
                )}
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Title (optional)</label>
                <Input
                  value={form.titleEn}
                  onChange={(e) => setForm({ ...form, titleEn: e.target.value })}
                  placeholder="Banner title"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Link</label>
                <Input
                  value={form.link}
                  onChange={(e) => setForm({ ...form, link: e.target.value })}
                  placeholder="/shop"
                />
              </div>
              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  id="isActive"
                  checked={form.isActive}
                  onChange={(e) => setForm({ ...form, isActive: e.target.checked })}
                  className="rounded"
                />
                <label htmlFor="isActive" className="text-sm">Active</label>
              </div>
              {error && <p className="text-sm text-red-600">{error}</p>}
              <div className="flex justify-end gap-2">
                <Button type="button" variant="outline" onClick={() => setShowModal(false)}>Cancel</Button>
                <Button type="submit" disabled={saving}>
                  {saving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                  {editing ? "Update" : "Create"}
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
        }
      />

      <div className="rounded-lg border bg-white shadow-sm">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Preview</TableHead>
              <TableHead>Title</TableHead>
              <TableHead>Link</TableHead>
              <TableHead>Order</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {slides.length === 0 ? (
              <TableRow>
                <TableCell colSpan={6} className="h-24 text-center text-slate-500">
                  No banners yet. Add one to show on the homepage.
                </TableCell>
              </TableRow>
            ) : (
              slides.map((slide) => (
                <TableRow key={slide.id}>
                  <TableCell>
                    <div className="relative h-12 w-24 overflow-hidden rounded bg-slate-100">
                      <Image src={slide.imageUrl} alt={slide.titleEn ?? ""} fill className="object-cover" sizes="96px" />
                    </div>
                  </TableCell>
                  <TableCell>{slide.titleEn || "—"}</TableCell>
                  <TableCell className="text-sm text-slate-600">{slide.link || "/shop"}</TableCell>
                  <TableCell>{slide.sortOrder}</TableCell>
                  <TableCell>
                    <span className={`rounded px-2 py-0.5 text-xs ${slide.isActive ? "bg-green-100 text-green-800" : "bg-slate-100 text-slate-600"}`}>
                      {slide.isActive ? "Active" : "Inactive"}
                    </span>
                  </TableCell>
                  <TableCell className="text-right">
                    <Button variant="ghost" size="sm" onClick={() => handleEdit(slide)}>
                      <Pencil className="h-4 w-4" />
                    </Button>
                    <Button variant="ghost" size="sm" onClick={() => handleDelete(slide.id)} className="text-red-600 hover:text-red-700">
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
