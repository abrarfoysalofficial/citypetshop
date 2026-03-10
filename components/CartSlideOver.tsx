"use client";

import Link from "next/link";
import Image from "next/image";
import { X, Minus, Plus, ShoppingBag } from "lucide-react";
import { useCart } from "@/store/CartContext";
import { buildProductRoute } from "@/lib/storefront-routes";

export default function CartSlideOver() {
  const { items, isOpen, closeCart, removeItem, updateQuantity, totalItems, totalPrice } = useCart();

  if (!isOpen) return null;

  return (
    <>
      <div
        className="fixed inset-0 z-50 bg-black/50 transition-opacity"
        onClick={closeCart}
        aria-hidden="true"
      />
      <aside
        className="fixed right-0 top-0 z-50 h-full w-full max-w-md bg-white shadow-xl flex flex-col"
        role="dialog"
        aria-label="Shopping cart"
      >
        <div className="flex items-center justify-between border-b border-gray-200 px-4 py-4">
          <h2 className="text-lg font-bold text-primary">Your Cart</h2>
          <button
            onClick={closeCart}
            className="flex min-h-[44px] min-w-[44px] items-center justify-center rounded-lg text-gray-500 hover:bg-gray-100"
            aria-label="Close cart"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto px-4 py-4">
          {items.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 text-gray-500">
              <ShoppingBag className="mb-4 h-16 w-16 text-gray-300" />
              <p className="mb-4">Your cart is empty</p>
              <Link
                href="/shop"
                onClick={closeCart}
                className="rounded-lg bg-primary px-4 py-2 text-sm font-medium text-white hover:bg-primary/90"
              >
                Shop Now
              </Link>
            </div>
          ) : (
            <ul className="space-y-4">
              {items.map((item) => (
                <li key={item.id} className="flex gap-4 border-b border-gray-100 pb-4">
                  <div className="relative h-20 w-20 shrink-0 overflow-hidden rounded-lg bg-gray-100">
                    <Image
                      src={item.image}
                      alt={item.name}
                      fill
                      className="object-cover"
                      sizes="80px"
                    />
                  </div>
                  <div className="flex-1 min-w-0">
                    <Link
                      href={buildProductRoute({
                        categorySlug: item.categorySlug ?? "general",
                        subcategorySlug: item.categorySlug ?? "general",
                        id: item.id,
                      })}
                      onClick={closeCart}
                      className="font-medium text-gray-900 hover:text-primary line-clamp-2"
                    >
                      {item.name}
                    </Link>
                    <p className="mt-0.5 text-sm font-semibold text-secondary">৳{item.price.toLocaleString("en-BD")}</p>
                    <div className="mt-2 flex items-center gap-2">
                      <button
                        onClick={() => updateQuantity(item.id, item.quantity - 1)}
                        className="flex h-9 min-w-[36px] items-center justify-center rounded border border-gray-300 hover:bg-gray-100"
                        aria-label="Decrease quantity"
                      >
                        <Minus className="h-4 w-4" />
                      </button>
                      <span className="w-8 text-center text-sm">{item.quantity}</span>
                      <button
                        onClick={() => updateQuantity(item.id, item.quantity + 1)}
                        className="flex h-9 min-w-[36px] items-center justify-center rounded border border-gray-300 hover:bg-gray-100"
                        aria-label="Increase quantity"
                      >
                        <Plus className="h-4 w-4" />
                      </button>
                      <button
                        onClick={() => removeItem(item.id)}
                        className="ml-2 min-h-[36px] px-2 text-sm text-red-600 hover:underline"
                      >
                        Remove
                      </button>
                    </div>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>

        {items.length > 0 && (
          <div className="border-t border-gray-200 px-4 py-4">
            <div className="flex justify-between text-lg font-bold">
              <span>Total ({totalItems} items)</span>
              <span className="text-secondary">৳{totalPrice.toLocaleString("en-BD")}</span>
            </div>
            <Link
              href="/cart"
              onClick={closeCart}
              className="mt-4 block w-full rounded-lg bg-primary py-3 text-center font-medium text-white hover:bg-primary/90"
            >
              View Cart & Checkout
            </Link>
          </div>
        )}
      </aside>
    </>
  );
}
