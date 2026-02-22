"use client";

import { useState, useEffect, useCallback } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";

type Block = {
  id: string;
  type: string;
  configJson: Record<string, unknown>;
  sortOrder: number;
};

type LandingPage = {
  id: string;
  slug: string;
  title: string;
  isPublished: boolean;
  seoTitle: string | null;
  seoDesc: string | null;
  blocks: Block[];
};

const BLOCK_TYPES = [
  { type: "hero", label: "🖼️ Hero Banner", defaultConfig: { title: "Welcome!", subtitle: "Discover amazing products.", ctaText: "Shop Now", ctaUrl: "/shop", backgroundImage: "" } },
  { type: "countdown", label: "⏱️ Countdown Timer", defaultConfig: { title: "Sale Ends In", endTime: new Date(Date.now() + 86400000 * 3).toISOString() } },
  { type: "product_grid", label: "🛍️ Product Grid", defaultConfig: { title: "Featured Products", productIds: [], ctaText: "View All", ctaUrl: "/shop" } },
  { type: "review", label: "⭐ Reviews", defaultConfig: { title: "Customer Reviews", reviews: [{ name: "Customer", text: "Great products!", rating: 5 }] } },
  { type: "social_proof", label: "📊 Social Proof", defaultConfig: { title: "Trusted by Thousands", stats: [{ label: "Happy Customers", value: "5000+" }, { label: "Products", value: "200+" }] } },
  { type: "features", label: "✅ Features", defaultConfig: { title: "Why Choose Us", features: [{ title: "Fast Delivery", description: "Same day delivery available.", icon: "🚚" }] } },
  { type: "cta", label: "📣 Call to Action", defaultConfig: { title: "Ready to Shop?", subtitle: "Get the best products for your pets.", ctaText: "Shop Now", ctaUrl: "/shop" } },
  { type: "html", label: "💻 Custom HTML", defaultConfig: { html: "<div>Custom content here</div>" } },
];

