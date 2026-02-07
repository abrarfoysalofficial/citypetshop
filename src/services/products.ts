/**
 * Products repository implementations.
 * Provider-backed: uses existing getProducts/getProductById/getHomeData; listCategories from master list; searchProducts = filter.
 */
import type { Product, Category, HomeSection } from "@/src/data/types";
import type { ProductsRepository } from "./types";
import {
  getProducts,
  getProductById,
  getHomeData,
} from "@/src/data/provider";
import { MASTER_CATEGORIES } from "@/lib/categories-master";

function toCategory(c: { slug: string; name: string; subcategories: { slug: string }[] }): Category {
  return {
    slug: c.slug,
    name: c.name,
    subcategories: c.subcategories?.map((s) => s.slug),
  };
}

/** Uses current DATA_SOURCE (provider). */
export function createProviderProductsRepository(): ProductsRepository {
  return {
    async listProducts() {
      return getProducts();
    },
    async getProductById(id) {
      return getProductById(id);
    },
    async listCategories() {
      return MASTER_CATEGORIES.map((c) => toCategory(c));
    },
    async getHomeContent() {
      return getHomeData();
    },
    async searchProducts(query) {
      const q = query.trim().toLowerCase();
      if (!q) return getProducts();
      const all = await getProducts();
      return all.filter(
        (p) =>
          p.name.toLowerCase().includes(q) ||
          (p.shortDesc && p.shortDesc.toLowerCase().includes(q)) ||
          (p.tags && p.tags.some((t) => t.toLowerCase().includes(q)))
      );
    },
  };
}

/** Auto: try Sanity then fallback to local. Resolved at getServices() via provider (DATA_SOURCE already reflects auto). */
export function createAutoProductsRepository(): ProductsRepository {
  return createProviderProductsRepository();
}
