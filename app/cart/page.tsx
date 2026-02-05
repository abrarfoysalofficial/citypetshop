"use client";

import Link from "next/link";
import Image from "next/image";
import { Minus, Plus, ShoppingBag } from "lucide-react";
import { useCart } from "@/context/CartContext";

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
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
      <h1 className="text-3xl font-bold text-primary">Your Cart</h1>
      <p className="mt-2 text-gray-600">{totalItems} item{totalItems !== 1 ? "s" : ""} in your cart</p>

      <div className="mt-8 grid gap-8 lg:grid-cols-3">
        <div className="lg:col-span-2">
          <ul className="divide-y divide-gray-200 rounded-xl border border-gray-200 bg-white shadow-sm">
            {items.map((item) => (
              <li key={item.id} className="flex gap-4 p-4 sm:p-6">
                <div className="relative h-24 w-24 shrink-0 overflow-hidden rounded-lg bg-gray-100">
                  <Image
                    src={item.image}
                    alt={item.name}
                    fill
                    className="object-cover"
                    sizes="96px"
                  />
                </div>
                <div className="flex-1 min-w-0">
                  <Link
                    href={`/product/${item.id}`}
                    className="font-semibold text-gray-900 hover:text-primary line-clamp-2"
                  >
                    {item.name}
                  </Link>
                  <p className="mt-0.5 text-sm font-semibold text-secondary">৳{item.price.toLocaleString("en-BD")}</p>
                  <div className="mt-2 flex items-center gap-2">
                    <button
                      onClick={() => updateQuantity(item.id, item.quantity - 1)}
                      className="rounded border border-gray-300 p-1 hover:bg-gray-100"
                      aria-label="Decrease quantity"
                    >
                      <Minus className="h-4 w-4" />
                    </button>
                    <span className="w-8 text-center text-sm font-medium">{item.quantity}</span>
                    <button
                      onClick={() => updateQuantity(item.id, item.quantity + 1)}
                      className="rounded border border-gray-300 p-1 hover:bg-gray-100"
                      aria-label="Increase quantity"
                    >
                      <Plus className="h-4 w-4" />
                    </button>
                    <button
                      onClick={() => removeItem(item.id)}
                      className="ml-2 text-sm text-red-600 hover:underline"
                    >
                      Remove
                    </button>
                  </div>
                </div>
                <div className="text-right font-semibold text-primary">
                  ৳{(item.price * item.quantity).toLocaleString("en-BD")}
                </div>
              </li>
            ))}
          </ul>
        </div>

        <div>
          <div className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
            <h2 className="text-lg font-bold text-primary">Order Summary</h2>
            <div className="mt-4 flex justify-between text-sm">
              <span className="text-gray-600">Subtotal ({totalItems} items)</span>
              <span className="font-medium">৳{totalPrice.toLocaleString("en-BD")}</span>
            </div>
            <div className="mt-2 flex justify-between text-sm">
              <span className="text-gray-600">Shipping</span>
              <span className="font-medium text-gray-500">Calculated at checkout</span>
            </div>
            <div className="mt-4 border-t border-gray-200 pt-4 flex justify-between text-lg font-bold">
              <span>Total</span>
              <span className="text-secondary">৳{totalPrice.toLocaleString("en-BD")}</span>
            </div>
            <Link
              href="/checkout"
              className="mt-6 block w-full rounded-lg bg-primary py-3 text-center font-semibold text-white hover:bg-primary/90 transition-colors"
            >
              Proceed to Checkout
            </Link>
            <Link
              href="/shop"
              className="mt-3 block w-full rounded-lg border-2 border-primary py-2.5 text-center font-semibold text-primary hover:bg-primary/5 transition-colors"
            >
              Continue Shopping
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
