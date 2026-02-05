import type { HomeSection, HeroSlide, FeaturedCategory, Brand, FlashSaleBanner } from "../types";
import { unsplash, FALLBACK_HERO, FALLBACK_CATEGORY } from "./constants";

const heroSlides: HeroSlide[] = [
  {
    id: "1",
    title: "Big Sale on Cat Food",
    subheadline: "Up to 25% off on selected Whiskas & SmartHeart",
    image: unsplash.heroCat || FALLBACK_HERO,
    href: "/category/cat-food",
    cta: "Shop Now",
  },
  {
    id: "2",
    title: "New Toys Arrival",
    subheadline: "Scratching posts, squeaky toys & puzzle feeders",
    image: unsplash.heroToys || FALLBACK_HERO,
    href: "/category/toys-scratchers",
    cta: "Explore",
  },
  {
    id: "3",
    title: "Premium Dog Food",
    subheadline: "Chicken & rice formula for adult dogs",
    image: unsplash.heroDog || FALLBACK_HERO,
    href: "/category/dog-food",
    cta: "Shop Now",
  },
  {
    id: "4",
    title: "Flash Sale This Week",
    subheadline: "Extra 15% on combos — limited time",
    image: unsplash.heroSale || FALLBACK_HERO,
    href: "/combo-offers",
    cta: "Grab Deal",
  },
];

const featuredCategories: FeaturedCategory[] = [
  { slug: "dog-food", name: "Dog Food", image: unsplash.categoryDog || FALLBACK_CATEGORY, href: "/category/dog-food" },
  { slug: "cat-food", name: "Cat Food", image: unsplash.categoryCat || FALLBACK_CATEGORY, href: "/category/cat-food" },
  { slug: "litter-accessories", name: "Cat Litter", image: unsplash.categoryLitter || FALLBACK_CATEGORY, href: "/category/litter-accessories" },
  { slug: "dog-food", name: "Treats", image: unsplash.categoryTreats || FALLBACK_CATEGORY, href: "/shop?category=dog-food" },
  { slug: "health-medicine", name: "Grooming", image: unsplash.categoryGrooming || FALLBACK_CATEGORY, href: "/category/health-medicine" },
  { slug: "litter-accessories", name: "Accessories", image: unsplash.categoryAccessories || FALLBACK_CATEGORY, href: "/category/litter-accessories" },
];

const featuredBrands: Brand[] = [
  { id: "1", name: "Whiskas", slug: "whiskas" },
  { id: "2", name: "Pedigree", slug: "pedigree" },
  { id: "3", name: "Drools", slug: "drools" },
  { id: "4", name: "SmartHeart", slug: "smartheart" },
  { id: "5", name: "Himalaya", slug: "himalaya" },
  { id: "6", name: "Me-O", slug: "me-o" },
  { id: "7", name: "Nutri-Vet", slug: "nutri-vet" },
  { id: "8", name: "City Plus", slug: "city-plus" },
];

const flashSale: FlashSaleBanner = {
  image: unsplash.heroSale || FALLBACK_HERO,
  title: "Flash Sale",
  subheadline: "Up to 30% Off",
  endTime: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
  href: "/offers",
  cta: "Shop Now",
};

const sideBanners = [
  {
    id: "1",
    title: "Vet Service",
    subtitle: "Call Now",
    image: unsplash.heroCat || FALLBACK_HERO,
    href: "/contact",
    cta: "Book Now",
  },
  {
    id: "2",
    title: "Flash Sale",
    subtitle: "Up to 30% Off",
    image: unsplash.heroSale || FALLBACK_HERO,
    href: "/offers",
    cta: "Shop Now",
  },
];

export async function getHomeData(): Promise<HomeSection> {
  return {
    heroSlides,
    featuredCategories,
    featuredBrands,
    flashSale,
    sideBanners,
  };
}
