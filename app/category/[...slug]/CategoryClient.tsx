"use client";

import { useMemo, useState } from "react";
import { ArrowDownAZ, ArrowUpAZ, Package, CheckCircle, SlidersHorizontal, ChevronDown } from "lucide-react";
import ProductCard from "@/components/ProductCard";
import type { DisplayProduct } from "@/components/ProductCard";
import type { Product } from "@/src/data/types";

type SortOption = "default" | "price-low" | "price-high";
type StockFilter = "all" | "in-stock";

interface CategoryClientProps {
  products: Product[];
  categoryName: string;
  slug: string;
  filterProducts: Product[];
}

const SORT_OPTIONS: { value: SortOption; label: string; icon: React.ReactNode }[] = [
  { value: "default",    label: "Default",           icon: <Package className="h-4 w-4" /> },
  { value: "price-low",  label: "Price: Low to High", icon: <ArrowDownAZ className="h-4 w-4" /> },
  { value: "price-high", label: "Price: High to Low", icon: <ArrowUpAZ className="h-4 w-4" /> },
];

/** Shared filter panel content — used in both desktop sidebar and mobile accordion */
function FilterPanel({
  sort,
  setSort,
  stockFilter,
  setStockFilter,
}: {
  sort: SortOption;
  setSort: (v: SortOption) => void;
  stockFilter: StockFilter;
  setStockFilter: (v: StockFilter) => void;
}) {
  return (
    <div className="space-y-5">
      <div>
        <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-slate-500">Sort By</p>
        <ul className="space-y-1">
          {SORT_OPTIONS.map(({ value, label, icon }) => (
            <li key={value}>
              <button
                onClick={() => setSort(value)}
                className={`flex h-10 w-full items-center gap-2.5 rounded-xl px-3 text-sm font-medium transition-colors ${
                  sort === value
                    ? "bg-primary text-white"
                    : "text-slate-700 hover:bg-slate-100"
                }`}
              >
                {icon}
                {label}
              </button>
            </li>
          ))}
        </ul>
      </div>

      <div>
        <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-slate-500">Availability</p>
        <ul className="space-y-1">
          {(["all", "in-stock"] as StockFilter[]).map((v) => (
            <li key={v}>
              <button
                onClick={() => setStockFilter(v)}
                className={`flex h-10 w-full items-center gap-2.5 rounded-xl px-3 text-sm font-medium transition-colors ${
                  stockFilter === v
                    ? "bg-primary text-white"
                    : "text-slate-700 hover:bg-slate-100"
                }`}
              >
                {v === "in-stock" && <CheckCircle className="h-4 w-4" />}
                {v === "all" ? "All products" : "In stock only"}
              </button>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}

export default function CategoryClient({
  products: _allProducts,
  categoryName,
  slug: _slug,
  filterProducts,
}: CategoryClientProps) {
  const [sort, setSort] = useState<SortOption>("default");
  const [stockFilter, setStockFilter] = useState<StockFilter>("all");
  const [mobileFilterOpen, setMobileFilterOpen] = useState(false);

  const filteredAndSorted = useMemo(() => {
    let list = filterProducts;
    if (stockFilter === "in-stock") list = list.filter((p) => p.inStock !== false);
    if (sort === "price-low") list = [...list].sort((a, b) => a.price - b.price);
    else if (sort === "price-high") list = [...list].sort((a, b) => b.price - a.price);
    return list;
  }, [filterProducts, sort, stockFilter]);

  const activeFilterCount = (sort !== "default" ? 1 : 0) + (stockFilter !== "all" ? 1 : 0);

  return (
    <div className="mx-auto max-w-7xl px-3 py-6 sm:px-6 lg:px-8 lg:py-8">
      {/* Page heading */}
      <div className="mb-5 lg:mb-8">
        <h1 className="text-xl font-extrabold text-primary sm:text-2xl lg:text-4xl">{categoryName}</h1>
        <p className="mt-1 text-sm text-slate-600">Quality products for your pet. Fast delivery across Bangladesh.</p>
      </div>

      {/* Mobile filter bar — visible only below lg */}
      <div className="mb-4 lg:hidden">
        <button
          onClick={() => setMobileFilterOpen((o) => !o)}
          className="flex h-10 items-center gap-2 rounded-xl border border-slate-200 bg-white px-4 text-sm font-medium text-slate-700 shadow-sm transition hover:bg-slate-50"
          aria-expanded={mobileFilterOpen}
        >
          <SlidersHorizontal className="h-4 w-4 text-primary" />
          Filters
          {activeFilterCount > 0 && (
            <span className="flex h-5 w-5 items-center justify-center rounded-full bg-primary text-xs font-bold text-white">
              {activeFilterCount}
            </span>
          )}
          <ChevronDown
            className={`ml-auto h-4 w-4 text-slate-400 transition-transform ${mobileFilterOpen ? "rotate-180" : ""}`}
          />
        </button>

        {/* Mobile accordion panel */}
        {mobileFilterOpen && (
          <div className="mt-2 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
            <FilterPanel
              sort={sort}
              setSort={setSort}
              stockFilter={stockFilter}
              setStockFilter={setStockFilter}
            />
          </div>
        )}
      </div>

      <div className="flex gap-6 lg:items-start">
        {/* Desktop sidebar — hidden below lg */}
        <aside className="hidden w-52 shrink-0 lg:block">
          <div className="sticky top-24 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
            <FilterPanel
              sort={sort}
              setSort={setSort}
              stockFilter={stockFilter}
              setStockFilter={setStockFilter}
            />
          </div>
        </aside>

        {/* Product grid */}
        <div className="flex-1 min-w-0">
          <p className="mb-4 text-xs font-medium text-slate-500">
            {filteredAndSorted.length} product{filteredAndSorted.length !== 1 ? "s" : ""}
          </p>
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-2 md:gap-4 xl:grid-cols-3">
            {filteredAndSorted.map((product) => (
              <ProductCard key={product.id} product={product as DisplayProduct} />
            ))}
          </div>
          {filteredAndSorted.length === 0 && (
            <p className="py-16 text-center text-sm text-slate-500">No products in this category.</p>
          )}
        </div>
      </div>
    </div>
  );
}
