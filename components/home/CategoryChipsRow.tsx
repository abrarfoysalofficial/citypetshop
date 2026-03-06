"use client";

import Link from "next/link";
import { useState, useEffect } from "react";

type CategoryItem = { slug: string; name: string };

/**
 * Horizontal scroll category chips - grocery style for mobile.
 * Categories from DB via /api/categories.
 */
export default function CategoryChipsRow() {
  const [categories, setCategories] = useState<CategoryItem[]>([]);

  useEffect(() => {
    fetch("/api/categories")
      .then((r) => r.json())
      .then((data) => {
        if (Array.isArray(data)) {
          setCategories(data.map((c: { slug: string; name: string }) => ({ slug: c.slug, name: c.name })));
        }
      })
      .catch(() => {});
  }, []);

  if (categories.length === 0) return null;

  return (
    <section className="border-b border-[var(--border-light)] bg-white py-3 md:hidden">
      <div className="mx-auto max-w-7xl px-3">
        <div className="no-scrollbar flex gap-2 overflow-x-auto pb-1">
          {categories.map((cat) => (
            <Link
              key={cat.slug}
              href={`/shop?category=${cat.slug}`}
              className="flex min-w-[100px] max-w-[120px] shrink-0 items-center justify-center rounded-lg bg-[var(--surface-muted)] px-4 py-2.5 text-center text-sm font-semibold text-[var(--text-primary)] transition hover:bg-[var(--primary-light)] hover:text-[var(--primary)]"
            >
              {cat.name}
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}
