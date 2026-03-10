export const revalidate = 120;

import Link from "next/link";
import NextDynamic from "next/dynamic";
import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { getProductById, getProductBySlug, getRecommendedProducts } from "@/src/data/provider";
import ProductDetailContent from "@/app/product/[id]/ProductDetailContent";
import ProductSchema from "@/components/seo/ProductSchema";
import LazyBelowFold from "@/components/ui/LazyBelowFold";
import { buildProductRoute } from "@/lib/storefront-routes";

const RecommendedProducts = NextDynamic(() => import("@/components/products/RecommendedProducts"), { ssr: true });
const RecentlyViewedProducts = NextDynamic(() => import("@/components/products/RecentlyViewedProducts"), { ssr: true });

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? "https://citypetshop.bd";

async function getProductBySlugOrId(value: string) {
  const bySlug = await getProductBySlug(value);
  if (bySlug) return bySlug;
  return getProductById(value);
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ category: string; subcategory: string; product: string }>;
}): Promise<Metadata> {
  const { product } = await params;
  const found = await getProductBySlugOrId(product);
  if (!found) return { title: "Product Not Found" };
  const canonicalPath = buildProductRoute({
    categorySlug: found.categorySlug,
    subcategorySlug: found.categorySlug,
    slug: found.slug || found.id,
  });
  const title = found.seo?.metaTitle ?? `${found.name} | City Plus Pet Shop`;
  const description = found.seo?.metaDescription ?? found.shortDesc;
  const image = found.images?.[0] ?? found.image;
  return {
    title,
    description,
    openGraph: {
      title,
      description,
      url: `${SITE_URL}${canonicalPath}`,
      images: image ? [image] : undefined,
    },
    alternates: { canonical: `${SITE_URL}${canonicalPath}` },
  };
}

export default async function ProductByHierarchyPage({
  params,
}: {
  params: Promise<{ category: string; subcategory: string; product: string }>;
}) {
  const { category, subcategory, product } = await params;
  const resolved = await getProductBySlugOrId(product);

  if (!resolved) {
    return (
      <div className="mx-auto max-w-7xl px-4 py-16 text-center">
        <h1 className="text-2xl font-bold text-gray-900">Product not found</h1>
        <Link href="/shop" className="mt-4 inline-block text-secondary hover:underline">
          Back to Shop
        </Link>
      </div>
    );
  }

  const canonicalPath = buildProductRoute({
    categorySlug: resolved.categorySlug,
    subcategorySlug: resolved.categorySlug,
    slug: resolved.slug || resolved.id,
  });
  const requestedPath = `/shop/${category}/${subcategory}/${product}`;
  if (requestedPath !== canonicalPath) {
    redirect(canonicalPath);
  }

  const recommended = await getRecommendedProducts(resolved.categorySlug, resolved.id, 4);
  const productUrl = `${SITE_URL}${canonicalPath}`;

  return (
    <>
      <ProductSchema product={resolved} productUrl={productUrl} />
      <ProductDetailContent product={resolved} />
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
