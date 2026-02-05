import ProductCard from "@/components/ProductCard";
import type { DisplayProduct } from "@/components/ProductCard";
import type { Product } from "@/src/data/types";

function toDisplayProduct(p: Product): DisplayProduct {
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

interface RecommendedProductsProps {
  products: Product[];
  title?: string;
}

export default function RecommendedProducts({
  products,
  title = "You may also like",
}: RecommendedProductsProps) {
  if (products.length === 0) return null;
  const display = products.map(toDisplayProduct);

  return (
    <section className="mt-12 border-t border-gray-200 pt-10">
      <h2 className="text-xl font-bold text-gray-900">{title}</h2>
      <p className="mt-1 text-sm text-slate-600">Based on this category.</p>
      <div className="mt-6 grid grid-cols-2 gap-4 sm:grid-cols-4">
        {display.map((p) => (
          <ProductCard key={p.id} product={p} />
        ))}
      </div>
    </section>
  );
}
