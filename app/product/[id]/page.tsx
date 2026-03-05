// Phase 1: ISR — revalidate every 2 min
export const revalidate = 120;

import Link from "next/link";
import NextDynamic from "next/dynamic";
import type { Metadata } from "next";
import { getProductById, getRecommendedProducts } from "@/src/data/provider";
import ProductDetailContent from "./ProductDetailContent";
import ProductSchema from "@/components/seo/ProductSchema";
import LazyBelowFold from "@/components/ui/LazyBelowFold";

const RecommendedProducts = NextDynamic(() => import("@/components/products/RecommendedProducts"), { ssr: true });
const RecentlyViewedProducts = NextDynamic(() => import("@/components/products/RecentlyViewedProducts"), { ssr: true });

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? "https://citypetshop.bd";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ id: string }>;
}): Promise<Metadata> {
  const { id } = await params;
  const product = await getProductById(id);
  if (!product) return { title: "Product Not Found" };
  const title = product.seo?.metaTitle ?? `${product.name} | City Plus Pet Shop`;
  const description = product.seo?.metaDescription ?? product.shortDesc;
  const image = product.images?.[0] ?? product.image;
  return {
    title,
    description,
    openGraph: {
      title,
      description,
      url: `${SITE_URL}/product/${id}`,
      images: image ? [image] : undefined,
    },
    alternates: { canonical: `${SITE_URL}/product/${id}` },
  };
}

export default async function ProductPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const [product, recommended] = await Promise.all([
    getProductById(id),
    getProductById(id).then((p) =>
      p ? getRecommendedProducts(p.categorySlug, p.id, 4) : []
    ),
  ]);

  if (!product) {
    return (
      <div className="mx-auto max-w-7xl px-4 py-16 text-center">
        <h1 className="text-2xl font-bold text-gray-900">Product not found</h1>
        <Link href="/shop" className="mt-4 inline-block text-secondary hover:underline">
          Back to Shop
        </Link>
      </div>
    );
  }

  const productUrl = `${SITE_URL}/product/${id}`;
  return (
    <>
      <ProductSchema product={product} productUrl={productUrl} />
      <ProductDetailContent product={product} />
      <LazyBelowFold>
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <RecommendedProducts products={recommended} />
        </div>
      </LazyBelowFold>
      <LazyBelowFold>
        <RecentlyViewedProducts />
      </LazyBelowFold>
    </>
  );
}
