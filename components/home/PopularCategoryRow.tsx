"use client";

import Link from "next/link";
import SafeImage from "@/components/media/SafeImage";
import { MASTER_CATEGORIES } from "@/lib/categories-master";
import { getCategoryImageSrc, CATEGORY_FALLBACK_IMAGE } from "@/lib/category-meta";

export default function PopularCategoryRow() {
  const popularCategories = MASTER_CATEGORIES.slice(0, 8);

  return (
    <section className="border-y border-slate-200 bg-slate-50 py-4 md:py-6">
      <div className="mx-auto max-w-7xl px-3 md:px-6 lg:px-8">
        <h2 className="mb-4 text-center text-lg font-bold text-slate-900 sm:text-xl">Popular Categories</h2>
        <div className="no-scrollbar flex gap-4 overflow-x-auto pb-2">
          {popularCategories.map((cat) => (
            <Link
              key={cat.slug}
              href={`/category/${cat.slug}`}
              className="group flex shrink-0 flex-col items-center rounded-xl border border-slate-200 bg-white p-4 shadow-sm transition hover:border-primary hover:shadow-md w-28 sm:w-36"
            >
              <div className="relative h-16 w-16 overflow-hidden rounded-full sm:h-20 sm:w-20">
                <SafeImage
                  src={getCategoryImageSrc(cat.slug)}
                  alt={`${cat.name} for pets`}
                  fill
                  fallbackSrc={CATEGORY_FALLBACK_IMAGE}
                  className="object-cover transition group-hover:scale-110"
                  sizes="(max-width: 640px) 80px, 96px"
                />
              </div>
              <span className="mt-2 text-center text-xs font-semibold text-slate-800 group-hover:text-primary sm:text-sm">{cat.name}</span>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}
