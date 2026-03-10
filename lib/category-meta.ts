/**
 * Category image paths and short SEO descriptions.
 * Images: /public/categories/{slug}.png (fallback to category-1.svg in components).
 * Descriptions: used for category pages when meta is missing.
 */

const CATEGORY_SHORT_DESCRIPTIONS: Record<string, string> = {
  "cat-food": "Premium cat food, litter, toys, and accessories for healthy and happy cats.",
  "cat-litter": "Cat litter, litter boxes, and litter accessories for a clean and odor-free home.",
  "cat-accessories": "Collars, harnesses, grooming tools, bowls, and accessories for your cat.",
  "care-health": "Pet care, health, vitamins, shampoo, flea control, and wellness products.",
  "dog-food": "Quality dog food for adult and puppy nutrition in Bangladesh.",
  "dog-health-accessories": "Dog grooming, harness, leash, shampoo, and health accessories.",
  "bird-food-accessories": "Bird food, feeders, and accessories for your feathered friends.",
  "rabbit-food-accessories": "Rabbit food, hay, and accessories for healthy small pets.",
  "cat-toys": "Toys and scratchers to keep your cat active and entertained.",
  "cat-equipment": "Cat beds, carriers, tents, and travel gear for your cat.",
};

export const CATEGORY_FALLBACK_IMAGE = "/categories/category-1.svg";

/**
 * Image path for a category. Use /public/categories/{slug}.png when file exists;
 * components should use fallbackSrc="/categories/category-1.svg".
 */
export function getCategoryImagePath(slug: string): string {
  return `/categories/${slug}.png`;
}

/**
 * Safe image src that avoids 404/400 from missing files.
 * Returns fallback when slug-specific image may not exist.
 * Add /public/categories/{slug}.png to enable per-category images.
 */
export function getCategoryImageSrc(slug: string): string {
  return CATEGORY_FALLBACK_IMAGE;
}

export function getCategoryShortDescription(slug: string): string | undefined {
  return CATEGORY_SHORT_DESCRIPTIONS[slug];
}

/** All category slugs that have a short description (for meta/OG). */
export function getCategoriesWithMeta(): { slug: string; name: string; shortDescription: string }[] {
  return Object.entries(CATEGORY_SHORT_DESCRIPTIONS).map(([slug, shortDescription]) => ({
    slug,
    name: slug.replace(/-/g, " "),
    shortDescription,
  }));
}
