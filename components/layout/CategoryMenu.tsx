"use client";

import Link from "next/link";
import { useState, useRef } from "react";
import { ChevronRight, Package, LayoutGrid } from "lucide-react";
import { useCategories } from "@/store/CategoriesContext";

type CategoryItem = { slug: string; name: string };

interface CategoryMenuProps {
  /** When true, renders as content only for mobile drawer (no trigger) */
  contentOnly?: boolean;
  /** Callback when a link is clicked (to close drawer) */
  onClose?: () => void;
}

export function CategoryMenuContent({ categories, onClose }: { categories: CategoryItem[]; onClose?: () => void }) {
  const linkProps = onClose ? { onClick: onClose } : {};
  return (
    <nav className="flex flex-col py-2" aria-label="Shop by category">
      <Link
        href="/shop"
        className="flex items-center justify-between px-4 py-3 text-sm font-semibold text-white hover:bg-white/10 lg:px-4 lg:py-2.5 lg:text-[var(--primary)] lg:hover:bg-[var(--primary-light)]"
        {...linkProps}
      >
        All Products
        <ChevronRight className="h-4 w-4" />
      </Link>
      {categories.map((c) => (
        <Link
          key={c.slug}
          href={`/category/${c.slug}`}
          className="flex items-center justify-between px-4 py-3 text-sm text-white/90 hover:bg-white/10 lg:px-4 lg:py-2.5 lg:text-[var(--text-primary)] lg:hover:bg-[var(--primary-light)]"
          {...linkProps}
        >
          {c.name}
          <ChevronRight className="h-4 w-4 opacity-70" />
        </Link>
      ))}
    </nav>
  );
}

export default function CategoryMenu({ contentOnly = false, onClose }: CategoryMenuProps) {
  const { categories, loading } = useCategories();
  const [open, setOpen] = useState(false);
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const handleEnter = () => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
      timeoutRef.current = null;
    }
    setOpen(true);
  };

  const handleLeave = () => {
    timeoutRef.current = setTimeout(() => setOpen(false), 150);
  };

  if (contentOnly) {
    return (
      <div className={categories.length === 0 ? "flex items-center gap-2 px-4 py-3 text-sm text-white/70" : ""}>
        {categories.length === 0 ? (
          <>
            <Package className="h-4 w-4" />
            Loading categories…
          </>
        ) : (
          <CategoryMenuContent categories={categories} onClose={onClose} />
        )}
      </div>
    );
  }

  return (
    <div
      className="relative hidden lg:block"
      onMouseEnter={handleEnter}
      onMouseLeave={handleLeave}
    >
      <button
        type="button"
        className="flex items-center gap-2 rounded-lg px-3 py-2 text-sm font-semibold text-white transition-colors hover:bg-white/15"
        aria-haspopup="true"
        aria-expanded={open}
      >
        <LayoutGrid className="h-5 w-5" />
        Shop by Category
        <ChevronRight className={`h-4 w-4 transition-transform ${open ? "rotate-90" : ""}`} />
      </button>
      <div
        className={`absolute left-0 top-full z-50 mt-0 min-w-[220px] rounded-b-lg border border-t-0 border-[var(--border-light)] bg-white shadow-lg ${
          open ? "block" : "hidden"
        }`}
      >
        <CategoryMenuContent categories={categories} />
      </div>
    </div>
  );
}
