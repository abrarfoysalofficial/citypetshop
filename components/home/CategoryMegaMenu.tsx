"use client";

import Link from "next/link";
import {
  Package,
  Heart,
  Gamepad2,
  Layers,
  Dog,
  Bird,
  Rabbit,
  ChevronRight,
  ChevronDown,
} from "lucide-react";
import { useState, useRef, useEffect, useCallback } from "react";
import { useCategories, type MegaMenuCategory } from "@/store/CategoriesContext";
import SafeImage from "@/components/media/SafeImage";
import { buildProductRoute } from "@/lib/storefront-routes";

type SubProduct = { id: string; name: string; price: number; image: string; slug: string };

const CAT_ICONS: Record<string, React.ComponentType<{ className?: string }>> = {
  "cat-accessories": Package,
  "care-health": Heart,
  "cat-toys": Gamepad2,
  "cat-litter": Layers,
  "cat-food": Package,
  "cat-equipment": Package,
  "dog-food": Dog,
  "dog-health-accessories": Heart,
  "bird-food-accessories": Bird,
  "rabbit-food-accessories": Rabbit,
};

type SubcategoryItem = { slug: string; name: string; fullSlug: string };

export default function CategoryMegaMenu() {
  const { categoriesTree } = useCategories();
  const [activeCategory, setActiveCategory] = useState<MegaMenuCategory | null>(null);
  const [activeSubcategory, setActiveSubcategory] = useState<SubcategoryItem | null>(null);
  const [subProducts, setSubProducts] = useState<SubProduct[]>([]);
  const [mobileOpen, setMobileOpen] = useState<string | null>(null);
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const subTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const panelRef = useRef<HTMLDivElement>(null);

  const clearTimeoutRef = () => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
      timeoutRef.current = null;
    }
  };

  const handleCategoryEnter = (cat: MegaMenuCategory) => {
    clearTimeoutRef();
    setActiveCategory(cat);
  };

  const handleCategoryLeave = () => {
    timeoutRef.current = setTimeout(() => setActiveCategory(null), 150);
  };

  const handlePanelEnter = () => clearTimeoutRef();
  const handlePanelLeave = () => {
    if (subTimeoutRef.current) clearTimeout(subTimeoutRef.current);
    subTimeoutRef.current = null;
    setActiveSubcategory(null);
    setSubProducts([]);
    handleCategoryLeave();
  };

  const fetchSubProducts = useCallback(async (fullSlug: string) => {
    try {
      const res = await fetch(`/api/products/by-subcategory?fullSlug=${encodeURIComponent(fullSlug)}&limit=6`);
      const data = await res.json().catch(() => ({}));
      setSubProducts(data.products || []);
    } catch {
      setSubProducts([]);
    }
  }, []);

  const handleSubEnter = (sub: SubcategoryItem) => {
    if (subTimeoutRef.current) clearTimeout(subTimeoutRef.current);
    subTimeoutRef.current = null;
    setActiveSubcategory(sub);
    fetchSubProducts(sub.fullSlug);
  };

  const handleSubLeave = () => {
    subTimeoutRef.current = setTimeout(() => {
      setActiveSubcategory(null);
      setSubProducts([]);
    }, 100);
  };

  useEffect(() => () => {
    clearTimeoutRef();
    if (subTimeoutRef.current) clearTimeout(subTimeoutRef.current);
  }, []);

  const handleKeyDown = (e: React.KeyboardEvent, cat: MegaMenuCategory, index: number) => {
    if (e.key === "Enter" || e.key === " ") {
      e.preventDefault();
      setActiveCategory(cat);
    }
    if (e.key === "Escape") setActiveCategory(null);
    if (e.key === "ArrowDown" && index < categoriesTree.length - 1) {
      const next = (e.target as HTMLElement).nextElementSibling?.querySelector("a, button") as HTMLElement | null;
      next?.focus();
    }
    if (e.key === "ArrowUp" && index > 0) {
      const prev = (e.target as HTMLElement).previousElementSibling?.querySelector("a, button") as HTMLElement | null;
      prev?.focus();
    }
  };

  return (
    <div
      className="relative flex w-full shrink-0 lg:w-64"
      onMouseLeave={handleCategoryLeave}
    >
      <aside className="w-full rounded-card border border-[var(--border-light)] bg-white shadow-soft lg:w-56">
        <div className="border-b border-[var(--border-light)] bg-slate-50 px-4 py-3">
          <h2 className="text-sm font-bold uppercase tracking-wider text-slate-800">
            Categories
          </h2>
        </div>
        <nav className="py-2" aria-label="Category menu">
          {categoriesTree.map((cat, index) => {
            const Icon = CAT_ICONS[cat.slug] ?? Package;
            const hasSubs = cat.subcategories.length > 0;

            return (
              <div key={cat.slug} className="relative">
                {/* Desktop: hover trigger */}
                <div
                  className="hidden lg:block"
                  onMouseEnter={() => handleCategoryEnter(cat)}
                  onMouseLeave={handleCategoryLeave}
                >
                  {hasSubs ? (
                    <div
                      role="button"
                      tabIndex={0}
                      onKeyDown={(e) => handleKeyDown(e, cat, index)}
                      className="flex cursor-pointer items-center gap-3 px-4 py-3 text-sm font-medium text-slate-700 transition-colors hover:bg-[var(--brand-muted)] hover:text-[var(--teal-from)]"
                      aria-haspopup="true"
                      aria-expanded={activeCategory?.slug === cat.slug}
                    >
                      <Icon className="h-5 w-5 shrink-0 text-slate-500" />
                      <span className="flex-1">{cat.name}</span>
                      <ChevronRight className="h-4 w-4 shrink-0 text-slate-400" />
                    </div>
                  ) : (
                    <Link
                      href={`/category/${cat.slug}`}
                      className="flex items-center gap-3 px-4 py-3 text-sm font-medium text-slate-700 transition-colors hover:bg-[var(--brand-muted)] hover:text-[var(--teal-from)]"
                    >
                      <Icon className="h-5 w-5 shrink-0 text-slate-500" />
                      <span className="flex-1">{cat.name}</span>
                      <ChevronRight className="h-4 w-4 shrink-0 text-slate-400" />
                    </Link>
                  )}
                </div>

                {/* Mobile: tap to expand accordion */}
                <div className="lg:hidden">
                  {hasSubs ? (
                    <>
                      <button
                        type="button"
                        onClick={() => setMobileOpen(mobileOpen === cat.slug ? null : cat.slug)}
                        className="flex w-full items-center gap-3 px-4 py-3 text-sm font-medium text-slate-700"
                        aria-expanded={mobileOpen === cat.slug}
                      >
                        <Icon className="h-5 w-5 shrink-0 text-slate-500" />
                        <span className="flex-1 text-left">{cat.name}</span>
                        <ChevronDown
                          className={`h-4 w-4 shrink-0 transition-transform ${mobileOpen === cat.slug ? "rotate-180" : ""}`}
                        />
                      </button>
                      {mobileOpen === cat.slug && (
                        <div className="border-t border-slate-100 bg-slate-50/50 pb-2 pl-8 pr-4">
                          <Link
                            href={`/category/${cat.slug}`}
                            className="block py-2 text-sm text-slate-600 hover:text-[var(--teal-from)]"
                            onClick={() => setMobileOpen(null)}
                          >
                            All {cat.name}
                          </Link>
                          {cat.subcategories.map((sub) => (
                            <Link
                              key={sub.fullSlug}
                              href={`/category/${sub.fullSlug}`}
                              className="block py-2 text-sm text-slate-600 hover:text-[var(--teal-from)]"
                              onClick={() => setMobileOpen(null)}
                            >
                              {sub.name}
                            </Link>
                          ))}
                        </div>
                      )}
                    </>
                  ) : (
                    <Link
                      href={`/category/${cat.slug}`}
                      className="flex items-center gap-3 px-4 py-3 text-sm font-medium text-slate-700"
                    >
                      <Icon className="h-5 w-5 shrink-0 text-slate-500" />
                      <span className="flex-1">{cat.name}</span>
                      <ChevronRight className="h-4 w-4 shrink-0 text-slate-400" />
                    </Link>
                  )}
                </div>
              </div>
            );
          })}
        </nav>
      </aside>

      {/* Desktop flyout panel: subcategories + products */}
      {activeCategory && activeCategory.subcategories.length > 0 && (
        <div
          ref={panelRef}
          className="absolute left-full top-0 z-50 ml-1 hidden rounded-card border border-[var(--border-light)] bg-white shadow-card lg:flex"
          onMouseEnter={handlePanelEnter}
          onMouseLeave={handlePanelLeave}
          role="menu"
          aria-label={`${activeCategory.name} subcategories`}
        >
          <div className="min-w-[200px] border-r border-slate-100 py-3">
            <Link
              href={`/category/${activeCategory.slug}`}
              className="block px-4 py-2 text-sm font-semibold text-[var(--teal-from)] hover:bg-[var(--brand-muted)]"
              role="menuitem"
            >
              All {activeCategory.name}
            </Link>
            {activeCategory.subcategories.map((sub) => (
              <Link
                key={sub.fullSlug}
                href={`/category/${sub.fullSlug}`}
                onMouseEnter={() => handleSubEnter(sub)}
                onMouseLeave={handleSubLeave}
                className={`block px-4 py-2 text-sm hover:bg-[var(--brand-muted)] ${
                  activeSubcategory?.fullSlug === sub.fullSlug ? "bg-[var(--brand-muted)] font-medium text-[var(--teal-from)]" : "text-slate-700"
                }`}
                role="menuitem"
              >
                {sub.name}
              </Link>
            ))}
          </div>
          {activeSubcategory && (
            <div className="min-w-[280px] max-w-[340px] p-3" onMouseEnter={() => subTimeoutRef.current && clearTimeout(subTimeoutRef.current)} onMouseLeave={handleSubLeave}>
              <p className="mb-2 text-xs font-semibold uppercase tracking-wider text-slate-500">{activeSubcategory.name}</p>
              {subProducts.length > 0 ? (
                <div className="grid grid-cols-2 gap-2">
                  {subProducts.map((p) => (
                    <Link
                      key={p.id}
                      href={buildProductRoute({
                        categorySlug: activeCategory?.slug ?? "general",
                        subcategorySlug: activeSubcategory?.slug ?? activeCategory?.slug ?? "general",
                        id: p.id,
                      })}
                      className="flex gap-2 rounded-lg p-2 transition hover:bg-slate-50"
                    >
                      <div className="relative h-12 w-12 shrink-0 overflow-hidden rounded-md bg-slate-100">
                        <SafeImage src={p.image} alt={p.name} fill className="object-cover" sizes="48px" />
                      </div>
                      <div className="min-w-0 flex-1">
                        <p className="truncate text-xs font-medium text-slate-800">{p.name}</p>
                        <p className="text-xs font-bold text-[var(--teal-from)]">৳{p.price.toLocaleString("en-BD")}</p>
                      </div>
                    </Link>
                  ))}
                </div>
              ) : (
                <p className="py-4 text-center text-sm text-slate-500">Loading…</p>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
