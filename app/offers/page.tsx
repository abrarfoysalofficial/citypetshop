import Link from "next/link";
import { getFlashSaleProducts } from "@/src/data/provider";
import ProductCard from "@/components/ProductCard";
import type { DisplayProduct } from "@/components/ProductCard";

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

export default async function OffersPage() {
  const flashSaleProducts = await getFlashSaleProducts(12);
  const flashSaleDisplay = flashSaleProducts.map(mapToDisplayProduct);

  return (
    <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
      <h1 className="text-2xl font-extrabold text-primary sm:text-4xl">Offers</h1>
      <p className="mt-2 text-sm font-semibold text-gray-700 sm:text-base">Current deals and promotions from City Plus Pet Shop.</p>

      {flashSaleDisplay.length > 0 && (
        <section className="mt-10">
          <h2 className="text-xl font-bold text-slate-900">Flash Sale</h2>
          <p className="mt-1 text-sm text-slate-600">Limited time offers. Shop now before they&apos;re gone.</p>
          <div className="mt-4 grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4">
            {flashSaleDisplay.map((p) => (
              <ProductCard key={p.id} product={p} />
            ))}
          </div>
        </section>
      )}

      <div className="mt-10 space-y-6">
        <div className="rounded-2xl border border-secondary/30 bg-secondary/5 p-6">
          <h2 className="text-lg font-bold text-primary sm:text-xl">Free Delivery</h2>
          <p className="mt-2 text-sm font-medium text-gray-700 sm:text-base">
            Enjoy free delivery on orders above ৳1500 within Dhaka. Terms apply.
          </p>
          <Link href="/shop" className="mt-4 inline-block font-semibold text-secondary hover:underline">
            Shop Now →
          </Link>
        </div>
        <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
          <h2 className="text-lg font-bold text-primary sm:text-xl">New Arrivals</h2>
          <p className="mt-2 text-sm font-medium text-gray-700 sm:text-base">
            Check out our latest cat food, litter, and health products. New items added regularly.
          </p>
          <Link href="/shop" className="mt-4 inline-block font-semibold text-secondary hover:underline">
            View All Products →
          </Link>
        </div>
      </div>

      <p className="mt-8 text-sm text-gray-500">
        For the latest offers, follow us on social media or contact us at +880 1643-390045.
      </p>
    </div>
  );
}
