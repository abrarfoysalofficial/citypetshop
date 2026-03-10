"use client";

import { useState } from "react";
import { Search, Phone } from "lucide-react";
import { useCategories } from "@/store/CategoriesContext";

interface SearchStripProps {
  /** When true, renders compact inline form (for header) */
  inline?: boolean;
}

export default function SearchStrip({ inline = false }: SearchStripProps) {
  const [query, setQuery] = useState("");
  const [category, setCategory] = useState("All Categories");
  const { categories } = useCategories();

  const categoryOptions = ["All Categories", ...categories.map((c) => c.name)];

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    const params = new URLSearchParams();
    if (query.trim()) params.set("q", query.trim());
    const catSlug = categories.find((c) => c.name === category)?.slug;
    if (catSlug) params.set("category", catSlug);
    window.location.href = params.toString() ? `/shop?${params.toString()}` : "/shop";
  };

  const form = (
    <form onSubmit={handleSearch} className="flex min-w-0 flex-1 items-stretch">
      <div className="flex min-w-0 flex-1 overflow-hidden rounded-card border border-[var(--border-light)] bg-white shadow-soft transition-shadow focus-within:border-[var(--teal-from)] focus-within:ring-2 focus-within:ring-[var(--teal-from)]/20">
        <select
          value={category}
          onChange={(e) => setCategory(e.target.value)}
          className={`shrink-0 border-r border-[var(--border-light)] bg-slate-50 px-3 text-sm font-medium text-slate-700 focus:ring-0 ${inline ? "hidden" : "hidden md:block md:w-44"}`}
          aria-label="Search category"
        >
          {categoryOptions.map((c) => (
            <option key={c} value={c}>{c}</option>
          ))}
        </select>
        <input
          type="search"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search products, brands..."
          className={`min-w-0 flex-1 border-0 bg-transparent px-3 text-sm text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-0 ${inline ? "h-10" : "h-11"}`}
          aria-label="Search products"
        />
        <button
          type="submit"
          className={`flex shrink-0 items-center justify-center gap-1.5 bg-gradient-teal px-4 text-sm font-semibold text-white shadow-soft transition-opacity hover:opacity-95 ${inline ? "h-10" : "h-11 min-w-[44px] md:px-5"}`}
          aria-label="Search"
        >
          <Search className="h-4 w-4" />
          {!inline && <span className="hidden sm:inline">Search</span>}
        </button>
      </div>
    </form>
  );

  if (inline) {
    return <div className="w-full min-w-0 max-w-xl">{form}</div>;
  }

  return (
    <div className="border-b border-white/15 bg-[var(--header-bg)]">
      <div className="mx-auto max-w-7xl px-3 py-2 md:px-6 md:py-3 lg:px-8">
        <div className="flex items-center gap-3 md:justify-between">
          {form}
          <div className="hidden shrink-0 items-center gap-2 rounded-lg border border-white/20 bg-white/5 px-4 py-2 md:flex">
            <Phone className="h-5 w-5 shrink-0 text-white" aria-hidden />
            <div>
              <p className="text-xs font-medium text-white/70">Support</p>
              <a href="tel:+8801643390045" className="text-sm font-semibold text-white transition-colors hover:text-white/90">01643-390045</a>
            </div>
          </div>
        </div>
        <div className="mt-1.5 flex items-center gap-1.5 md:hidden">
          <Phone className="h-3.5 w-3.5 shrink-0 text-white" aria-hidden />
          <a href="tel:+8801643390045" className="text-xs font-medium text-white/70 transition-colors hover:text-white">
            Support: <span className="font-semibold text-white">01643-390045</span>
          </a>
        </div>
      </div>
    </div>
  );
}
