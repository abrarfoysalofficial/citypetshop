type ProductRouteInput = {
  id?: string;
  slug?: string;
  categorySlug?: string;
  subcategorySlug?: string;
};

function cleanSegment(value: string | undefined, fallback: string): string {
  if (!value || !value.trim()) return fallback;
  return encodeURIComponent(value.trim().toLowerCase());
}

/**
 * Canonical storefront product route:
 * /shop/{category}/{subcategory}/{product}
 */
export function buildProductRoute(input: ProductRouteInput): string {
  const category = cleanSegment(input.categorySlug, "general");
  const subcategory = cleanSegment(input.subcategorySlug ?? input.categorySlug, "general");
  const product = cleanSegment(input.slug ?? input.id, "item");
  return `/shop/${category}/${subcategory}/${product}`;
}
