"use client";

import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import Image from "next/image";
import Link from "next/link";
import { Loader2, Upload } from "lucide-react";

const schema = z.object({
  name_en: z.string().min(1, "Name required"),
  slug: z.string().min(1, "Slug required"),
  category_slug: z.string().min(1, "Category required"),
  brand: z.string().optional(),
  buying_price: z.coerce.number().min(0),
  selling_price: z.coerce.number().min(0),
  stock: z.coerce.number().min(0),
  rating: z.coerce.number().min(0).max(5).optional(),
  discount_percent: z.coerce.number().min(0).max(100).optional(),
  description_en: z.string().optional(),
  is_active: z.boolean().default(true),
  is_featured: z.boolean().default(false),
});
type FormData = z.infer<typeof schema>;

export default function ProductUploadPage() {
  const [categories, setCategories] = useState<{ slug: string; name: string }[]>([]);
  const [images, setImages] = useState<string[]>([]);
  const [uploading, setUploading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const { register, handleSubmit, setValue, watch } = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: { buying_price: 0, selling_price: 0, stock: 0, rating: 0, discount_percent: 0, is_active: true, is_featured: false },
  });

  useEffect(() => {
    fetch("/api/admin/categories")
      .then((r) => (r.ok ? r.json() : []))
      .then((data: { slug: string; nameEn?: string; name_en?: string }[]) =>
        setCategories(data.map((c) => ({ slug: c.slug, name: c.nameEn ?? c.name_en ?? c.slug })))
      )
      .catch(() => setCategories([]));
  }, []);

  const onFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    setError(null);
    try {
      const fd = new FormData();
      fd.append("file", file);
      fd.append("bucket", "product-images");
      const res = await fetch("/api/admin/upload", { method: "POST", body: fd });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      setImages((prev) => [...prev, data.url]);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Upload failed");
    } finally {
      setUploading(false);
    }
  };

  const onSubmit = async (data: FormData) => {
    setSaving(true);
    setError(null);
    try {
      const res = await fetch("/api/admin/products", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...data, images }),
      });
      if (!res.ok) throw new Error((await res.json()).error);
      setSuccess(true);
      setImages([]);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to save");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-slate-900">Product Upload</h1>
        <Link href="/admin/products" className="text-blue-600 hover:underline">← Product List</Link>
      </div>

      {success && (
        <div className="rounded-lg bg-green-50 border border-green-200 p-4 text-green-800">
          Product created successfully. <Link href="/admin/products" className="underline">View list</Link>
        </div>
      )}

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6 rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
        <div className="grid gap-4 md:grid-cols-2">
          <div>
            <label className="block text-sm font-medium text-slate-700">Name (EN) *</label>
            <input {...register("name_en")} className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2" />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700">Slug *</label>
            <input {...register("slug")} className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2" placeholder="product-name" />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700">Category *</label>
            <select {...register("category_slug")} className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2">
              <option value="">Select...</option>
              {categories.map((c) => (
                <option key={c.slug} value={c.slug}>{c.name}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700">Brand</label>
            <input {...register("brand")} className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2" />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700">Buying Price (৳)</label>
            <input type="number" step="0.01" {...register("buying_price")} className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2" />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700">Selling Price (৳)</label>
            <input type="number" step="0.01" {...register("selling_price")} className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2" />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700">Stock</label>
            <input type="number" {...register("stock")} className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2" />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700">Rating (0-5)</label>
            <input type="number" step="0.1" {...register("rating")} className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2" />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700">Discount %</label>
            <input type="number" {...register("discount_percent")} className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2" />
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-slate-700">Description</label>
          <textarea {...register("description_en")} rows={3} className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2" />
        </div>

        <div>
          <label className="block text-sm font-medium text-slate-700">Images</label>
          <div className="mt-2 flex flex-wrap gap-2">
            {images.map((url) => (
              <Image key={url} src={url} alt="" width={80} height={80} className="h-20 w-20 rounded-lg object-cover border" />
            ))}
            <label className="flex h-20 w-20 cursor-pointer items-center justify-center rounded-lg border-2 border-dashed border-slate-300 hover:border-blue-500">
              <input type="file" accept="image/*" onChange={onFileChange} disabled={uploading} className="hidden" />
              {uploading ? <Loader2 className="h-6 w-6 animate-spin text-slate-400" /> : <Upload className="h-6 w-6 text-slate-400" />}
            </label>
          </div>
        </div>

        <div className="flex gap-4">
          <label className="flex items-center gap-2"><input type="checkbox" {...register("is_active")} />Active</label>
          <label className="flex items-center gap-2"><input type="checkbox" {...register("is_featured")} />Featured</label>
        </div>

        {error && <p className="text-sm text-red-600">{error}</p>}

        <button type="submit" disabled={saving} className="flex items-center gap-2 rounded-lg bg-blue-600 px-6 py-2.5 text-white disabled:opacity-50">
          {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Upload className="h-4 w-4" />}Save Product
        </button>
      </form>
    </div>
  );
}
