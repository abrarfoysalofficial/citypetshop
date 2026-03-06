"use client";

import { useEffect, useState } from "react";
import { getRecentlyViewed } from "@lib/recently-viewed";
import ProductCard from "@/components/ProductCard";
import type { DisplayProduct } from "@/components/ProductCard";
import type { Product } from "@/src/data/types";

function toDisplayProduct(p: Product): DisplayProduct {
  return {
    id: p.id,
    name: p.name,
    price: p.price,
    categorySlug: p.categorySlug,
    images: p.images,
    image: p.images?.[0] ?? p.image,
    comparePrice: p.comparePrice,
    shortDesc: p.shortDesc,
    inStock: p.inStock,
    tags: p.tags,
    rating: p.rating,
  };
}

export default function RecentlyViewedProducts() {
  const [products, setProducts] = useState<DisplayProduct[]>([]);

  useEffect(() => {
    const entries = getRecentlyViewed();
    if (entries.length === 0) {
      setProducts([]);
      return;
    }
    const ids = entries.map((e) => e.id).join(",");
    fetch(`/api/products/by-ids?ids=${encodeURIComponent(ids)}`)
      .then((res) => res.json())
      .then((data: { products: Product[] }) => {
        const order = entries.map((e) => e.id);
        const byId = new Map(data.products.map((p) => [p.id, p]));
        const ordered = order
          .map((id) => byId.get(id))
          .filter(Boolean) as Product[];
        setProducts(ordered.map(toDisplayProduct));
      })
      .catch(() => setProducts([]));
  }, []);

  if (products.length === 0) return null;

  return (
    <section className="py-12 sm:py-16">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <h2 className="text-2xl font-extrabold text-slate-900">Recently Viewed</h2>
        <p className="mt-2 text-slate-600">Pick up where you left off.</p>
        <div className="mt-6 grid grid-cols-2 gap-4 sm:grid-cols-3 sm:gap-6 lg:grid-cols-4">
          {products.map((p) => (
            <ProductCard key={p.id} product={p} />
          ))}
        </div>
      </div>
    </section>
  );
}
