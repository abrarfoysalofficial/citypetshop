/**
 * Master category + subcategory data. Admin/CMS editable in production.
 * Slugs: kebab-case. Subcategory slugs are nested-friendly.
 */

export interface SubcategoryItem {
  slug: string;
  name: string;
  fullSlug: string; // e.g. "cat-accessories/neck-belt-collar"
}

export interface CategoryItem {
  slug: string;
  name: string;
  subcategories: SubcategoryItem[];
}

export const MASTER_CATEGORIES: CategoryItem[] = [
  {
    slug: "cat-accessories",
    name: "Cat Accessories",
    subcategories: [
      { slug: "neck-belt-collar", name: "Neck Belt & Collar", fullSlug: "cat-accessories/neck-belt-collar" },
      { slug: "harness-leash", name: "Harness & Leash", fullSlug: "cat-accessories/harness-leash" },
      { slug: "grooming-brush-comb", name: "Grooming Brush & Comb", fullSlug: "cat-accessories/grooming-brush-comb" },
      { slug: "nail-cutter", name: "Nail Cutter", fullSlug: "cat-accessories/nail-cutter" },
      { slug: "food-bowl", name: "Food Bowl", fullSlug: "cat-accessories/food-bowl" },
      { slug: "surgery-collar", name: "Surgery Collar", fullSlug: "cat-accessories/surgery-collar" },
    ],
  },
  {
    slug: "care-health",
    name: "Care & Health",
    subcategories: [
      { slug: "antifungal-antibacterial", name: "Antifungal and Antibacterial Solutions", fullSlug: "care-health/antifungal-antibacterial" },
      { slug: "vitamins-supplements", name: "Vitamins & Supplements", fullSlug: "care-health/vitamins-supplements" },
      { slug: "bioline-family", name: "Bioline Family", fullSlug: "care-health/bioline-family" },
      { slug: "cat-feeding-tools", name: "Cat Feeding Tools", fullSlug: "care-health/cat-feeding-tools" },
      { slug: "bathing-shampoo", name: "Bathing & Shampoo", fullSlug: "care-health/bathing-shampoo" },
      { slug: "cat-cleanup-odor-control", name: "Cat Cleanup & Odor Control", fullSlug: "care-health/cat-cleanup-odor-control" },
      { slug: "cat-grass-kit", name: "Cat Grass Kit", fullSlug: "care-health/cat-grass-kit" },
      { slug: "cat-grooming", name: "Cat Grooming", fullSlug: "care-health/cat-grooming" },
      { slug: "cat-nip", name: "Cat Nip", fullSlug: "care-health/cat-nip" },
      { slug: "cat-tick-flea-control", name: "Cat Tick & Flea Control", fullSlug: "care-health/cat-tick-flea-control" },
      { slug: "deworming-medicine", name: "Deworming Medicine", fullSlug: "care-health/deworming-medicine" },
      { slug: "milk-replacer", name: "Milk Replacer", fullSlug: "care-health/milk-replacer" },
    ],
  },
  {
    slug: "cat-toys",
    name: "Cat Toys",
    subcategories: [],
  },
  {
    slug: "cat-litter",
    name: "Cat Litter",
    subcategories: [
      { slug: "cat-litter-accessories", name: "Cat Litter Accessories", fullSlug: "cat-litter/cat-litter-accessories" },
      { slug: "cat-litter-box", name: "Cat Litter Box", fullSlug: "cat-litter/cat-litter-box" },
      { slug: "clumping-cat-litter", name: "Clumping Cat Litter", fullSlug: "cat-litter/clumping-cat-litter" },
    ],
  },
  {
    slug: "cat-food",
    name: "Cat Food",
    subcategories: [
      { slug: "adult-food", name: "Adult Food", fullSlug: "cat-food/adult-food" },
      { slug: "kitten-food", name: "Kitten Food", fullSlug: "cat-food/kitten-food" },
      { slug: "canned-food", name: "Canned Food", fullSlug: "cat-food/canned-food" },
      { slug: "cat-dry-food", name: "Cat Dry Food", fullSlug: "cat-food/cat-dry-food" },
      { slug: "cat-pouches", name: "Cat Pouches", fullSlug: "cat-food/cat-pouches" },
      { slug: "cat-treats", name: "Cat Treats", fullSlug: "cat-food/cat-treats" },
      { slug: "cat-wet-food", name: "Cat Wet Food", fullSlug: "cat-food/cat-wet-food" },
      { slug: "repack-cat-food", name: "Repack Cat Food", fullSlug: "cat-food/repack-cat-food" },
    ],
  },
  {
    slug: "cat-equipment",
    name: "Cat Equipment",
    subcategories: [
      { slug: "tent-house", name: "Tent House", fullSlug: "cat-equipment/tent-house" },
      { slug: "house-bed", name: "House & Bed", fullSlug: "cat-equipment/house-bed" },
      { slug: "cat-tshirt-dress", name: "Cat Tshirt & Dress", fullSlug: "cat-equipment/cat-tshirt-dress" },
      { slug: "carrier-bag-basket", name: "Carrier Bag & Basket", fullSlug: "cat-equipment/carrier-bag-basket" },
    ],
  },
  {
    slug: "dog-food",
    name: "Dog Food",
    subcategories: [
      { slug: "dog-adult-food", name: "Dog Adult Food", fullSlug: "dog-food/dog-adult-food" },
      { slug: "puppy-food", name: "Puppy Food", fullSlug: "dog-food/puppy-food" },
      { slug: "dog-vitamin-supplements", name: "Vitamin & Supplements", fullSlug: "dog-food/dog-vitamin-supplements" },
    ],
  },
  {
    slug: "dog-health-accessories",
    name: "Dog Health & Accessories",
    subcategories: [
      { slug: "dog-antifungal-antibacterial", name: "Dog Antifungal and Antibacterial Control", fullSlug: "dog-health-accessories/dog-antifungal-antibacterial" },
      { slug: "dog-harness-leash-grooming", name: "Dog Harness, Leash & Grooming", fullSlug: "dog-health-accessories/dog-harness-leash-grooming" },
      { slug: "dog-shampoo", name: "Dog Shampoo", fullSlug: "dog-health-accessories/dog-shampoo" },
      { slug: "dog-toy", name: "Dog Toy", fullSlug: "dog-health-accessories/dog-toy" },
    ],
  },
  {
    slug: "bird-food-accessories",
    name: "Bird Food & Accessories",
    subcategories: [],
  },
  {
    slug: "rabbit-food-accessories",
    name: "Rabbit Food & Accessories",
    subcategories: [
      { slug: "rabbit-accessories", name: "Rabbit Accessories", fullSlug: "rabbit-food-accessories/rabbit-accessories" },
      { slug: "rabbit-adult-food", name: "Rabbit Adult Food", fullSlug: "rabbit-food-accessories/rabbit-adult-food" },
      { slug: "rabbit-junior-food", name: "Rabbit Junior Food", fullSlug: "rabbit-food-accessories/rabbit-junior-food" },
    ],
  },
];

export function getCategoryBySlug(slug: string): CategoryItem | undefined {
  return MASTER_CATEGORIES.find((c) => c.slug === slug);
}

export function getSubcategoryByFullSlug(fullSlug: string): SubcategoryItem | undefined {
  for (const cat of MASTER_CATEGORIES) {
    const sub = cat.subcategories.find((s) => s.fullSlug === fullSlug);
    if (sub) return sub;
  }
  return undefined;
}
