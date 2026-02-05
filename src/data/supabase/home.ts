import type { HomeSection } from "../types";
import { DATA_SOURCE } from "@/src/config/runtime";

export async function getHomeData(): Promise<HomeSection> {
  if (DATA_SOURCE !== "supabase") throw new Error("Supabase not enabled");
  return {
    heroSlides: [],
    featuredCategories: [],
    featuredBrands: [],
    flashSale: null,
    sideBanners: [],
  };
}
