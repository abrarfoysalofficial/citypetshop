"use client";

import { useSearchParams } from "next/navigation";
import { useMemo, useState, useEffect } from "react";
import Link from "next/link";
import { ArrowDownAZ, ArrowUpAZ, Package, CheckCircle, Search, Star, SlidersHorizontal, X } from "lucide-react";
import ProductCard from "@/components/ProductCard";
import type { DisplayProduct } from "@/components/ProductCard";
import type { Product } from "@/src/data/types";

const ITEMS_PER_PAGE = 12;
const priceRanges = [
  { label: "Under ৳500", min: 0, max: 500 },
  { label: "৳500 – ৳1000", min: 500, max: 1000 },
  { label: "৳1000 – ৳2000", min: 1000, max: 2000 },
  { label: "Over ৳2000", min: 2000, max: Infinity },
];

const ratingOptions = [
  { label: "Any", value: 0 },
  { label: "4+ stars", value: 4 },
  { label: "3+ stars", value: 3 },
];

type SortOption = "default" | "price-low" | "price-high";
type StockFilter = "all" | "in-stock";

type CategoryItem = { slug: string; name: string; href?: string };

interface ShopClientProps {
  products: Product[];
  categories?: CategoryItem[];
  searchTotal?: number;
  searchPage?: number;
  searchQuery?: string;
}

/** Keyword matches name, shortDesc, or tags (case-insensitive). */
function matchKeyword(p: Product, keyword: string): boolean {
  if (!keyword.trim()) return true;
  const q = keyword.trim().toLowerCase();
  const name = (p.name ?? "").toLowerCase();
  const desc = (p.shortDesc ?? "").toLowerCase();
  const tags = (p.tags ?? []).join(" ").toLowerCase();
  return name.includes(q) || desc.includes(q) || tags.includes(q);
}

