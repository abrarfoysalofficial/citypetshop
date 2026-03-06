"use client";

import Link from "next/link";
import ProductCard from "@/components/ProductCard";
import type { DisplayProduct } from "@/components/ProductCard";

interface FeaturedProductsProps {
  /** Products to display. Must be passed from server (DB-backed). No lib/data fallback. */
  products?: DisplayProduct[];
}

export default function FeaturedProducts({ products: propProducts }: FeaturedProductsProps) {
  const products = propProducts ?? [];

  return (
    <>
      <div className="mt-10 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
        {products.map((product) => (
          <ProductCard key={product.id} product={product as DisplayProduct} />
        ))}
      </div>
      <div className="mt-10 text-center">
        <Link
          href="/shop"
          className="inline-flex rounded-lg border-2 border-primary-900 px-6 py-2.5 text-sm font-bold text-primary-900 transition-colors hover:bg-primary-900 hover:text-primary-foreground sm:text-base"
        >
          View All Products
        </Link>
      </div>
    </>
  );
}
