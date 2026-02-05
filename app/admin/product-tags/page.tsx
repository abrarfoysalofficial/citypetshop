"use client";

import { useState } from "react";
import { Plus, ChevronUp, ChevronDown } from "lucide-react";

const MOST_USED_TAGS = [
  "Best Seller",
  "New Arrival",
  "Flash Sale",
  "Cat Accessories",
  "Dog Food",
  "Kitten Dry Food",
  "Vet Approved",
  "Clearance",
];

export default function AdminProductTagsPage() {
  const [tagInput, setTagInput] = useState("");
  const [tags, setTags] = useState<string[]>([]);
  const [showMostUsed, setShowMostUsed] = useState(false);

  const handleAdd = (e: React.FormEvent) => {
    e.preventDefault();
    const newTags = tagInput
      .split(",")
      .map((t) => t.trim().toLowerCase().replace(/\s+/g, "-"))
      .filter((t) => t && !tags.includes(t));
    if (newTags.length > 0) {
      setTags((prev) => [...prev, ...newTags]);
      setTagInput("");
    }
  };

  const addFromMostUsed = (tag: string) => {
    const slug = tag.toLowerCase().replace(/\s+/g, "-");
    if (!tags.includes(slug)) setTags((prev) => [...prev, slug]);
  };

  return (
    <div className="space-y-6">
      <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
        <div className="flex items-center justify-between border-b border-slate-200 pb-3">
          <h1 className="text-lg font-semibold text-slate-900">Product tags</h1>
          <div className="flex gap-1">
            <button type="button" className="rounded p-1 hover:bg-slate-100" aria-label="Move up">
              <ChevronUp className="h-4 w-4" />
            </button>
            <button type="button" className="rounded p-1 hover:bg-slate-100" aria-label="Move down">
              <ChevronDown className="h-4 w-4" />
            </button>
          </div>
        </div>
        <form onSubmit={handleAdd} className="mt-4 flex gap-2">
          <input
            type="text"
            value={tagInput}
            onChange={(e) => setTagInput(e.target.value)}
            placeholder="Add tags"
            className="flex-1 rounded-lg border border-slate-300 px-3 py-2 text-sm"
          />
          <button
            type="submit"
            className="rounded-lg bg-brand px-4 py-2 text-sm font-medium text-white hover:bg-brand/90"
          >
            Add
          </button>
        </form>
        <p className="mt-2 text-xs text-slate-500">Separate tags with commas</p>
        <button
          type="button"
          onClick={() => setShowMostUsed(!showMostUsed)}
          className="mt-4 text-sm font-medium text-brand hover:underline"
        >
          Choose from the most used tags
        </button>
        {showMostUsed && (
          <div className="mt-3 rounded-lg border border-slate-200 bg-slate-50 p-3">
            {MOST_USED_TAGS.length > 0 ? (
              <div className="flex flex-wrap gap-2">
                {MOST_USED_TAGS.map((t) => (
                  <button
                    key={t}
                    type="button"
                    onClick={() => addFromMostUsed(t)}
                    className="rounded border border-slate-200 bg-white px-2 py-1 text-sm hover:bg-brand/10"
                  >
                    {t}
                  </button>
                ))}
              </div>
            ) : (
              <p className="text-sm text-slate-500">No tags found</p>
            )}
          </div>
        )}
        <div className="mt-4 rounded-lg border border-slate-200 bg-slate-50 p-3">
          {tags.length > 0 ? (
            <div className="flex flex-wrap gap-2">
              {tags.map((t) => (
                <span
                  key={t}
                  className="inline-flex items-center gap-1 rounded-full bg-brand/20 px-2 py-0.5 text-sm"
                >
                  {t}
                </span>
              ))}
            </div>
          ) : (
            <p className="text-sm text-slate-500">No tags found</p>
          )}
        </div>
      </div>
    </div>
  );
}
