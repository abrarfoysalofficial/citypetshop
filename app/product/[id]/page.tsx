export const revalidate = 120;

import { redirect } from "next/navigation";
import { getProductById } from "@/src/data/provider";
import { buildProductRoute } from "@/lib/storefront-routes";

export default async function LegacyProductPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const product = await getProductById(id);
  if (!product) redirect("/shop");
  redirect(
    buildProductRoute({
      categorySlug: product.categorySlug,
      subcategorySlug: product.categorySlug,
      slug: product.slug || product.id,
    })
  );
}
