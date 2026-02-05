import { redirect } from "next/navigation";

export default async function ShopSlugPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  // Product details are at /product/[id]. If slug is numeric (product id), redirect there.
  if (/^\d+$/.test(slug)) redirect(`/product/${slug}`);
  // Otherwise treat as product slug when products have slug field; for now redirect to shop.
  redirect("/shop");
}
