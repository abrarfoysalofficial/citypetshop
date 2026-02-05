"use client";

import { useState } from "react";
import { Plus } from "lucide-react";

const DEMO_ATTRIBUTES = [
  { name: "Brand", slug: "brand", orderBy: "Custom ordering", terms: "Bioline, Royal Canin, SmartHeart, Drools, Zoi Cat, City Plus" },
  { name: "Color", slug: "color", orderBy: "Custom ordering", terms: "Beige, Black, Blue, Red, Green, Multicolor, White" },
  { name: "Flavor", slug: "flavor", orderBy: "Custom ordering", terms: "Mix Flavor, Salmon & Shrimp, Tuna & Chicken, Chicken & Rice" },
  { name: "Size", slug: "size", orderBy: "Custom ordering", terms: "S, M, L, XL, 1 Kg, 350gm, 10kg" },
  { name: "Variation", slug: "variation", orderBy: "Custom ordering", terms: "1 Kg, 10 Pcs Mix Flavor Combo, 350gm" },
];

const SWATCH_STYLES = [
  { id: "default", label: "Default" },
  { id: "circles", label: "Colored circles" },
  { id: "buttons", label: "Buttons (S, M, L)" },
  { id: "dropdown", label: "Dropdown" },
];

export default function AdminAttributesPage() {
  const [name, setName] = useState("");
  const [slug, setSlug] = useState("");
  const [enableArchives, setEnableArchives] = useState(false);
  const [sortOrder, setSortOrder] = useState("custom");
  const [swatchStyle, setSwatchStyle] = useState("circles");

  const handleAdd = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;
    alert("Attribute added (demo). Connect backend to persist.");
    setName("");
    setSlug("");
  };

  return (
    <div className="flex flex-col gap-6 lg:flex-row">
      <div className="w-full lg:w-80 shrink-0">
        <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
          <h2 className="mb-4 text-lg font-semibold text-slate-900">Add new attribute</h2>
          <p className="mb-4 text-sm text-slate-600">
            Attributes are used in the shop sidebar for filtering (e.g. Color, Size).
          </p>
          <form onSubmit={handleAdd} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-slate-700">Name</label>
              <input
                type="text"
                value={name}
                onChange={(e) => {
                  setName(e.target.value);
                  if (!slug) setSlug(e.target.value.toLowerCase().replace(/\s+/g, "-").slice(0, 28));
                }}
                className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 text-sm"
                placeholder="e.g. Color"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700">Slug</label>
              <input
                type="text"
                value={slug}
                onChange={(e) => setSlug(e.target.value.slice(0, 28))}
                maxLength={28}
                className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 font-mono text-sm"
                placeholder="e.g. color"
              />
              <p className="mt-1 text-xs text-slate-500">Max 28 characters.</p>
            </div>
            <label className="flex items-center gap-2">
              <input type="checkbox" checked={enableArchives} onChange={(e) => setEnableArchives(e.target.checked)} className="rounded border-slate-300" />
              <span className="text-sm text-slate-700">Enable archives?</span>
            </label>
            <div>
              <label className="block text-sm font-medium text-slate-700">Default sort order</label>
              <select value={sortOrder} onChange={(e) => setSortOrder(e.target.value)} className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 text-sm">
                <option value="custom">Custom ordering</option>
                <option value="name">Name</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700">Swatch style</label>
              <select value={swatchStyle} onChange={(e) => setSwatchStyle(e.target.value)} className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 text-sm">
                {SWATCH_STYLES.map((s) => (
                  <option key={s.id} value={s.id}>{s.label}</option>
                ))}
              </select>
            </div>
            <button type="submit" className="flex w-full items-center justify-center gap-2 rounded-lg bg-primary px-4 py-2 text-sm font-medium text-white hover:bg-primary/90">
              <Plus className="h-4 w-4" /> Add attribute
            </button>
          </form>
        </div>
      </div>

      <div className="min-w-0 flex-1">
        <div className="rounded-xl border border-slate-200 bg-white shadow-sm">
          <div className="border-b border-slate-200 bg-slate-50 px-4 py-3">
            <h1 className="text-lg font-semibold text-slate-900">Product attributes</h1>
          </div>
          <table className="w-full text-left text-sm">
            <thead className="border-b border-slate-200 bg-slate-50">
              <tr>
                <th className="p-3 font-medium text-slate-900">Name</th>
                <th className="p-3 font-medium text-slate-900">Slug</th>
                <th className="p-3 font-medium text-slate-900">Order by</th>
                <th className="p-3 font-medium text-slate-900">Terms</th>
                <th className="p-3 font-medium text-slate-900">Actions</th>
              </tr>
            </thead>
            <tbody>
              {DEMO_ATTRIBUTES.map((a) => (
                <tr key={a.slug} className="border-b border-slate-100">
                  <td className="p-3 font-medium text-slate-900">{a.name}</td>
                  <td className="p-3 font-mono text-slate-600">{a.slug}</td>
                  <td className="p-3 text-slate-600">{a.orderBy}</td>
                  <td className="p-3 text-slate-600">{a.terms}</td>
                  <td className="p-3">
                    <button type="button" className="text-primary hover:underline">Configure terms</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
