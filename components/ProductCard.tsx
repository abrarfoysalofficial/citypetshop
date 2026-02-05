"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { ShoppingCart, Star, Heart, Zap } from "lucide-react";
import { useCart } from "@/context/CartContext";
import { useWishlist } from "@/context/WishlistContext";
import type { Product } from "@/lib/types";
import SafeImage, { PRODUCT_PLACEHOLDER } from "@/components/media/SafeImage";

/** Accepts both lib/types Product (image) and src/data/types Product (images[], comparePrice, tags, rating) */
export interface DisplayProduct {
  id: string;
  name: string;
  price: number;
  description?: string;
  shortDesc?: string;
  categorySlug: string;
  image?: string;
  images?: string[];
  inStock?: boolean;
  comparePrice?: number;
  tags?: string[];
  rating?: number;
}

interface ProductCardProps {
  product: DisplayProduct;
  /** When true, shows Buy Now button next to Add to Cart (shop page only) */
  showBuyNow?: boolean;
}

function toCartProduct(p: DisplayProduct) {
  const image = p.images?.[0] ?? p.image ?? PRODUCT_PLACEHOLDER;
  const description = p.shortDesc ?? p.description ?? "";
  return {
    id: p.id,
    name: p.name,
    price: p.price,
    description,
    categorySlug: p.categorySlug,
    image,
    inStock: p.inStock !== false,
  };
}

export default function ProductCard({ product, showBuyNow = false }: ProductCardProps) {
  const router = useRouter();
  const { addItem, clearCart, openCart } = useCart();
  const { toggle: toggleWishlist, isInWishlist } = useWishlist();
  const imageSrc = product.images?.[0] ?? product.image ?? PRODUCT_PLACEHOLDER;
  const showDiscount = product.comparePrice != null && product.comparePrice > product.price;
  const inWishlist = isInWishlist(product.id);
  const canBuyNow = product.inStock !== false;

  const handleAddToCart = (e: React.MouseEvent) => {
    e.preventDefault();
    addItem(toCartProduct(product) as Product, 1);
    openCart();
  };

  const handleBuyNow = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (!canBuyNow) return;
    clearCart();
    addItem(toCartProduct(product) as Product, 1);
    router.push("/checkout");
  };

  const handleWishlist = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    toggleWishlist({
      id: product.id,
      name: product.name,
      price: product.price,
      image: imageSrc,
      categorySlug: product.categorySlug,
    });
  };

  return (
    <Link
      href={`/product/${product.id}`}
      className="group flex flex-col overflow-hidden rounded-xl border border-slate-200 bg-surface shadow-sm shadow-sm transition-all duration-200 hover:-translate-y-1 hover:shadow-lg"
    >
      <div className="relative overflow-hidden bg-gray-100">
        <button
          type="button"
          onClick={handleWishlist}
          className="absolute right-2 top-2 z-10 rounded-full bg-white/90 p-2 shadow-sm transition-colors hover:bg-white"
          aria-label={inWishlist ? "Remove from wishlist" : "Add to wishlist"}
        >
          <Heart
            className={`h-5 w-5 ${inWishlist ? "fill-red-500 text-red-500" : "text-slate-600"}`}
          />
        </button>
        <SafeImage
          src={imageSrc}
          alt={product.name}
          aspectRatio43
          showShimmer
          fallbackSrc={PRODUCT_PLACEHOLDER}
          sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
        />
        {showDiscount && (
          <span className="absolute right-2 top-12 rounded-md bg-red-500 px-2 py-0.5 text-xs font-bold text-white">
            {Math.round(((product.comparePrice! - product.price) / product.comparePrice!) * 100)}% OFF
          </span>
        )}
        {product.tags && product.tags.length > 0 && (
          <div className="absolute left-2 top-2 flex flex-wrap gap-1">
            {product.tags.slice(0, 2).map((tag) => (
              <span
                key={tag}
                className="rounded-full bg-brand/90 px-2 py-0.5 text-xs font-semibold text-white"
              >
                {tag}
              </span>
            ))}
          </div>
        )}
      </div>
      <div className="flex flex-1 flex-col p-4">
        <h3 className="text-sm font-bold text-[var(--text)] line-clamp-2 group-hover:text-brand sm:text-base">
          {product.name}
        </h3>
        <div className="mt-1 flex items-center gap-2">
          <p className="text-base font-bold text-[var(--brand-accent)] sm:text-lg">
            ৳{product.price.toLocaleString("en-BD")}
          </p>
          {product.comparePrice != null && product.comparePrice > product.price && (
            <p className="text-sm text-[var(--text-muted)] line-through">৳{product.comparePrice.toLocaleString("en-BD")}</p>
          )}
        </div>
        {product.rating != null && (
          <div className="mt-0.5 flex items-center gap-1 text-amber-500">
            <Star className="h-4 w-4 fill-amber-400" />
            <span className="text-sm font-medium text-slate-600">{product.rating.toFixed(1)}</span>
          </div>
        )}
        <div className={`mt-3 flex gap-2 ${showBuyNow ? "flex-col sm:flex-row" : ""}`}>
          <button
            onClick={handleAddToCart}
            className="flex flex-1 items-center justify-center gap-2 rounded-lg bg-brand py-2.5 text-sm font-bold text-white transition-colors hover:bg-brand/90"
          >
            <ShoppingCart className="h-4 w-4" />
            Add to Cart
          </button>
          {showBuyNow && (
            <button
              onClick={handleBuyNow}
              disabled={!canBuyNow}
              className="flex flex-1 items-center justify-center gap-2 rounded-lg border-2 border-brand py-2.5 text-sm font-bold text-brand transition-colors hover:bg-brand/10 disabled:cursor-not-allowed disabled:opacity-50 disabled:hover:bg-transparent"
            >
              <Zap className="h-4 w-4" />
              Buy Now
            </button>
          )}
        </div>
      </div>
    </Link>
  );
}
