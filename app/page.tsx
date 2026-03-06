// Phase 1: ISR — revalidate every 2 min (no force-dynamic)
export const revalidate = 120;

import {
  getHomeData,
  getFeaturedProducts,
  getFlashSaleProducts,
  getClearanceProducts,
  getComboOffers,
} from "@/src/data/provider";
import { getStorefrontSettings } from "@lib/storefront-settings-server";
import HeroSlider from "@/components/home/HeroSlider";
import CategoryMegaMenu from "@/components/home/CategoryMegaMenu";
import TopSellerCard from "@/components/home/TopSellerCard";
import CategoryChipsRow from "@/components/home/CategoryChipsRow";
import PromoBanners from "@/components/home/PromoBanners";
import PopularCategoryRow from "@/components/home/PopularCategoryRow";
import HomeProductGrid from "@/components/home/HomeProductGrid";
import HomeComboBlock from "@/components/home/HomeComboBlock";
import nextDynamic from "next/dynamic";
import LazyBelowFold from "@/components/ui/LazyBelowFold";

const FeaturedBrandsSlider = nextDynamic(() => import("@/components/home/FeaturedBrandsSlider"), { ssr: true });
const HomeReviewSection = nextDynamic(() => import("@/components/home/HomeReviewSection"), { ssr: true });
import DiscountStrip from "@/components/home/DiscountStrip";
import TrustBar from "@/components/home/TrustBar";
import WhyChooseUs from "@/components/home/WhyChooseUs";
import type { DisplayProduct } from "@/components/ProductCard";

async function getHomepageData() {
  const storefrontSettings = await getStorefrontSettings();
  const [homeData, clearanceProducts, comboOffers] = await Promise.all([
    getHomeData(),
    getClearanceProducts(8),
    getComboOffers(),
  ]);

  const featuredBlock = storefrontSettings.homepageBlocks.find((b) => b.type === "featured");
  const featuredProductIds = featuredBlock?.featuredProductIds;
  const featuredProducts =
    featuredProductIds && featuredProductIds.length > 0
      ? await (await import("@/src/data/provider")).getProductsByIds(featuredProductIds)
      : await getFeaturedProducts();

  const flashSaleProducts = await getFlashSaleProducts(8);

  return { storefrontSettings, homeData, featuredProducts, flashSaleProducts, clearanceProducts, comboOffers };
}

function mapToDisplayProduct(p: {
  id: string;
  name: string;
  price: number;
  categorySlug: string;
  images?: string[];
  image?: string;
  comparePrice?: number;
  shortDesc?: string;
  inStock?: boolean;
  tags?: string[];
  rating?: number;
}): DisplayProduct {
  return {
    id: p.id,
    name: p.name,
    price: p.price,
    categorySlug: p.categorySlug,
    images: p.images,
    image: p.images?.[0] ?? p.image,
    comparePrice: p.comparePrice,
    shortDesc: p.shortDesc,
    inStock: p.inStock,
    tags: p.tags,
    rating: p.rating,
  };
}

export default async function HomePage() {
  const { storefrontSettings, homeData, featuredProducts, flashSaleProducts, clearanceProducts, comboOffers } =
    await getHomepageData();

  const heroSlides = homeData.heroSlides.map((s, i) => ({
    id: s.id,
    title: i === 0 ? "Premium Pet Care Starts Here" : s.title,
    subheadline: i === 0 ? "Authentic Dog & Cat Food | Trusted Accessories | Fast Delivery Across Bangladesh" : (s.subheadline ?? ""),
    image: s.image,
    href: s.href,
    cta: s.cta ?? "Shop Now",
    discountText: i === 0 ? undefined : "SAVE UP 30%",
  }));

  const featuredDisplay: DisplayProduct[] = featuredProducts
    .slice(0, 8)
    .map(mapToDisplayProduct);
  const flashSaleDisplay: DisplayProduct[] = flashSaleProducts.map(
    mapToDisplayProduct
  );
  const clearanceDisplay: DisplayProduct[] = clearanceProducts.map(
    mapToDisplayProduct
  );

  const { homepageBlocks } = storefrontSettings;

  return (
    <div className="min-h-screen bg-[var(--bg-page)]">
      {/* 3-column grid: Categories | Hero | Top Sellers */}
      <section className="border-b border-[var(--border-light)] bg-white py-4 md:py-6">
        <div className="mx-auto max-w-7xl px-3 md:px-6 lg:px-8">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-stretch lg:gap-6">
            <div className="hidden shrink-0 lg:block">
              <CategoryMegaMenu />
            </div>
            <div className="min-w-0 flex-1">
              <HeroSlider slides={heroSlides} />
            </div>
            <div className="shrink-0 lg:w-72">
              <TopSellerCard products={featuredDisplay.slice(0, 6)} />
            </div>
          </div>
        </div>
      </section>

      {/* Category chips (mobile) */}
      <CategoryChipsRow />

      {/* Trust badges row */}
      <TrustBar />

      {/* Promo banners */}
      <PromoBanners />

      {/* Shop by Category tiles */}
      <PopularCategoryRow />

      {/* Dynamic homepage blocks (order + enable/disable from Admin) */}
      {homepageBlocks.map((block) => {
        if (block.type === "featured") {
          return (
            <HomeProductGrid
              key={block.id}
              products={featuredDisplay}
              title={block.titleEn ?? "Most Popular Products"}
              subtitle={block.subtitle ?? "Bestsellers and new arrivals for your pets."}
            />
          );
        }
        if (block.type === "featured_brands") {
          return (
            <LazyBelowFold key={block.id}>
              <FeaturedBrandsSlider />
            </LazyBelowFold>
          );
        }
        if (block.type === "flash_sale") {
          return (
            <HomeProductGrid
              key={block.id}
              products={flashSaleDisplay}
              title={block.titleEn ?? "Flash Sale"}
              subtitle={block.subtitle ?? "Limited time offers."}
            />
          );
        }
        if (block.type === "clearance") {
          return (
            <HomeProductGrid
              key={block.id}
              products={clearanceDisplay}
              title={block.titleEn ?? "Clearance"}
              subtitle={block.subtitle ?? "Great deals while stocks last."}
            />
          );
        }
        if (block.type === "combo_offers") {
          return (
            <HomeComboBlock
              key={block.id}
              combos={comboOffers}
              title={block.titleEn ?? "Combo Offers"}
              subtitle={block.subtitle ?? "Bundle and save."}
            />
          );
        }
        if (block.type === "reviews") {
          return (
            <LazyBelowFold key={block.id}>
              <HomeReviewSection
                title={block.titleEn ?? "Customer Reviews"}
                subtitle={block.subtitle ?? "What our customers say."}
              />
            </LazyBelowFold>
          );
        }
        return null;
      })}
      <WhyChooseUs />
      <DiscountStrip />
    </div>
  );
}