export default function LandingPageEditorPage() {
  const params = useParams();
  const router = useRouter();
  const pageId = params.id as string;

  const [page, setPage] = useState<LandingPage | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [editingBlock, setEditingBlock] = useState<Block | null>(null);
  const [editJson, setEditJson] = useState("");
  const [jsonError, setJsonError] = useState("");

  const fetchPage = useCallback(() => {
    fetch(`/api/admin/landing-pages/${pageId}`)
      .then((r) => {
        if (r.status === 401) { router.push("/admin/login"); return null; }
        return r.json();
      })
      .then((d) => { if (d?.page) setPage(d.page); })
      .finally(() => setLoading(false));
  }, [pageId, router]);

  useEffect(() => { fetchPage(); }, [fetchPage]);

  const addBlock = async (type: string) => {
    const template = BLOCK_TYPES.find((b) => b.type === type);
    setSaving(true);
    await fetch(`/api/admin/landing-pages/${pageId}/blocks`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ type, configJson: template?.defaultConfig ?? {}, sortOrder: (page?.blocks.length ?? 0) * 10 }),
    });
    setSaving(false);
    fetchPage();
  };

  const deleteBlock = async (blockId: string) => {
    if (!confirm("Remove this block?")) return;
    setSaving(true);
    await fetch(`/api/admin/landing-pages/${pageId}/blocks/${blockId}`, { method: "DELETE" });
    setSaving(false);
    fetchPage();
  };

  const openEdit = (block: Block) => {
    setEditingBlock(block);
    setEditJson(JSON.stringify(block.configJson, null, 2));
    setJsonError("");
  };

  const saveBlockEdit = async () => {
    if (!editingBlock) return;
    try {
      const parsed = JSON.parse(editJson);
      setSaving(true);
      await fetch(`/api/admin/landing-pages/${pageId}/blocks/${editingBlock.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ configJson: parsed }),
      });
      setSaving(false);
      setEditingBlock(null);
      fetchPage();
    } catch {
      setJsonError("Invalid JSON. Please check your syntax.");
    }
  };

  const togglePublish = async () => {
    if (!page) return;
    setSaving(true);
    await fetch(`/api/admin/landing-pages/${pageId}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ isPublished: !page.isPublished }),
    });
    setSaving(false);
    fetchPage();
  };

  if (loading) return <div className="flex h-64 items-center justify-center"><div className="h-8 w-8 animate-spin rounded-full border-4 border-blue-600 border-t-transparent" /></div>;
  if (!page) return <div className="p-8 text-center text-red-600">Page not found.</div>;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <Link href="/admin/landing-pages" className="text-sm text-slate-500 hover:text-slate-700">← Landing Pages</Link>
          <h1 className="mt-1 text-2xl font-bold text-slate-900">{page.title}</h1>
          <p className="text-sm text-slate-500">/{page.slug}</p>
        </div>
        <div className="flex items-center gap-3">
          {page.isPublished && (
            <a href={`/landing/${page.slug}`} target="_blank" rel="noopener noreferrer" className="rounded-lg border border-slate-300 px-4 py-2 text-sm hover:bg-slate-50">
              View Live
            </a>
          )}
          <button
            onClick={togglePublish}
            disabled={saving}
            className={`rounded-lg px-4 py-2 text-sm font-medium text-white ${page.isPublished ? "bg-red-500 hover:bg-red-600" : "bg-green-600 hover:bg-green-700"}`}
          >
            {page.isPublished ? "Unpublish" : "Publish"}
          </button>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Blocks list */}
        <div className="lg:col-span-2 space-y-3">
          <h2 className="font-semibold text-slate-800">Page Blocks ({page.blocks.length})</h2>
          {page.blocks.length === 0 && (
            <div className="rounded-xl border-2 border-dashed border-slate-300 p-12 text-center text-slate-500">
              No blocks yet. Add a block from the right panel.
            </div>
          )}
          {page.blocks.map((block) => {
            const template = BLOCK_TYPES.find((t) => t.type === block.type);
            return (
              <div key={block.id} className="flex items-center justify-between rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
                <div>
                  <p className="font-medium text-slate-800">{template?.label ?? block.type}</p>
                  <p className="mt-1 font-mono text-xs text-slate-400">type: {block.type} | order: {block.sortOrder}</p>
                </div>
                <div className="flex gap-2">
                  <button onClick={() => openEdit(block)} className="rounded-lg bg-blue-50 px-3 py-1.5 text-xs font-medium text-blue-700 hover:bg-blue-100">Edit Config</button>
                  <button onClick={() => deleteBlock(block.id)} className="rounded-lg bg-red-50 px-3 py-1.5 text-xs font-medium text-red-700 hover:bg-red-100">Remove</button>
                </div>
              </div>
            );
          })}
        </div>

        {/* Add block panel */}
        <div className="space-y-3">
          <h2 className="font-semibold text-slate-800">Add Block</h2>
          {BLOCK_TYPES.map((t) => (
            <button
              key={t.type}
              onClick={() => addBlock(t.type)}
              disabled={saving}
              className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-left text-sm font-medium text-slate-700 hover:bg-slate-50 hover:border-primary disabled:opacity-50"
            >
              {t.label}
            </button>
          ))}
        </div>
      </div>

      {/* Block config editor modal */}
      {editingBlock && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4">
          <div className="w-full max-w-2xl rounded-xl bg-white shadow-2xl">
            <div className="border-b border-slate-200 p-4">
              <h3 className="font-semibold text-slate-900">Edit Block Config — {editingBlock.type}</h3>
              <p className="mt-1 text-xs text-slate-500">Edit the JSON configuration for this block.</p>
            </div>
            <div className="p-4">
              <textarea
                className="w-full rounded-lg border border-slate-300 bg-slate-50 p-3 font-mono text-xs focus:border-primary focus:outline-none"
                rows={18}
                value={editJson}
                onChange={(e) => { setEditJson(e.target.value); setJsonError(""); }}
              />
              {jsonError && <p className="mt-2 text-sm text-red-600">{jsonError}</p>}
            </div>
            <div className="flex items-center justify-end gap-3 border-t border-slate-200 p-4">
              <button onClick={() => setEditingBlock(null)} className="rounded-lg border px-4 py-2 text-sm hover:bg-slate-50">Cancel</button>
              <button onClick={saveBlockEdit} disabled={saving} className="rounded-lg bg-primary px-4 py-2 text-sm font-medium text-white hover:bg-primary/90 disabled:opacity-50">
                Save Block
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
