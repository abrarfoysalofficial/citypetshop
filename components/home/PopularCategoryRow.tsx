"use client";

import Link from "next/link";
import SafeImage from "@/components/media/SafeImage";
import { useCategories } from "@/store/CategoriesContext";
import { getCategoryImageSrc, CATEGORY_FALLBACK_IMAGE } from "@lib/category-meta";

export default function PopularCategoryRow() {
  const { categories } = useCategories();
  const popularCategories = categories.slice(0, 8);

  return (
    <section className="border-y border-[var(--border-light)] bg-[var(--bg-page)] py-6 md:py-8">
      <div className="mx-auto max-w-7xl px-3 md:px-6 lg:px-8">
        <h2 className="mb-4 text-center text-lg font-bold text-slate-900 sm:text-xl">Shop by Category</h2>
        <div className="no-scrollbar flex gap-4 overflow-x-auto pb-2">
          {popularCategories.map((cat) => (
            <Link
              key={cat.slug}
              href={`/category/${cat.slug}`}
              className="group flex w-28 shrink-0 flex-col items-center rounded-card border border-[var(--border-light)] bg-white p-4 shadow-soft transition hover:border-[var(--teal-from)] hover:shadow-card sm:w-36"
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
              <span className="mt-2 text-center text-xs font-semibold text-[var(--text-primary)] group-hover:text-[var(--teal-from)] sm:text-sm">{cat.name}</span>
              <span className="mt-2 rounded-full bg-[var(--brand-muted)] px-3 py-1 text-xs font-medium text-[var(--teal-from)] transition group-hover:bg-gradient-teal group-hover:text-white">
                Shop Now
              </span>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}
