"use client";

import { useMemo, useState } from "react";
import { ArrowDownAZ, ArrowUpAZ, Package, CheckCircle } from "lucide-react";
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

export default function CategoryClient({
  products: _allProducts,
  categoryName,
  slug: _slug,
  filterProducts,
}: CategoryClientProps) {
  const [sort, setSort] = useState<SortOption>("default");
  const [stockFilter, setStockFilter] = useState<StockFilter>("all");

  const filteredAndSorted = useMemo(() => {
    let list = filterProducts;
    if (stockFilter === "in-stock") list = list.filter((p) => p.inStock !== false);
    if (sort === "price-low") list = [...list].sort((a, b) => a.price - b.price);
    else if (sort === "price-high") list = [...list].sort((a, b) => b.price - a.price);
    return list;
  }, [filterProducts, sort, stockFilter]);

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
      <div className="mb-8">
        <h1 className="text-2xl font-extrabold text-primary sm:text-3xl lg:text-4xl">{categoryName}</h1>
        <p className="mt-2 max-w-2xl text-sm font-semibold text-gray-700 sm:text-base">Quality products for your pet. Fast delivery across Bangladesh.</p>
      </div>
      <div className="flex flex-col gap-8 lg:flex-row">
        <aside className="w-full shrink-0 lg:w-56">
          <div className="rounded-2xl border border-gray-200 bg-white p-4 shadow-sm">
            <h2 className="font-semibold text-primary">Sort</h2>
            <ul className="mt-3 space-y-2">
              <li><button onClick={() => setSort("default")} className={`flex w-full items-center gap-2 rounded-lg px-3 py-2 text-left text-sm ${sort === "default" ? "bg-primary text-white" : "hover:bg-gray-100"}`}><Package className="h-4 w-4" /> Default</button></li>
              <li><button onClick={() => setSort("price-low")} className={`flex w-full items-center gap-2 rounded-lg px-3 py-2 text-left text-sm ${sort === "price-low" ? "bg-primary text-white" : "hover:bg-gray-100"}`}><ArrowDownAZ className="h-4 w-4" /> Price: Low to High</button></li>
              <li><button onClick={() => setSort("price-high")} className={`flex w-full items-center gap-2 rounded-lg px-3 py-2 text-left text-sm ${sort === "price-high" ? "bg-primary text-white" : "hover:bg-gray-100"}`}><ArrowUpAZ className="h-4 w-4" /> Price: High to Low</button></li>
            </ul>
            <h2 className="mt-6 font-semibold text-primary">Availability</h2>
            <ul className="mt-3 space-y-2">
              <li><button onClick={() => setStockFilter("all")} className={`flex w-full items-center gap-2 rounded-lg px-3 py-2 text-left text-sm ${stockFilter === "all" ? "bg-primary text-white" : "hover:bg-gray-100"}`}>All</button></li>
              <li><button onClick={() => setStockFilter("in-stock")} className={`flex w-full items-center gap-2 rounded-lg px-3 py-2 text-left text-sm ${stockFilter === "in-stock" ? "bg-primary text-white" : "hover:bg-gray-100"}`}><CheckCircle className="h-4 w-4" /> In Stock</button></li>
            </ul>
          </div>
        </aside>
        <div className="flex-1">
          <p className="mb-4 text-sm text-gray-500">{filteredAndSorted.length} product{filteredAndSorted.length !== 1 ? "s" : ""}</p>
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 xl:grid-cols-3">
            {filteredAndSorted.map((product) => (
              <ProductCard key={product.id} product={product as DisplayProduct} />
            ))}
          </div>
          {filteredAndSorted.length === 0 && <p className="py-12 text-center text-gray-500">No products in this category.</p>}
        </div>
      </div>
    </div>
  );
}
