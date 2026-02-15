import {
  getHomeData,
  getFeaturedProducts,
  getFlashSaleProducts,
  getClearanceProducts,
  getComboOffers,
} from "@/src/data/provider";
import { getStorefrontSettings } from "@/lib/storefront-settings-server";
import HeroSlider from "@/components/home/HeroSlider";
import CategoryMegaMenu from "@/components/home/CategoryMegaMenu";
import TopSellerCard from "@/components/home/TopSellerCard";
import PromoBanners from "@/components/home/PromoBanners";
import PopularCategoryRow from "@/components/home/PopularCategoryRow";
import HomeProductGrid from "@/components/home/HomeProductGrid";
import HomeComboBlock from "@/components/home/HomeComboBlock";
import nextDynamic from "next/dynamic";
import LazyBelowFold from "@/components/ui/LazyBelowFold";

const FeaturedBrandsSlider = nextDynamic(() => import("@/components/home/FeaturedBrandsSlider"), { ssr: true });
const HomeReviewSection = nextDynamic(() => import("@/components/home/HomeReviewSection"), { ssr: true });
import DiscountStrip from "@/components/home/DiscountStrip";
import type { DisplayProduct } from "@/components/ProductCard";

export const dynamic = "force-dynamic";

async function getHomepageData() {
  const [storefrontSettings, homeData, featuredProducts, flashSaleProducts, clearanceProducts, comboOffers] =
    await Promise.all([
      getStorefrontSettings(),
      getHomeData(),
      getFeaturedProducts(),
      getFlashSaleProducts(8),
      getClearanceProducts(8),
      getComboOffers(),
    ]);
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

  const heroSlides = homeData.heroSlides.map((s) => ({
    id: s.id,
    title: s.title,
    subheadline: s.subheadline,
    image: s.image,
    href: s.href,
    cta: s.cta ?? "Shop Now",
    discountText: "SAVE UP 30%",
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
    <div className="min-h-screen">
      {/* Hero row: Category sidebar + Slider + Top Seller card */}
      <section className="border-b border-slate-200 bg-slate-50">
        <div className="mx-auto max-w-7xl px-4 py-4 sm:px-6 lg:px-8">
          <div className="flex flex-col gap-6 lg:flex-row">
            <CategoryMegaMenu />
            <div className="min-w-0 flex-1">
              <HeroSlider slides={heroSlides} />
            </div>
            <TopSellerCard />
          </div>
        </div>
      </section>

      <PromoBanners />
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
      <DiscountStrip />
    </div>
  );
}
