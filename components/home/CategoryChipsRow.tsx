"use client";

import Link from "next/link";
import { MASTER_CATEGORIES } from "@/lib/categories-master";

/**
 * Horizontal scroll category chips - Daraz/Shopee style for mobile.
 * Min-width 100-120px, rounded-xl, subtle background, no scrollbar.
 */
export default function CategoryChipsRow() {
  return (
    <section className="border-b border-slate-200 bg-slate-50 py-3 md:hidden">
      <div className="mx-auto max-w-7xl px-3">
        <div className="no-scrollbar flex gap-2 overflow-x-auto pb-1">
          {MASTER_CATEGORIES.map((cat) => (
            <Link
              key={cat.slug}
              href={`/category/${cat.slug}`}
              className="flex min-w-[100px] max-w-[120px] shrink-0 items-center justify-center rounded-xl bg-white px-4 py-2.5 text-center text-sm font-semibold text-slate-700 shadow-sm transition hover:bg-primary/10 hover:text-primary"
            >
              {cat.name}
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}
