"use client";

import Link from "next/link";
import { ChevronLeft, ChevronRight, ShoppingCart } from "lucide-react";
import { useState } from "react";
import SafeImage from "@/components/media/SafeImage";
import { useCart } from "@/store/CartContext";
import type { DisplayProduct } from "@/components/ProductCard";

const TOP_SELLERS_FALLBACK: { id: string; name: string; image: string; price: number; comparePrice: number }[] = [
  { id: "1", name: "Premium Dog Food 10kg", image: "https://images.unsplash.com/photo-1587300003388-59208cc962cb?w=400", price: 2890, comparePrice: 3200 },
  { id: "2", name: "Cat Wet Food Pack", image: "https://images.unsplash.com/photo-1548199973-03cce0bbc87b?w=400", price: 550, comparePrice: 650 },
  { id: "3", name: "Bird Seed Mix 1kg", image: "https://images.unsplash.com/photo-1450778869180-41d0601e046e?w=400", price: 350, comparePrice: 400 },
];

function toItem(p: DisplayProduct) {
  const image = p.images?.[0] ?? p.image ?? "/ui/product-4x3.svg";
  return { id: p.id, name: p.name, image, price: p.price, comparePrice: p.comparePrice ?? p.price };
}

interface TopSellerCardProps {
  products?: DisplayProduct[];
}

export default function TopSellerCard({ products }: TopSellerCardProps) {
  const [index, setIndex] = useState(0);
  const { addItem, openCart } = useCart();
  const items = products && products.length > 0 ? products.map(toItem) : TOP_SELLERS_FALLBACK;
  const item = items[index % items.length];
  const sourceProduct = products?.[index % (products?.length ?? 1)];
  const discount = item.comparePrice ? Math.round(((item.comparePrice - item.price) / item.comparePrice) * 100) : 0;

  const handleAddToCart = (e: React.MouseEvent) => {
    e.preventDefault();
    addItem(
      {
        id: item.id,
        name: item.name,
        price: item.price,
        description: sourceProduct?.shortDesc ?? sourceProduct?.description ?? "",
        categorySlug: sourceProduct?.categorySlug ?? "dog-food",
        image: item.image,
        inStock: sourceProduct?.inStock ?? true,
      },
      1
    );
    openCart();
  };

  return (
    <div className="w-full shrink-0 rounded-xl border-2 border-slate-200 bg-white p-4 shadow-sm lg:w-72">
      <div className="mb-3 flex items-center justify-between">
        <h2 className="text-base font-bold uppercase tracking-wider text-slate-800">Top Sellers</h2>
        <div className="flex gap-1">
          <button
            type="button"
            onClick={() => setIndex((i) => (i - 1 + items.length) % items.length)}
            className="rounded-lg p-1.5 text-slate-500 hover:bg-slate-100"
            aria-label="Previous"
          >
            <ChevronLeft className="h-5 w-5" />
          </button>
          <button
            type="button"
            onClick={() => setIndex((i) => (i + 1) % items.length)}
            className="rounded-lg p-1.5 text-slate-500 hover:bg-slate-100"
            aria-label="Next"
          >
            <ChevronRight className="h-5 w-5" />
          </button>
        </div>
      </div>
      <Link href={`/product/${item.id}`} className="block">
        <div className="relative aspect-square overflow-hidden rounded-lg bg-slate-100">
          <SafeImage
            src={item.image}
            alt={item.name}
            fill
            fallbackSrc="/ui/product-4x3.svg"
            className="object-cover"
            sizes="288px"
          />
          {discount > 0 && (
            <span className="absolute left-2 top-2 rounded bg-red-500 px-2 py-0.5 text-xs font-bold text-white">
              -{discount}%
            </span>
          )}
        </div>
        <h3 className="mt-2 line-clamp-2 text-sm font-semibold text-slate-900">{item.name}</h3>
        <div className="mt-2 flex items-center gap-2">
          <span className="text-lg font-bold text-primary">৳{item.price.toLocaleString("en-BD")}</span>
          {item.comparePrice > item.price && (
            <span className="text-sm text-slate-400 line-through">৳{item.comparePrice.toLocaleString("en-BD")}</span>
          )}
        </div>
      </Link>
      <button
        onClick={handleAddToCart}
        className="mt-3 flex w-full items-center justify-center gap-2 rounded-lg bg-primary py-2.5 text-sm font-semibold text-white transition hover:bg-slate-800"
      >
        <ShoppingCart className="h-4 w-4" />
        Add to Cart
      </button>
    </div>
  );
}
