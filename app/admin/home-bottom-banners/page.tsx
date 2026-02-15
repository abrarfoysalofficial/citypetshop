"use client";

import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Loader2, Plus, Upload } from "lucide-react";

const schema = z.object({ image_url: z.string().min(1), title_en: z.string().optional(), link: z.string().optional(), cta_text: z.string().optional(), sort_order: z.coerce.number().default(0), is_active: z.boolean().default(true) });
type FormData = z.infer<typeof schema>;
type Row = { id: string; image_url: string; title_en?: string; sort_order: number; is_active: boolean };

export default function HomeBottomBannersPage() {
  const [items, setItems] = useState<Row[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [editing, setEditing] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const { register, handleSubmit, reset, setValue } = useForm<FormData>({ resolver: zodResolver(schema) });

  const fetchItems = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/admin/home-bottom-banners");
      if (res.status === 401) window.location.href = "/admin/login";
      else if (res.ok) setItems(await res.json());
    } catch { setError("Failed to load"); }
    finally { setLoading(false); }
  };
  useEffect(() => { fetchItems(); }, []);

  const onFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
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
      setValue("image_url", data.url);
    } catch (e) { setError(e instanceof Error ? e.message : "Upload failed"); }
    finally { setUploading(false); }
  };

  const onSubmit = async (data: FormData) => {
    setSaving(true);
    setError(null);
    try {
      const res = editing
        ? await fetch("/api/admin/home-bottom-banners", { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ id: editing, ...data }) })
        : await fetch("/api/admin/home-bottom-banners", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(data) });
      if (!res.ok) throw new Error((await res.json()).error);
      reset();
      setEditing(null);
      fetchItems();
    } catch (e) { setError(e instanceof Error ? e.message : "Failed"); }
    finally { setSaving(false); }
  };

  const onDelete = async (id: string) => {
    if (!confirm("Delete?")) return;
    try {
      const res = await fetch(`/api/admin/home-bottom-banners?id=${id}`, { method: "DELETE" });
      if (!res.ok) throw new Error();
      fetchItems();
    } catch { setError("Failed to delete"); }
  };

  if (loading) return <div className="flex h-64 items-center justify-center"><Loader2 className="h-8 w-8 animate-spin text-blue-600" /></div>;

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-slate-900">Home Bottom Banners</h1>
      <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div>
            <label className="block text-sm font-medium">Image</label>
            <div className="mt-1 flex gap-2">
              <input {...register("image_url")} placeholder="URL" className="flex-1 rounded-lg border px-3 py-2" />
              <label className="flex cursor-pointer items-center gap-2 rounded-lg border px-4 py-2 hover:bg-slate-50">
                <input type="file" accept="image/*" onChange={onFileUpload} disabled={uploading} className="hidden" />
                {uploading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Upload className="h-4 w-4" />}Upload
              </label>
            </div>
          </div>
          <div className="grid gap-4 md:grid-cols-2">
            <div><label className="block text-sm font-medium">Title</label><input {...register("title_en")} className="mt-1 w-full rounded-lg border px-3 py-2" /></div>
            <div><label className="block text-sm font-medium">Link</label><input {...register("link")} className="mt-1 w-full rounded-lg border px-3 py-2" /></div>
          </div>
          <div className="flex flex-wrap gap-4">
            <input type="number" {...register("sort_order")} className="w-24 rounded-lg border px-3 py-2" />
            <label className="flex items-center gap-2"><input type="checkbox" {...register("is_active")} />Active</label>
            <button type="submit" disabled={saving} className="flex items-center gap-2 rounded-lg bg-blue-600 px-4 py-2 text-white disabled:opacity-50">
              {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Plus className="h-4 w-4" />}{editing ? "Update" : "Add"}
            </button>
          </div>
        </form>
        {error && <p className="mt-2 text-sm text-red-600">{error}</p>}
      </div>
      <div className="rounded-xl border border-slate-200 bg-white shadow-sm overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-slate-50"><tr><th className="p-3 text-left font-medium">Image</th><th className="p-3 text-left">Title</th><th className="p-3 text-right">Actions</th></tr></thead>
          <tbody>
            {items.map((r) => (
              <tr key={r.id} className="border-t border-slate-100">
                <td className="p-3"><img src={r.image_url} alt="" className="h-12 w-20 rounded object-cover" /></td>
                <td className="p-3">{r.title_en ?? "—"}</td>
                <td className="p-3 text-right">
                  <button onClick={() => { setEditing(r.id); setValue("image_url", r.image_url); setValue("title_en", r.title_en ?? ""); setValue("sort_order", r.sort_order); setValue("is_active", r.is_active); }} className="text-blue-600 hover:underline mr-2">Edit</button>
                  <button onClick={() => onDelete(r.id)} className="text-red-600 hover:underline">Delete</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
