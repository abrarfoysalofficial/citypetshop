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
      <div className="mx-auto flex max-w-7xl flex-col gap-3 px-4 py-4 sm:flex-row sm:items-center sm:justify-between sm:px-6 lg:px-8">
        <form onSubmit={handleSearch} className="flex flex-1 flex-col gap-2 sm:flex-row sm:items-stretch">
          <div className="flex min-w-0 flex-1 overflow-hidden rounded-lg border-2 border-slate-200 bg-slate-50 focus-within:border-primary focus-within:bg-white">
            <select
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              className="w-full border-0 bg-transparent px-3 py-3 text-sm font-medium text-slate-700 focus:ring-0 sm:w-44"
            >
              {CATEGORIES.map((c) => (
                <option key={c} value={c}>{c}</option>
              ))}
            </select>
            <input
              type="search"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search for products, brands..."
              className="min-w-0 flex-1 border-0 bg-transparent px-3 py-3 text-slate-900 placeholder-slate-400 focus:ring-0"
            />
            <button
              type="submit"
              className="flex items-center gap-2 bg-primary px-5 py-3 text-sm font-semibold text-white transition-colors hover:bg-slate-800"
            >
              <Search className="h-5 w-5" />
              <span className="hidden sm:inline">Search</span>
            </button>
          </div>
        </form>
        <div className="flex items-center gap-2 text-slate-700">
          <Phone className="h-5 w-5 shrink-0 text-primary" />
          <div>
            <p className="text-xs font-medium text-slate-500">Support</p>
            <a href="tel:+8801643390045" className="font-semibold text-slate-900 hover:text-primary">01643-390045</a>
          </div>
        </div>
      </div>
    </div>
  );
}
