"use client";

import Link from "next/link";
import SafeImage from "@/components/media/SafeImage";
import TwoToneText from "@/components/ui/TwoToneText";

const BANNERS = [
  { id: "1", title: "Cat Deals", subtitle: "Up to 25% off", image: "https://images.unsplash.com/photo-1514888286974-6c03e2ca1dba?w=600", href: "/category/cat-accessories" },
  { id: "2", title: "Dog Food", subtitle: "Premium nutrition", image: "https://images.unsplash.com/photo-1587300003388-59208cc962cb?w=600", href: "/category/dog-food" },
  { id: "3", title: "Care & Health", subtitle: "Vet recommended", image: "https://images.unsplash.com/photo-1548199973-03cce0bbc87b?w=600", href: "/category/care-health" },
];

export default function PromoBanners() {
  return (
    <section className="py-8">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="grid gap-4 sm:grid-cols-3">
          {BANNERS.map((b) => (
            <Link
              key={b.id}
              href={b.href}
              className="group relative overflow-hidden rounded-xl border border-slate-200 bg-slate-100 shadow-sm transition hover:shadow-lg"
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
                  <span className="mt-2 inline-block rounded bg-white/90 px-4 py-2 text-sm font-semibold text-slate-900 transition group-hover:bg-white">
                    View More
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
