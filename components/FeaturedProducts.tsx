"use client";

import Link from "next/link";
import { useProducts } from "@/context/ProductsContext";
import { featuredProductIds } from "@/lib/data";
import ProductCard from "@/components/ProductCard";
import type { DisplayProduct } from "@/components/ProductCard";

interface FeaturedProductsProps {
  /** When provided (from provider), use these; otherwise use context + featuredProductIds */
  products?: DisplayProduct[];
}

export default function FeaturedProducts({ products: propProducts }: FeaturedProductsProps) {
  const { products: contextProducts } = useProducts();
  const products =
    propProducts && propProducts.length > 0
      ? propProducts
      : contextProducts
          .filter((p) => featuredProductIds.includes(p.id))
          .map((p) => ({ ...p, image: (p as { image?: string }).image }));

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
          className="inline-flex rounded-lg border-2 border-primary px-6 py-2.5 text-sm font-bold text-primary transition-colors hover:bg-primary hover:text-white sm:text-base"
        >
          View All Products
        </Link>
      </div>
    </>
  );
}
