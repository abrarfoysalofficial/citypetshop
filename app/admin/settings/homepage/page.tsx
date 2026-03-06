"use client";

import { useState, useEffect } from "react";
import { GripVertical, Loader2, Save, Settings2 } from "lucide-react";
import type { HomepageBlockConfig } from "@lib/commerce-settings";

const BLOCK_TYPES = [
  { id: "featured", type: "featured" as const, label: "Featured Products" },
  { id: "featured_brands", type: "featured_brands" as const, label: "Featured Brands" },
  { id: "flash_sale", type: "flash_sale" as const, label: "Flash Sale" },
  { id: "clearance", type: "clearance" as const, label: "Clearance" },
  { id: "combo_offers", type: "combo_offers" as const, label: "Combo Offers" },
  { id: "reviews", type: "reviews" as const, label: "Customer Reviews" },
];

export default function AdminHomepageSettingsPage() {
  const [blocks, setBlocks] = useState<HomepageBlockConfig[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [msg, setMsg] = useState<{ ok: boolean; text: string } | null>(null);
  const [editingBlock, setEditingBlock] = useState<string | null>(null);

  useEffect(() => {
    fetch("/api/admin/settings")
      .then((r) => {
        if (r.status === 401) {
          window.location.href = "/admin/login";
          return null;
        }
        return r.json();
      })
      .then((d) => {
        if (d?.homepage_blocks && Array.isArray(d.homepage_blocks)) {
          setBlocks(d.homepage_blocks);
        } else {
          setBlocks([
            { id: "featured", type: "featured", enabled: true, order: 0, titleEn: "Most Popular Products", subtitle: "Bestsellers and new arrivals for your pets." },
            { id: "featured_brands", type: "featured_brands", enabled: true, order: 1, titleEn: "Featured Brands", subtitle: "Trusted brands for your pets." },
            { id: "flash_sale", type: "flash_sale", enabled: true, order: 2, titleEn: "Flash Sale", subtitle: "Limited time offers." },
            { id: "clearance", type: "clearance", enabled: true, order: 3, titleEn: "Clearance", subtitle: "Great deals while stocks last." },
            { id: "combo_offers", type: "combo_offers", enabled: true, order: 4, titleEn: "Combo Offers", subtitle: "Bundle and save." },
            { id: "reviews", type: "reviews", enabled: true, order: 5, titleEn: "Customer Reviews", subtitle: "What our customers say." },
          ]);
        }
      })
      .finally(() => setLoading(false));
  }, []);

  const updateBlock = (index: number, updates: Partial<HomepageBlockConfig>) => {
    const next = [...blocks];
    next[index] = { ...next[index]!, ...updates };
    setBlocks(next);
  };

  const moveBlock = (from: number, to: number) => {
    if (to < 0 || to >= blocks.length) return;
    const next = [...blocks];
    const [removed] = next.splice(from, 1);
    next.splice(to, 0, removed!);
    next.forEach((b, i) => { b.order = i; });
    setBlocks(next);
  };

  const handleSave = async () => {
    setSaving(true);
    setMsg(null);
    try {
      const res = await fetch("/api/admin/settings", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ homepage_blocks: blocks }),
      });
      if (res.ok) {
        setMsg({ ok: true, text: "Homepage blocks saved. Changes will appear on the storefront." });
        setEditingBlock(null);
      } else {
        setMsg({ ok: false, text: "Failed to save" });
      }
    } catch {
      setMsg({ ok: false, text: "Network error" });
    } finally {
      setSaving(false);
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
      <h1 className="text-2xl font-bold text-slate-900">Homepage Builder</h1>
      <p className="text-slate-600">
        Reorder blocks, enable/disable sections, and configure titles. All data comes from DB; no hardcoded content.
      </p>

      <div className="rounded-xl border border-slate-200 bg-white shadow-sm">
        <div className="border-b border-slate-200 bg-slate-50 px-4 py-4">
          <div className="flex items-center justify-between">
            <h2 className="font-semibold text-slate-900">Homepage Sections</h2>
            <span className="text-xs text-slate-500">Drag to reorder • Toggle to enable/disable</span>
          </div>
        </div>
        <div className="divide-y divide-slate-100">
          {blocks.map((block, idx) => (
            <div key={block.id} className="flex items-center gap-4 px-4 py-3">
              <div className="flex cursor-grab items-center gap-1 text-slate-400" aria-label="Drag to reorder">
                <GripVertical className="h-5 w-5" />
              </div>
              <div className="flex flex-1 items-center gap-4">
                <label className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    checked={block.enabled}
                    onChange={(e) => updateBlock(idx, { enabled: e.target.checked })}
                    className="h-4 w-4 rounded border-slate-300 text-blue-600"
                  />
                  <span className="font-medium text-slate-900">
                    {BLOCK_TYPES.find((b) => b.type === block.type)?.label ?? block.type}
                  </span>
                </label>
                <button
                  type="button"
                  onClick={() => setEditingBlock(editingBlock === block.id ? null : block.id)}
                  className="flex items-center gap-1 rounded px-2 py-1 text-sm text-slate-600 hover:bg-slate-100"
                >
                  <Settings2 className="h-4 w-4" />
                  Configure
                </button>
              </div>
              <div className="flex gap-4">
                <button
                  type="button"
                  onClick={() => moveBlock(idx, idx - 1)}
                  disabled={idx === 0}
                  className="rounded px-2 py-1 text-sm text-slate-600 hover:bg-slate-100 disabled:opacity-50"
                >
                  ↑
                </button>
                <button
                  type="button"
                  onClick={() => moveBlock(idx, idx + 1)}
                  disabled={idx === blocks.length - 1}
                  className="rounded px-2 py-1 text-sm text-slate-600 hover:bg-slate-100 disabled:opacity-50"
                >
                  ↓
                </button>
              </div>
            </div>
          ))}
        </div>

        {blocks.map((block, idx) =>
          editingBlock === block.id ? (
            <div key={`edit-${block.id}`} className="border-t border-slate-200 bg-slate-50 p-4">
              <h3 className="mb-3 font-medium text-slate-900">Configure: {BLOCK_TYPES.find((b) => b.type === block.type)?.label}</h3>
              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <label className="mb-1 block text-sm font-medium text-slate-700">Title (English)</label>
                  <input
                    type="text"
                    value={block.titleEn ?? ""}
                    onChange={(e) => updateBlock(idx, { titleEn: e.target.value })}
                    placeholder="e.g. Most Popular Products"
                    className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm"
                  />
                </div>
                <div>
                  <label className="mb-1 block text-sm font-medium text-slate-700">Subtitle</label>
                  <input
                    type="text"
                    value={block.subtitle ?? ""}
                    onChange={(e) => updateBlock(idx, { subtitle: e.target.value })}
                    placeholder="e.g. Bestsellers and new arrivals"
                    className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm"
                  />
                </div>
                {(block.type === "featured" || block.type === "flash_sale") && (
                  <div className="sm:col-span-2">
                    <label className="mb-1 block text-sm font-medium text-slate-700">
                      Featured Product IDs (comma-separated, optional)
                    </label>
                    <input
                      type="text"
                      value={(block.featuredProductIds ?? []).join(", ")}
                      onChange={(e) =>
                        updateBlock(idx, {
                          featuredProductIds: e.target.value
                            .split(",")
                            .map((s) => s.trim())
                            .filter(Boolean),
                        })
                      }
                      placeholder="e.g. uuid-1, uuid-2"
                      className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm font-mono"
                    />
                    <p className="mt-1 text-xs text-slate-500">Leave empty to use default (featured or flash sale products).</p>
                  </div>
                )}
                {block.type === "reviews" && (
                  <div className="sm:col-span-2">
                    <label className="mb-1 block text-sm font-medium text-slate-700">Trust badges (one per line)</label>
                    <textarea
                      value={(block.trustBadges ?? []).join("\n")}
                      onChange={(e) =>
                        updateBlock(idx, {
                          trustBadges: e.target.value
                            .split("\n")
                            .map((s) => s.trim())
                            .filter(Boolean),
                        })
                      }
                      rows={3}
                      placeholder="e.g. 100% Authentic&#10;Fast Delivery&#10;Best Price Guarantee"
                      className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm"
                    />
                  </div>
                )}
              </div>
            </div>
          ) : null
        )}
      </div>

      {msg && <p className={`text-sm ${msg.ok ? "text-green-600" : "text-red-600"}`}>{msg.text}</p>}
      <button
        onClick={handleSave}
        disabled={saving}
        className="flex items-center gap-2 rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700 disabled:opacity-50"
      >
        {saving && <Loader2 className="h-4 w-4 animate-spin" />}
        <Save className="h-4 w-4" />
        Save Homepage Blocks
      </button>
    </div>
  );
}
