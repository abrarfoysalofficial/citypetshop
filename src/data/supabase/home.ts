import type { HomeSection } from "../types";
import { isSupabaseConfigured } from "@/src/config/env";

export async function getHomeData(): Promise<HomeSection> {
  if (!isSupabaseConfigured()) {
    return {
      heroSlides: [],
      featuredCategories: [],
      featuredBrands: [],
      flashSale: null,
      sideBanners: [],
    };
  }
  return {
    heroSlides: [],
    featuredCategories: [],
    featuredBrands: [],
    flashSale: null,
    sideBanners: [],
  };
}
