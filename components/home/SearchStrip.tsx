"use client";

import { useState } from "react";
import { Search, Phone } from "lucide-react";

const CATEGORIES = [
  "All Categories",
  "Dog Food",
  "Cat Food",
  "Cat Accessories",
  "Care & Health",
  "Bird Food",
  "Toys",
];

export default function SearchStrip() {
  const [query, setQuery] = useState("");
  const [category, setCategory] = useState("All Categories");

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (query.trim()) {
      const params = new URLSearchParams({ q: query.trim() });
      if (category !== "All Categories") params.set("category", category);
      window.location.href = `/shop?${params.toString()}`;
    }
  };

  return (
    <div className="border-b border-slate-200 bg-white">
      <div className="mx-auto max-w-7xl px-3 py-2 md:px-6 md:py-3 lg:px-8">
        <div className="flex items-center gap-3 md:justify-between">
          <form onSubmit={handleSearch} className="flex min-w-0 flex-1 items-stretch">
            <div className="flex min-w-0 flex-1 overflow-hidden rounded-xl border-2 border-slate-200 bg-slate-50 transition-colors focus-within:border-primary focus-within:bg-white focus-within:ring-2 focus-within:ring-primary/20">
              {/* Category dropdown: desktop only */}
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="hidden w-44 shrink-0 border-0 bg-transparent px-3 py-0 text-sm font-medium text-slate-700 focus:ring-0 md:block"
                aria-label="Search category"
              >
                {CATEGORIES.map((c) => (
                  <option key={c} value={c}>{c}</option>
                ))}
              </select>
              <input
                type="search"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Search products, brands..."
                className="h-11 min-w-0 flex-1 border-0 bg-transparent px-3 text-sm text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-0"
                aria-label="Search products"
              />
              <button
                type="submit"
                className="flex h-11 min-w-[44px] items-center justify-center gap-1.5 bg-primary px-4 text-sm font-semibold text-white transition-colors hover:bg-slate-800 md:px-5"
                aria-label="Search"
              >
                <Search className="h-4 w-4" />
                <span className="hidden sm:inline">Search</span>
              </button>
            </div>
          </form>

          {/* Desktop: phone support */}
          <div className="hidden shrink-0 items-center gap-2 text-slate-700 md:flex">
            <Phone className="h-5 w-5 shrink-0 text-primary" aria-hidden />
            <div>
              <p className="text-xs font-medium text-slate-500">Support</p>
              <a href="tel:+8801643390045" className="text-sm font-semibold text-slate-900 hover:text-primary">01643-390045</a>
            </div>
          </div>
        </div>

        {/* Mobile: phone support below search */}
        <div className="mt-1.5 flex items-center gap-1.5 md:hidden">
          <Phone className="h-3.5 w-3.5 shrink-0 text-primary" aria-hidden />
          <a href="tel:+8801643390045" className="text-xs font-medium text-slate-500 hover:text-primary">
            Support: <span className="font-semibold text-slate-700">01643-390045</span>
          </a>
        </div>
      </div>
    </div>
  );
}
