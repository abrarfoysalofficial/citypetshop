/**
 * Sanity data layer: home section, site settings. Maps to HomeSection.
 */
import type { HomeSection, HeroSlide, FeaturedCategory, Brand } from "../types";
import { sanityFetch } from "@/lib/sanity/client";
import { homeSectionQuery } from "@/lib/sanity/queries";

const TAGS = ["siteSettings", "category", "product"];

export async function getHomeData(): Promise<HomeSection> {
  const raw = await sanityFetch<{
    heroSlides?: (HeroSlide & { image?: string })[];
    featuredCategories?: (FeaturedCategory & { image?: string })[];
    featuredBrands?: { id: string; name: string }[];
    flashSale: HomeSection["flashSale"];
    sideBanners?: HomeSection["sideBanners"];
  }>({
    query: homeSectionQuery,
    tags: TAGS,
  });

  const heroSlides: HeroSlide[] = (raw?.heroSlides ?? [])
    .filter((s) => s?.title && s?.image)
    .map((s) => ({
      id: s.id ?? "",
      title: s.title,
      subheadline: s.subheadline,
      image: s.image ?? "",
      href: s.href ?? "/shop",
      cta: s.cta ?? "Shop Now",
    }));

  const featuredCategories: FeaturedCategory[] = (raw?.featuredCategories ?? [])
    .filter((c) => c?.slug && c?.name)
    .map((c) => ({
      slug: c.slug,
      name: c.name,
      image: c.image ?? "",
      href: c.href ?? `/category/${c.slug}`,
    }));

  const brandMap = new Map<string, Brand>();
  (raw?.featuredBrands ?? []).forEach((b) => {
    if (b?.name && !brandMap.has(b.name))
      brandMap.set(b.name, { id: b.id ?? b.name, name: b.name });
  });
  const featuredBrands = Array.from(brandMap.values());

  const sideBanners = (raw?.sideBanners ?? [])
    .filter((b) => b?.title && b?.image)
    .map((b) => ({
      id: b.id ?? "",
      title: b.title,
      subtitle: b.subtitle ?? "",
      image: b.image ?? "",
      href: b.href ?? "/shop",
      cta: b.cta ?? "Shop Now",
    }));

  return {
    heroSlides,
    featuredCategories,
    featuredBrands,
    flashSale: raw?.flashSale ?? null,
    sideBanners,
  };
}