export default function ShopClient({
  products,
  categories: propCategories,
  searchTotal,
  searchPage = 1,
  searchQuery,
}: ShopClientProps) {
  const searchParams = useSearchParams();
  const categoryParam = searchParams.get("category") ?? "";
  const keywordParam = searchParams.get("q") ?? "";

  const [dbCategories, setDbCategories] = useState<CategoryItem[]>([]);
  useEffect(() => {
    fetch("/api/categories")
      .then((r) => r.json())
      .then((data) => {
        if (Array.isArray(data)) {
          setDbCategories(data.map((c: { slug: string; name: string }) => ({ slug: c.slug, name: c.name, href: `/shop?category=${c.slug}` })));
        }
      })
      .catch(() => {});
  }, []);

  const categories = useMemo((): CategoryItem[] => {
    if (dbCategories.length > 0) return dbCategories;
    if (propCategories && propCategories.length > 0) return propCategories;
    const seen = new Set<string>();
    return products
      .filter((p) => {
        if (seen.has(p.categorySlug)) return false;
        seen.add(p.categorySlug);
        return true;
      })
      .map((p) => ({ slug: p.categorySlug, name: p.category ?? p.categorySlug, href: `/shop?category=${p.categorySlug}` }));
  }, [products, propCategories, dbCategories]);

  const brands = useMemo(() => {
    const set = new Set<string>();
    products.forEach((p) => {
      if (p.brand?.trim()) set.add(p.brand.trim());
    });
    return Array.from(set).sort();
  }, [products]);

  const [selectedCategory, setSelectedCategory] = useState(categoryParam);
  const [keyword, setKeyword] = useState(keywordParam);
  const [selectedBrand, setSelectedBrand] = useState(searchParams.get("brand") ?? "");
  const [minRating, setMinRating] = useState(parseInt(searchParams.get("rating") ?? "0", 10) || 0);
  const [selectedPriceRange, setSelectedPriceRange] = useState<{ min: number; max: number } | null>(null);
  const [sort, setSort] = useState<SortOption>("default");
  const [stockFilter, setStockFilter] = useState<StockFilter>("all");
  const [page, setPage] = useState(1);
  const [filterDrawerOpen, setFilterDrawerOpen] = useState(false);

  useEffect(() => {
    setSelectedCategory(categoryParam);
    setPage(1);
  }, [categoryParam]);

  useEffect(() => {
    setKeyword(keywordParam);
  }, [keywordParam]);

  const isServerSearch = searchTotal != null && searchQuery != null;

  const filteredAndSorted = useMemo(() => {
    let list = products.filter((p) => {
      const matchCategory = !selectedCategory || p.categorySlug === selectedCategory;
      const matchKeywordFilter = matchKeyword(p, keyword);
      const matchBrand = !selectedBrand || (p.brand ?? "") === selectedBrand;
      const matchRating = minRating === 0 || (p.rating != null && p.rating >= minRating);
      const matchPrice =
        !selectedPriceRange ||
        (p.price >= selectedPriceRange.min && p.price < selectedPriceRange.max);
      const matchStock = stockFilter === "all" || p.inStock !== false;
      return matchCategory && matchKeywordFilter && matchBrand && matchRating && matchPrice && matchStock;
    });
    if (sort === "price-low") list = [...list].sort((a, b) => a.price - b.price);
    else if (sort === "price-high") list = [...list].sort((a, b) => b.price - a.price);
    return list;
  }, [products, selectedCategory, keyword, selectedBrand, minRating, selectedPriceRange, sort, stockFilter]);

  const SERVER_PAGE_SIZE = 48;
  const totalPages = isServerSearch
    ? Math.ceil((searchTotal ?? 0) / SERVER_PAGE_SIZE)
    : Math.ceil(filteredAndSorted.length / ITEMS_PER_PAGE);
  const currentPage = isServerSearch ? searchPage : page;
  const paginatedProducts = useMemo(
    () =>
      isServerSearch
        ? products
        : filteredAndSorted.slice((page - 1) * ITEMS_PER_PAGE, page * ITEMS_PER_PAGE),
    [isServerSearch, products, filteredAndSorted, page]
  );

  const categoryList = categories.length > 0 ? [{ slug: "", name: "All", href: "/shop" }, ...categories] : [{ slug: "", name: "All", href: "/shop" }];

  const updateQuery = (updates: Record<string, string>) => {
    const u = new URLSearchParams(searchParams.toString());
    Object.entries(updates).forEach(([k, v]) => {
      if (v) u.set(k, v);
      else u.delete(k);
    });
    return `/shop?${u.toString()}`;
  };

  const FilterSidebar = () => (
    <div className="rounded-lg border border-[var(--border-light)] bg-white p-4 shadow-sm">
      <h2 className="font-semibold text-[var(--primary)]">Category</h2>
      <ul className="mt-3 space-y-1">
        <li>
          <Link href="/shop" className={`block w-full rounded-lg px-3 py-2 text-left text-sm ${!selectedCategory ? "bg-[var(--primary)] text-white" : "hover:bg-slate-100"}`}>
            All
          </Link>
        </li>
        {categoryList.filter((c) => c.slug).map((cat) => (
          <li key={cat.slug || "all"}>
            <Link
              href={cat.href ?? (cat.slug ? `/shop?category=${cat.slug}` : "/shop")}
              className={`block w-full rounded-lg px-3 py-2 text-left text-sm ${
                selectedCategory === cat.slug ? "bg-[var(--primary)] text-white" : "hover:bg-slate-100"
              }`}
            >
              {cat.name}
            </Link>
          </li>
        ))}
      </ul>
      {brands.length > 0 && (
        <>
          <h2 className="mt-6 font-semibold text-[var(--primary)]">Brand</h2>
          <ul className="mt-3 space-y-1">
            <li>
              <button onClick={() => { setSelectedBrand(""); setPage(1); }} className={`w-full rounded-lg px-3 py-2 text-left text-sm ${!selectedBrand ? "bg-[var(--primary)] text-white" : "hover:bg-slate-100"}`}>All</button>
            </li>
            {brands.map((b) => (
              <li key={b}>
                <button onClick={() => { setSelectedBrand(b); setPage(1); }} className={`w-full rounded-lg px-3 py-2 text-left text-sm ${selectedBrand === b ? "bg-[var(--primary)] text-white" : "hover:bg-slate-100"}`}>{b}</button>
              </li>
            ))}
          </ul>
        </>
      )}
      <h2 className="mt-6 font-semibold text-[var(--primary)]">Price (BDT)</h2>
      <ul className="mt-3 space-y-1">
        <li>
          <button onClick={() => { setSelectedPriceRange(null); setPage(1); }} className={`w-full rounded-lg px-3 py-2 text-left text-sm ${!selectedPriceRange ? "bg-[var(--primary)] text-white" : "hover:bg-slate-100"}`}>All</button>
        </li>
        {priceRanges.map((range) => {
          const isSelected = selectedPriceRange?.min === range.min && selectedPriceRange?.max === range.max;
          return (
            <li key={range.label}>
              <button onClick={() => { setSelectedPriceRange({ min: range.min, max: range.max }); setPage(1); }} className={`w-full rounded-lg px-3 py-2 text-left text-sm ${isSelected ? "bg-[var(--primary)] text-white" : "hover:bg-slate-100"}`}>{range.label}</button>
            </li>
          );
        })}
      </ul>
      <h2 className="mt-6 font-semibold text-[var(--primary)]">Sort</h2>
      <ul className="mt-3 space-y-1">
        <li><button onClick={() => setSort("default")} className={`flex w-full items-center gap-2 rounded-lg px-3 py-2 text-left text-sm ${sort === "default" ? "bg-[var(--primary)] text-white" : "hover:bg-slate-100"}`}><Package className="h-4 w-4" /> Default</button></li>
        <li><button onClick={() => setSort("price-low")} className={`flex w-full items-center gap-2 rounded-lg px-3 py-2 text-left text-sm ${sort === "price-low" ? "bg-[var(--primary)] text-white" : "hover:bg-slate-100"}`}><ArrowDownAZ className="h-4 w-4" /> Price: Low to High</button></li>
        <li><button onClick={() => setSort("price-high")} className={`flex w-full items-center gap-2 rounded-lg px-3 py-2 text-left text-sm ${sort === "price-high" ? "bg-[var(--primary)] text-white" : "hover:bg-slate-100"}`}><ArrowUpAZ className="h-4 w-4" /> Price: High to Low</button></li>
      </ul>
      <h2 className="mt-6 font-semibold text-[var(--primary)]">Availability</h2>
      <ul className="mt-3 space-y-1">
        <li><button onClick={() => setStockFilter("all")} className={`w-full rounded-lg px-3 py-2 text-left text-sm ${stockFilter === "all" ? "bg-[var(--primary)] text-white" : "hover:bg-slate-100"}`}>All</button></li>
        <li><button onClick={() => setStockFilter("in-stock")} className={`flex w-full items-center gap-2 rounded-lg px-3 py-2 text-left text-sm ${stockFilter === "in-stock" ? "bg-[var(--primary)] text-white" : "hover:bg-slate-100"}`}><CheckCircle className="h-4 w-4" /> In Stock</button></li>
      </ul>
    </div>
  );

  return (
    <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
      <h1 className="text-2xl font-bold text-[var(--text-primary)] md:text-3xl">Shop</h1>
      <p className="mt-1 text-sm text-[var(--text-secondary)]">Browse all products. Filter by keyword, category, brand, price, and availability.</p>

      <div className="mt-4">
        <label htmlFor="shop-keyword" className="sr-only">Search products</label>
        <div className="relative">
          <Search className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-slate-400" />
          <input
            id="shop-keyword"
            type="search"
            value={keyword}
            onChange={(e) => { setKeyword(e.target.value); setPage(1); }}
            placeholder="Search by name, description, tags…"
            className="w-full rounded-lg border border-[var(--border-light)] py-2.5 pl-10 pr-4 text-[var(--text-primary)] placeholder-slate-500 focus:border-[var(--primary)] focus:outline-none focus:ring-1 focus:ring-[var(--primary)]"
          />
        </div>
      </div>

      {/* Mobile: sticky sort bar + filter button */}
      <div className="sticky top-[120px] z-30 -mx-4 flex items-center justify-between gap-2 border-b border-[var(--border-light)] bg-white px-4 py-3 sm:-mx-6 sm:px-6 lg:hidden">
        <button
          onClick={() => setFilterDrawerOpen(true)}
          className="flex items-center gap-2 rounded-lg border border-[var(--border-light)] px-4 py-2 text-sm font-medium text-[var(--text-primary)] hover:bg-slate-50"
        >
          <SlidersHorizontal className="h-4 w-4" />
          Filters
        </button>
        <div className="flex gap-2">
          {(["default", "price-low", "price-high"] as const).map((opt) => (
            <button
              key={opt}
              onClick={() => setSort(opt)}
              className={`rounded-lg px-3 py-2 text-sm font-medium ${sort === opt ? "bg-[var(--primary)] text-white" : "bg-slate-100 text-[var(--text-primary)] hover:bg-slate-200"}`}
            >
              {opt === "default" ? "Default" : opt === "price-low" ? "Low" : "High"}
            </button>
          ))}
        </div>
      </div>

      {/* Mobile filter drawer */}
      {filterDrawerOpen && (
        <>
          <div className="fixed inset-0 z-40 bg-black/40 lg:hidden" onClick={() => setFilterDrawerOpen(false)} aria-hidden />
          <aside className="fixed inset-y-0 left-0 z-50 w-full max-w-[300px] overflow-y-auto bg-white shadow-xl lg:hidden">
            <div className="flex items-center justify-between border-b border-[var(--border-light)] px-4 py-4">
              <h2 className="font-semibold text-[var(--text-primary)]">Filters</h2>
              <button onClick={() => setFilterDrawerOpen(false)} className="rounded-lg p-2 hover:bg-slate-100" aria-label="Close">
                <X className="h-5 w-5" />
              </button>
            </div>
            <div className="p-4">
              <FilterSidebar />
            </div>
          </aside>
        </>
      )}

      <div className="mt-6 flex flex-col gap-6 lg:flex-row">
        <aside className="hidden w-full shrink-0 lg:block lg:w-64">
          <FilterSidebar />
        </aside>

        <div className="flex-1">
          <p className="mb-4 text-sm text-[var(--text-secondary)]">
            {(isServerSearch ? searchTotal : filteredAndSorted.length) ?? 0} product
            {((isServerSearch ? searchTotal : filteredAndSorted.length) ?? 0) !== 1 ? "s" : ""}
            {totalPages > 1 && ` · Page ${currentPage} of ${totalPages}`}
          </p>
          <div className="grid grid-cols-2 gap-3 sm:gap-4 md:gap-6 sm:grid-cols-2 xl:grid-cols-3">
            {paginatedProducts.map((product) => (
              <ProductCard key={product.id} product={product as DisplayProduct} showBuyNow />
            ))}
          </div>
          {filteredAndSorted.length === 0 && (
            <p className="py-12 text-center text-gray-500">No products match your filters.</p>
          )}
          {totalPages > 1 && (
            <div className="mt-8 flex flex-wrap items-center justify-center gap-2">
              {isServerSearch && searchQuery ? (
                <>
                  <a
                    href={currentPage <= 1 ? "#" : updateQuery({ page: String(currentPage - 1) })}
                    className={`rounded-lg border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 ${currentPage <= 1 ? "pointer-events-none opacity-50" : ""}`}
                  >
                    Previous
                  </a>
                  {Array.from({ length: Math.min(totalPages, 10) }, (_, i) => {
                    const p = i + 1;
                    return (
                      <a
                        key={p}
                        href={updateQuery({ page: String(p) })}
                        className={`rounded-lg px-4 py-2 text-sm font-medium ${
                          p === currentPage ? "bg-primary text-white" : "border border-gray-300 bg-white text-gray-700 hover:bg-gray-50"
                        }`}
                      >
                        {p}
                      </a>
                    );
                  })}
                  <a
                    href={currentPage >= totalPages ? "#" : updateQuery({ page: String(currentPage + 1) })}
                    className={`rounded-lg border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 ${currentPage >= totalPages ? "pointer-events-none opacity-50" : ""}`}
                  >
                    Next
                  </a>
                </>
              ) : (
                <>
                  <button
                    onClick={() => setPage((p) => Math.max(1, p - 1))}
                    disabled={page === 1}
                    className="rounded-lg border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 disabled:opacity-50 hover:bg-gray-50"
                  >
                    Previous
                  </button>
                  {Array.from({ length: totalPages }, (_, i) => i + 1).map((p) => (
                    <button
                      key={p}
                      onClick={() => setPage(p)}
                      className={`rounded-lg px-4 py-2 text-sm font-medium ${
                        p === page ? "bg-primary text-white" : "border border-gray-300 bg-white text-gray-700 hover:bg-gray-50"
                      }`}
                    >
                      {p}
                    </button>
                  ))}
                  <button
                    onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                    disabled={page === totalPages}
                    className="rounded-lg border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 disabled:opacity-50 hover:bg-gray-50"
                  >
                    Next
                  </button>
                </>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
