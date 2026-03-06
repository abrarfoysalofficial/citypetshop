"use client";

import Link from "next/link";
import SafeImage from "@/components/media/SafeImage";
import TwoToneText from "@/components/ui/TwoToneText";

const BANNERS = [
  { id: "1", title: "Cat Deals", subtitle: "Up to 25% off", image: "/ui/blog-cover.svg", href: "/shop?category=cat-accessories" },
  { id: "2", title: "Dog Food", subtitle: "Premium nutrition", image: "/ui/blog-cover.svg", href: "/shop?category=dog-food" },
  { id: "3", title: "Special Combo Offer", subtitle: "Bundle & save up to 30%", image: "/ui/blog-cover.svg", href: "/combo-offers" },
];

export default function PromoBanners() {
  return (
    <section className="py-6 md:py-8">
      <div className="mx-auto max-w-7xl px-3 md:px-6 lg:px-8">
        {/* 2-col on mobile avoids 3 stacked full-width banners */}
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:gap-4">
          {BANNERS.map((b) => (
            <Link
              key={b.id}
              href={b.href}
              className="group relative overflow-hidden rounded-card border border-[var(--border-light)] bg-slate-100 shadow-soft transition hover:shadow-card"
            >
              <div className="relative aspect-[3/2] w-full">
                <SafeImage
                  src={b.image}
                  alt={b.title}
                  fill
                  fallbackSrc="/ui/hero-16x9.svg"
                  className="object-cover transition duration-300 group-hover:scale-105"
                  sizes="(max-width: 640px) 100vw, 33vw"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
                <div className="absolute bottom-0 left-0 right-0 p-4">
                  <h3 className="text-lg font-bold">
                    <TwoToneText primary={b.title} secondary={b.subtitle} order="primary-first" variant="on-dark" as="span" />
                  </h3>
                  <span className="mt-2 inline-block rounded-lg bg-gradient-teal px-4 py-2 text-sm font-semibold text-white shadow-soft transition-opacity hover:opacity-95">
                    Shop Now
                  </span>
                </div>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}
