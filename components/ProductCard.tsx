"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { ShoppingCart, Star, Heart, Zap } from "lucide-react";
import { useCart } from "@store/CartContext";
import { useWishlist } from "@store/WishlistContext";
import type { Product } from "@lib/types";
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
      className="group flex flex-col overflow-hidden rounded-card border border-[var(--border-light)] bg-white shadow-soft transition-all duration-200 hover:shadow-card"
    >
      <div className="relative aspect-square overflow-hidden bg-slate-50">
        <button
          type="button"
          onClick={handleWishlist}
          className="absolute right-1 top-1 z-10 flex min-h-[36px] min-w-[36px] items-center justify-center rounded-full bg-white/95 shadow-sm transition-colors hover:bg-white"
          aria-label={inWishlist ? "Remove from wishlist" : "Add to wishlist"}
        >
          <Heart
            className={`h-4 w-4 ${inWishlist ? "fill-red-500 text-red-500" : "text-slate-600"}`}
          />
        </button>
        <SafeImage
          src={imageSrc}
          alt={product.name}
          fill
          showShimmer
          fallbackSrc={PRODUCT_PLACEHOLDER}
          sizes="(max-width: 640px) 50vw, (max-width: 1024px) 50vw, 25vw"
          className="object-cover"
        />
        {showDiscount && (
          <span className="absolute left-2 top-2 rounded-lg bg-gradient-teal px-1.5 py-0.5 text-[10px] font-bold text-white shadow-soft">
            {Math.round(((product.comparePrice! - product.price) / product.comparePrice!) * 100)}% OFF
          </span>
        )}
        {product.inStock === false && (
          <span className="absolute left-2 top-2 rounded bg-slate-600 px-1.5 py-0.5 text-[10px] font-medium text-white">
            Out of stock
          </span>
        )}
      </div>
      <div className="flex flex-1 flex-col p-3">
        <h3 className="line-clamp-2 text-sm font-semibold text-[var(--text-primary)] group-hover:text-[var(--teal-from)]">
          {product.name}
        </h3>
        <div className="mt-1 flex items-center gap-2">
          <p className="text-base font-bold text-[var(--teal-from)]">
            ৳{product.price.toLocaleString("en-BD")}
          </p>
          {product.comparePrice != null && product.comparePrice > product.price && (
            <p className="text-xs text-[var(--text-muted)] line-through">৳{product.comparePrice.toLocaleString("en-BD")}</p>
          )}
        </div>
        {product.rating != null && (
          <div className="mt-0.5 flex items-center gap-1 text-amber-500">
            <Star className="h-3.5 w-3.5 fill-amber-400" />
            <span className="text-xs font-medium text-slate-600">{product.rating.toFixed(1)}</span>
          </div>
        )}
        <div className={`mt-2 flex gap-2 ${showBuyNow ? "flex-col sm:flex-row" : ""}`}>
          <button
            onClick={handleAddToCart}
            className="flex min-h-[40px] flex-1 items-center justify-center gap-1.5 rounded-card bg-gradient-teal text-xs font-semibold text-white shadow-soft transition-opacity hover:opacity-95 md:text-sm"
            aria-label="Add to cart"
          >
            <ShoppingCart className="h-4 w-4" />
            Add to Cart
          </button>
          {showBuyNow && (
            <button
              onClick={handleBuyNow}
              disabled={!canBuyNow}
              className="flex min-h-[40px] flex-1 items-center justify-center gap-1.5 rounded-card border-2 border-[var(--teal-from)] text-xs font-semibold text-[var(--teal-from)] transition-colors hover:bg-[var(--brand-muted)] disabled:cursor-not-allowed disabled:opacity-50 disabled:hover:bg-transparent md:text-sm"
              aria-label="Buy now"
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
