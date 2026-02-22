export const dynamic = "force-dynamic";
import Link from "next/link";
import { getProducts } from "@/src/data/provider";
import CategoryClient from "./CategoryClient";
import { getCategoryBySlug, getSubcategoryByFullSlug } from "@/lib/categories-master";
import { getCategoryShortDescription, getCategoryImagePath } from "@/lib/category-meta";

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? "https://citypluspetshop.com";

function normalizeSlug(slug: string | string[]): string {
  return Array.isArray(slug) ? slug.join("/") : slug;
}

function getCategorySlugFromParams(slug: string): string {
  return slug.includes("/") ? slug.split("/")[0]! : slug;
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string | string[] }>;
}) {
  const raw = await params;
  const slug = normalizeSlug(raw.slug);
  const categorySlug = getCategorySlugFromParams(slug);
  const cat = getCategoryBySlug(categorySlug);
  const shortDesc = getCategoryShortDescription(categorySlug);
  const ogImage = getCategoryImagePath(categorySlug);
  const title = cat ? `${cat.name} | City Plus Pet Shop` : "Category | City Plus Pet Shop";
  const description = shortDesc ?? "Shop pet products at City Plus Pet Shop.";
  return {
    title,
    description,
    openGraph: {
      title,
      description,
      images: [{ url: ogImage.startsWith("http") ? ogImage : `${SITE_URL}${ogImage}` }],
    },
  };
}

export default async function CategoryPage({
  params,
}: {
  params: Promise<{ slug: string | string[] }>;
}) {
  const raw = await params;
  const slug = normalizeSlug(raw.slug);
  const products = await getProducts();

  const isSubcategory = slug.includes("/");
  const categorySlug = isSubcategory ? slug.split("/")[0]! : slug;
  const subSlug = isSubcategory ? slug.split("/")[1]! : null;

  const cat = getCategoryBySlug(categorySlug);
  const sub = isSubcategory ? getSubcategoryByFullSlug(slug) : null;

  let categoryProducts = products.filter((p) => p.categorySlug === categorySlug);
  if (sub && subSlug) {
    categoryProducts = categoryProducts.filter(
      (p) =>
        (p as { subcategorySlug?: string }).subcategorySlug === subSlug ||
        (p as { subcategorySlug?: string }).subcategorySlug === slug ||
        p.tags?.includes(subSlug) ||
        p.tags?.includes(slug)
    );
    if (categoryProducts.length === 0) {
      categoryProducts = products.filter((p) => p.categorySlug === categorySlug);
    }
  }

  const categoryName = sub?.name ?? categoryProducts[0]?.category ?? slug.replace(/-/g, " ");

  if (categoryProducts.length === 0 && !cat) {
    return (
      <div className="mx-auto max-w-7xl px-4 py-16 text-center">
        <h1 className="text-2xl font-bold text-gray-900">Category not found</h1>
        <Link href="/shop" className="mt-4 inline-block text-secondary hover:underline">
          Back to Shop
        </Link>
      </div>
    );
  }

  return (
    <CategoryClient
      products={products}
      categoryName={categoryName}
      slug={categorySlug}
      filterProducts={categoryProducts}
    />
  );
}
