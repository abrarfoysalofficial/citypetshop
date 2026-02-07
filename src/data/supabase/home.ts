import type { HomeSection } from "../types";
import { DATA_SOURCE } from "@/src/config/runtime";

export async function getHomeData(): Promise<HomeSection> {
  if (DATA_SOURCE !== "supabase") {
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
