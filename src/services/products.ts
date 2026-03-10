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
  getCategories,
} from "@/src/data/provider";

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
      const cats = await getCategories();
      return cats.map((c) => ({
        slug: c.slug,
        name: c.name,
        subcategories: c.subcategories,
      }));
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
