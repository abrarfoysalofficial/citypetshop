import { Suspense } from "react";
import type { Metadata } from "next";
import { getProducts } from "@/src/data/provider";
import ShopClient from "./ShopClient";

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? "https://citypluspetshop.com";

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

export default async function ShopPage() {
  const products = await getProducts();
  return (
    <Suspense fallback={<ShopFallback />}>
      <ShopClient products={products} />
    </Suspense>
  );
}
