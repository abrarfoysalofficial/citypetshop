"use client";

import Link from "next/link";
import Image from "next/image";
import { Minus, Plus, ShoppingBag } from "lucide-react";
import { useCart } from "@/store/CartContext";

export default function CartPage() {
  const { items, removeItem, updateQuantity, totalItems, totalPrice } = useCart();

  if (items.length === 0) {
    return (
      <div className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
        <div className="flex flex-col items-center justify-center rounded-2xl border-2 border-dashed border-gray-200 bg-gray-50 py-20 text-center">
          <ShoppingBag className="mb-4 h-20 w-20 text-gray-300" />
          <h2 className="text-xl font-bold text-gray-900">Your cart is empty</h2>
          <p className="mt-2 text-gray-600">Add some products from our shop.</p>
          <Link
            href="/shop"
            className="mt-6 inline-flex rounded-lg bg-primary px-6 py-3 font-semibold text-white hover:bg-primary/90"
          >
            Shop Now
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-7xl px-3 py-5 sm:px-6 lg:px-8 lg:py-8">
      <h1 className="text-xl font-bold text-primary sm:text-2xl lg:text-3xl">Your Cart</h1>
      <p className="mt-1 text-sm text-gray-600">{totalItems} item{totalItems !== 1 ? "s" : ""} in your cart</p>

      <div className="mt-6 grid gap-6 lg:grid-cols-3 lg:gap-8">
        <div className="lg:col-span-2">
          <ul className="divide-y divide-gray-200 rounded-xl border border-gray-200 bg-white shadow-sm">
            {items.map((item) => (
              <li key={item.id} className="flex gap-3 p-4 sm:gap-4 sm:p-6">
                <div className="relative h-20 w-20 shrink-0 overflow-hidden rounded-lg bg-gray-100 sm:h-24 sm:w-24">
                  <Image
                    src={item.image}
                    alt={item.name}
                    fill
                    className="object-cover"
                    sizes="96px"
                  />
                </div>
                <div className="min-w-0 flex-1">
                  <Link
                    href={`/product/${item.id}`}
                    className="font-semibold text-gray-900 line-clamp-2 hover:text-primary"
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
                    <span className="w-8 text-center text-sm font-medium">{item.quantity}</span>
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
                <div className="shrink-0 text-right font-semibold text-primary">
                  ৳{(item.price * item.quantity).toLocaleString("en-BD")}
                </div>
              </li>
            ))}
          </ul>
        </div>

        {/* Desktop: sidebar summary */}
        <div className="hidden lg:block">
          <div className="sticky top-24 rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
            <h2 className="text-lg font-bold text-primary">Order Summary</h2>
            <div className="mt-4 flex justify-between text-sm">
              <span className="text-gray-600">Subtotal ({totalItems} items)</span>
              <span className="font-medium">৳{totalPrice.toLocaleString("en-BD")}</span>
            </div>
            <div className="mt-2 flex justify-between text-sm">
              <span className="text-gray-600">Shipping</span>
              <span className="font-medium text-gray-500">Calculated at checkout</span>
            </div>
            <div className="mt-4 flex justify-between border-t border-gray-200 pt-4 text-lg font-bold">
              <span>Total</span>
              <span className="text-secondary">৳{totalPrice.toLocaleString("en-BD")}</span>
            </div>
            <Link
              href="/checkout"
              className="mt-6 block w-full rounded-lg bg-primary py-3 text-center font-semibold text-white transition-colors hover:bg-primary/90"
            >
              Proceed to Checkout
            </Link>
            <Link
              href="/shop"
              className="mt-3 block w-full rounded-lg border-2 border-primary py-2.5 text-center font-semibold text-primary transition-colors hover:bg-primary/5"
            >
              Continue Shopping
            </Link>
          </div>
        </div>
      </div>

      {/* Mobile: sticky bottom bar — above MobileBottomNav */}
      <div
        className="fixed left-0 right-0 z-20 flex items-center justify-between gap-4 border-t border-slate-200 bg-white px-4 py-3 shadow-[0_-4px_6px_-1px_rgba(0,0,0,0.1)] md:hidden"
        style={{ bottom: "calc(56px + env(safe-area-inset-bottom, 0px))" }}
      >
        <div>
          <p className="text-xs text-slate-500">Total</p>
          <p className="text-lg font-bold text-primary">৳{totalPrice.toLocaleString("en-BD")}</p>
        </div>
        <Link
          href="/checkout"
          className="flex h-12 flex-1 items-center justify-center rounded-xl bg-primary font-bold text-white shadow-sm transition hover:bg-primary/90"
        >
          Proceed to Checkout
        </Link>
      </div>

      {/* Mobile: spacer so list doesn't hide behind sticky bar */}
      <div className="h-20 md:hidden" aria-hidden />
    </div>
  );
}
