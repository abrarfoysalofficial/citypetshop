"use client";

import Link from "next/link";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { useRef, useMemo } from "react";
import SafeImage from "@/components/media/SafeImage";
import { MASTER_BRANDS, isFeaturedBrand } from "@lib/brands-master";

export default function FeaturedBrandsSlider() {
  const scrollRef = useRef<HTMLDivElement>(null);
  const featuredBrands = useMemo(() => MASTER_BRANDS.filter((b) => isFeaturedBrand(b.slug)), []);

  const scroll = (dir: "left" | "right") => {
    if (!scrollRef.current) return;
    const step = 200;
    scrollRef.current.scrollBy({ left: dir === "left" ? -step : step, behavior: "smooth" });
  };

  return (
    <section className="border-y border-slate-200 bg-white py-10">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <h2 className="mb-6 text-center text-xl font-bold text-slate-900">Featured Brands</h2>
        <div className="relative">
          <button
            type="button"
            onClick={() => scroll("left")}
            className="absolute left-0 top-1/2 z-10 -translate-y-1/2 rounded-full bg-slate-100 p-2 shadow-md hover:bg-slate-200 lg:-left-4"
            aria-label="Previous brands"
          >
            <ChevronLeft className="h-5 w-5 text-slate-700" />
          </button>
          <div
            ref={scrollRef}
            className="flex gap-8 overflow-x-auto scroll-smooth py-4 scrollbar-hide"
            style={{ scrollbarWidth: "none", msOverflowStyle: "none" }}
          >
            {featuredBrands.map((b) => (
              <Link
                key={b.id}
                href={`/shop?brand=${b.slug}`}
                className="flex shrink-0 items-center justify-center rounded-xl border-2 border-slate-200 bg-slate-50 px-6 py-5 transition hover:border-primary hover:bg-white min-w-[120px] max-w-[140px]"
              >
                {b.logo ? (
                  <div className="relative h-12 w-24 shrink-0">
                    <SafeImage
                      src={b.logo}
                      alt={`${b.name} pet food brand in Bangladesh`}
                      fill
                      className="object-contain"
                      sizes="140px"
                      showShimmer={false}
                      priority={false}
                    />
                  </div>
                ) : (
                  <span className="text-center text-sm font-bold text-slate-800">{b.name}</span>
                )}
              </Link>
            ))}
          </div>
          <button
            type="button"
            onClick={() => scroll("right")}
            className="absolute right-0 top-1/2 z-10 -translate-y-1/2 rounded-full bg-slate-100 p-2 shadow-md hover:bg-slate-200 lg:-right-4"
            aria-label="Next brands"
          >
            <ChevronRight className="h-5 w-5 text-slate-700" />
          </button>
        </div>
      </div>
    </section>
  );
}
