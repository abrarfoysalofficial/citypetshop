"use client";

import Link from "next/link";
import Image from "next/image";
import { useCompare } from "@/store/CompareContext";
import { buildProductRoute } from "@/lib/storefront-routes";

export default function ComparePage() {
  const { items, removeFromCompare } = useCompare();

  if (items.length === 0) {
    return (
      <div className="mx-auto max-w-md px-4 py-16 text-center">
        <h1 className="text-2xl font-bold text-slate-900">Compare Products</h1>
        <p className="mt-2 text-slate-600">You have no products to compare. Add some from the shop.</p>
        <Link href="/shop" className="mt-6 inline-block font-semibold text-primary hover:underline">
          Browse Shop
        </Link>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-6xl px-4 py-8">
      <h1 className="text-2xl font-bold text-slate-900">Compare Products</h1>
      <div className="mt-6 overflow-x-auto">
        <table className="w-full min-w-[600px] border-collapse border border-slate-200">
          <thead>
            <tr className="bg-slate-100">
              <th className="border border-slate-200 p-3 text-left font-semibold">Product</th>
              <th className="border border-slate-200 p-3 text-left font-semibold">Price</th>
              <th className="border border-slate-200 p-3 text-left font-semibold">Category</th>
              <th className="border border-slate-200 p-3 text-left font-semibold">Action</th>
            </tr>
          </thead>
          <tbody>
            {items.map((product) => (
              <tr key={product.id} className="hover:bg-slate-50">
                <td className="border border-slate-200 p-3">
                  <div className="flex items-center gap-3">
                    <div className="relative h-16 w-16 shrink-0 overflow-hidden rounded bg-slate-100">
                      <Image src={product.image} alt={product.name} fill className="object-cover" sizes="64px" />
                    </div>
                    <Link
                      href={buildProductRoute({
                        categorySlug: product.categorySlug ?? "general",
                        subcategorySlug: product.categorySlug ?? "general",
                        id: product.id,
                      })}
                      className="font-medium text-primary hover:underline"
                    >
                      {product.name}
                    </Link>
                  </div>
                </td>
                <td className="border border-slate-200 p-3 font-semibold">
                  ৳{product.price.toLocaleString("en-BD")}
                </td>
                <td className="border border-slate-200 p-3 text-slate-600">{product.categorySlug}</td>
                <td className="border border-slate-200 p-3">
                  <button
                    type="button"
                    onClick={() => removeFromCompare(product.id)}
                    className="text-sm font-medium text-rose-600 hover:underline"
                  >
                    Remove
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <p className="mt-4 text-sm text-slate-600">
        Add products from the shop to compare. Maximum 4 products can be compared.
      </p>
    </div>
  );
}
