// Phase 1: ISR — revalidate every 5 min
export const revalidate = 300;

import { Suspense } from "react";
import type { Metadata } from "next";
import { getProducts, searchProducts } from "@/src/data/provider";
import ShopClient from "./ShopClient";

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? "https://citypetshop.bd";

export const metadata: Metadata = {
  title: "Shop | City Plus Pet Shop",
  description: "Browse premium pet food, accessories, toys, and care products. Fast delivery across Bangladesh.",
  openGraph: { url: `${SITE_URL}/shop`, title: "Shop | City Plus Pet Shop", description: "Browse premium pet food and accessories." },
  alternates: { canonical: `${SITE_URL}/shop` },
};

function ShopFallback() {
  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
      <div className="h-8 w-48 animate-pulse rounded bg-slate-200" />
      <div className="mt-4 h-4 w-96 animate-pulse rounded bg-slate-100" />
      <div className="mt-8 grid grid-cols-2 gap-4 sm:grid-cols-3 md:gap-6">
        {Array.from({ length: 6 }).map((_, i) => (
          <div key={i} className="h-72 animate-pulse rounded-xl bg-slate-100" />
        ))}
      </div>
    </div>
  );
}

const SHOP_PAGE_LIMIT = 48;

type ShopPageProps = { searchParams: Promise<{ q?: string; category?: string; page?: string }> };

export default async function ShopPage({ searchParams }: ShopPageProps) {
  const params = await searchParams;
  const searchQ = params.q?.trim();
  const categorySlug = params.category?.trim();
  const page = Math.max(1, parseInt(params.page ?? "1", 10) || 1);

  let products: Awaited<ReturnType<typeof getProducts>>;
  let total = 0;
  let isSearch = false;

  if (searchQ) {
    isSearch = true;
    const result = await searchProducts(searchQ, SHOP_PAGE_LIMIT, page);
    products = result.products;
    total = result.total;
  } else {
    products = await getProducts({ limit: SHOP_PAGE_LIMIT, categorySlug: categorySlug || undefined });
  }

  return (
    <Suspense fallback={<ShopFallback />}>
      <ShopClient
        products={products}
        searchTotal={isSearch ? total : undefined}
        searchPage={isSearch ? page : undefined}
        searchQuery={searchQ || undefined}
      />
    </Suspense>
  );
}
