"use client";

import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Loader2, Plus, Pencil, Trash2 } from "lucide-react";

const schema = z.object({ value: z.string().min(1), sort_order: z.coerce.number().default(0), is_active: z.boolean().default(true) });

type FormData = z.infer<typeof schema>;

type Row = { id: string; value: string; sort_order: number; is_active: boolean };

export default function ProductRamsPage() {
  const [items, setItems] = useState<Row[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [editing, setEditing] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const { register, handleSubmit, reset, setValue } = useForm<FormData>({ resolver: zodResolver(schema) });

  const fetchItems = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/admin/product-rams");
      if (res.status === 401) window.location.href = "/admin/login";
      else if (res.ok) setItems(await res.json());
    } catch (e) {
      setError("Failed to load");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchItems();
  }, []);

  const onSubmit = async (data: FormData) => {
    setSaving(true);
    setError(null);
    try {
      const res = editing
        ? await fetch("/api/admin/product-rams", { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ id: editing, ...data }) })
        : await fetch("/api/admin/product-rams", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(data) });
      if (!res.ok) throw new Error((await res.json()).error);
      reset({ value: "", sort_order: 0, is_active: true });
      setEditing(null);
      fetchItems();
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to save");
    } finally {
      setSaving(false);
    }
  };

  const onDelete = async (id: string) => {
    if (!confirm("Delete this item?")) return;
    try {
      const res = await fetch(`/api/admin/product-rams?id=${id}`, { method: "DELETE" });
      if (!res.ok) throw new Error();
      fetchItems();
    } catch {
      setError("Failed to delete");
    }
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
      <h1 className="text-2xl font-bold text-slate-900">Add Product RAMS</h1>
      <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
        <form onSubmit={handleSubmit(onSubmit)} className="flex flex-wrap gap-4">
          <input {...register("value")} placeholder="Value (e.g. 4GB)" className="rounded-lg border border-slate-300 px-3 py-2" />
          <input type="number" {...register("sort_order")} className="w-24 rounded-lg border border-slate-300 px-3 py-2" />
          <label className="flex items-center gap-2">
            <input type="checkbox" {...register("is_active")} />
            Active
          </label>
          <button type="submit" disabled={saving} className="flex items-center gap-2 rounded-lg bg-blue-600 px-4 py-2 text-white disabled:opacity-50">
            {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Plus className="h-4 w-4" />}
            {editing ? "Update" : "Add"}
          </button>
        </form>
        {error && <p className="mt-2 text-sm text-red-600">{error}</p>}
      </div>
      <div className="rounded-xl border border-slate-200 bg-white shadow-sm overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-slate-50">
            <tr>
              <th className="p-3 text-left font-medium">Value</th>
              <th className="p-3 text-left">Sort</th>
              <th className="p-3 text-left">Active</th>
              <th className="p-3 text-right">Actions</th>
            </tr>
          </thead>
          <tbody>
            {items.map((r) => (
              <tr key={r.id} className="border-t border-slate-100">
                <td className="p-3">{r.value}</td>
                <td className="p-3">{r.sort_order}</td>
                <td className="p-3">{r.is_active ? "Yes" : "No"}</td>
                <td className="p-3 text-right">
                  <button onClick={() => { setEditing(r.id); setValue("value", r.value); setValue("sort_order", r.sort_order); setValue("is_active", r.is_active); }} className="text-blue-600 hover:underline mr-2">
                    Edit
                  </button>
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
