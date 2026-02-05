import { CategoryItem, Product } from "./types";

const PLACEHOLDER = "/products/placeholder.webp";

/** JustPetBD-style categories with subcategories */
export const categories: CategoryItem[] = [
  {
    slug: "cat-food",
    name: "Cat Food",
    subcategories: ["Dry Food", "Wet Food"],
  },
  {
    slug: "dog-food",
    name: "Dog Food",
    subcategories: ["Dry Food", "Wet Food", "Treats"],
  },
  {
    slug: "litter-accessories",
    name: "Litter & Accessories",
    subcategories: ["Litter Sand", "Trays", "Scoops"],
  },
  {
    slug: "health-medicine",
    name: "Health & Medicine",
    subcategories: ["Vitamins", "Supplements", "Shampoos"],
  },
  {
    slug: "toys-scratchers",
    name: "Toys & Scratchers",
  },
  {
    slug: "bird-rabbit-supplies",
    name: "Bird & Rabbit Supplies",
  },
];

/** Navbar category links (slug + label) */
export const navCategories = [
  { slug: "cat-food", name: "Cat Food" },
  { slug: "dog-food", name: "Dog Food" },
  { slug: "litter-accessories", name: "Litter" },
  { slug: "health-medicine", name: "Medicine" },
  { slug: "toys-scratchers", name: "Toys & Scratchers" },
  { slug: "bird-rabbit-supplies", name: "Bird & Rabbit" },
];

export function getCategoryBySlug(slug: string): CategoryItem | undefined {
  return categories.find((c) => c.slug === slug);
}

/** All products (BDT). 15–20 diverse items mapped to categories above. */
export const products: Product[] = [
  // Cat Food
  {
    id: "1",
    name: "Whiskas Ocean Fish 1.2kg",
    price: 480,
    description: "Complete nutrition for adult cats. Ocean fish flavour. Tasty and balanced.",
    categorySlug: "cat-food",
    image: PLACEHOLDER,
    inStock: true,
  },
  {
    id: "2",
    name: "SmartHeart Adult Cat Food 1kg",
    price: 450,
    description: "Premium cat food with essential vitamins and minerals for a healthy coat.",
    categorySlug: "cat-food",
    image: PLACEHOLDER,
    inStock: true,
  },
  {
    id: "3",
    name: "Me-O Creamy Treats",
    price: 300,
    description: "Delicious creamy treats that cats love. Grain-free and healthy.",
    categorySlug: "cat-food",
    image: PLACEHOLDER,
    inStock: true,
  },
  {
    id: "4",
    name: "Whiskas Wet Food Pouch 12x85g",
    price: 520,
    description: "Wet food variety pack. Tuna and chicken flavours for adult cats.",
    categorySlug: "cat-food",
    image: PLACEHOLDER,
    inStock: true,
  },
  // Dog Food
  {
    id: "5",
    name: "Pedigree Adult Dog Food 3kg",
    price: 890,
    description: "Complete nutrition for adult dogs. Chicken flavour. Essential nutrients.",
    categorySlug: "dog-food",
    image: PLACEHOLDER,
    inStock: true,
  },
  {
    id: "6",
    name: "Drools Puppy Dry Food 1kg",
    price: 550,
    description: "Formulated for puppies up to 12 months. Supports growth and immunity.",
    categorySlug: "dog-food",
    image: PLACEHOLDER,
    inStock: true,
  },
  {
    id: "7",
    name: "Dog Treats Chicken Sticks 200g",
    price: 280,
    description: "Crunchy chicken-flavoured treats. Perfect for training and rewards.",
    categorySlug: "dog-food",
    image: PLACEHOLDER,
    inStock: true,
  },
  // Litter & Accessories
  {
    id: "8",
    name: "Golden Cat Litter 5L",
    price: 350,
    description: "Clumping litter. Odour control. Safe for cats and kittens.",
    categorySlug: "litter-accessories",
    image: PLACEHOLDER,
    inStock: true,
  },
  {
    id: "9",
    name: "Bentonite Cat Litter 10L",
    price: 650,
    description: "Premium bentonite litter. Long-lasting odour control. Low dust.",
    categorySlug: "litter-accessories",
    image: PLACEHOLDER,
    inStock: true,
  },
  {
    id: "10",
    name: "Cat Litter Tray with Scoop",
    price: 420,
    description: "Durable plastic tray with high sides. Includes scoop. Easy to clean.",
    categorySlug: "litter-accessories",
    image: PLACEHOLDER,
    inStock: true,
  },
  {
    id: "11",
    name: "Cat Harness & Leash Set",
    price: 450,
    description: "Adjustable harness and leash for cats. Escape-proof. Reflective strip.",
    categorySlug: "litter-accessories",
    image: PLACEHOLDER,
    inStock: true,
  },
  {
    id: "12",
    name: "Portable Pet Water Bottle",
    price: 600,
    description: "Leak-proof travel water bottle with attached bowl. For dogs and cats.",
    categorySlug: "litter-accessories",
    image: PLACEHOLDER,
    inStock: true,
  },
  // Health & Medicine
  {
    id: "13",
    name: "Himalaya Erina-EP Shampoo 200ml",
    price: 350,
    description: "Gentle anti-tick shampoo for dogs and cats. Herbal. Soothing for skin.",
    categorySlug: "health-medicine",
    image: PLACEHOLDER,
    inStock: true,
  },
  {
    id: "14",
    name: "Nutri-Vet Multi-Vite 60 tablets",
    price: 1200,
    description: "Multivitamin supplement for dogs and cats. Supports immunity and coat.",
    categorySlug: "health-medicine",
    image: PLACEHOLDER,
    inStock: true,
  },
  {
    id: "15",
    name: "Pet Calming Supplement 30ml",
    price: 480,
    description: "Natural calming drops for anxious pets. Travel and thunderstorm support.",
    categorySlug: "health-medicine",
    image: PLACEHOLDER,
    inStock: true,
  },
  // Toys & Scratchers
  {
    id: "16",
    name: "Cat Scratching Post with Toy",
    price: 750,
    description: "Sisal-wrapped post with hanging toy. Saves furniture. Sturdy base.",
    categorySlug: "toys-scratchers",
    image: PLACEHOLDER,
    inStock: true,
  },
  {
    id: "17",
    name: "Plush Squeaky Dog Toy Set",
    price: 380,
    description: "Set of 3 plush squeaky toys. Perfect for fetch and chewing.",
    categorySlug: "toys-scratchers",
    image: PLACEHOLDER,
    inStock: true,
  },
  {
    id: "18",
    name: "Interactive Puzzle Feeder",
    price: 520,
    description: "Stimulates your pet's mind while slowing down eating. Dishwasher safe.",
    categorySlug: "toys-scratchers",
    image: PLACEHOLDER,
    inStock: true,
  },
  // Bird & Rabbit Supplies
  {
    id: "19",
    name: "Bird Seed Mix 500g",
    price: 220,
    description: "Nutritious seed mix for parakeets and small birds. No additives.",
    categorySlug: "bird-rabbit-supplies",
    image: PLACEHOLDER,
    inStock: true,
  },
  {
    id: "20",
    name: "Rabbit Hay 1kg",
    price: 180,
    description: "Fresh hay for rabbits. Supports digestion and dental health.",
    categorySlug: "bird-rabbit-supplies",
    image: PLACEHOLDER,
    inStock: true,
  },
];

/** Featured product IDs for homepage */
export const featuredProductIds = ["1", "2", "8", "11"];
