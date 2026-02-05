"use client";

import Link from "next/link";
import { ChevronLeft, ChevronRight, Phone } from "lucide-react";
import { useState, useEffect, useCallback } from "react";
import SafeImage from "@/components/media/SafeImage";

type Slide = { id: string; title: string; subheadline?: string; image: string; href: string; cta?: string };
type SideBanner = { id: string; title: string; subtitle: string; image: string; href: string; cta: string };

const DEFAULT_SLIDES: Slide[] = [
  { id: "1", title: "Big Sale on Cat Food", image: "/ui/hero-16x9.svg", href: "/category/cat-food" },
  { id: "2", title: "New Toys Arrival", image: "/ui/hero-16x9.svg", href: "/category/toys-scratchers" },
  { id: "3", title: "Premium Dog Food", image: "/ui/hero-16x9.svg", href: "/category/dog-food" },
];

const DEFAULT_SIDE_BANNERS: SideBanner[] = [
  { id: "1", title: "Vet Service", subtitle: "Call Now", image: "/ui/hero-16x9.svg", href: "/contact", cta: "Book Now" },
  { id: "2", title: "Flash Sale", subtitle: "Up to 30% Off", image: "/ui/hero-16x9.svg", href: "/offers", cta: "Shop Now" },
];

const AUTO_PLAY_MS = 5000;

interface HeroSectionProps {
  slides?: Slide[];
  sideBanners?: SideBanner[];
}

export default function HeroSection({ slides = DEFAULT_SLIDES, sideBanners = DEFAULT_SIDE_BANNERS }: HeroSectionProps) {
  const [current, setCurrent] = useState(0);
  const list = slides.length ? slides : DEFAULT_SLIDES;

  const goNext = useCallback(() => {
    setCurrent((prev) => (prev + 1) % list.length);
  }, [list.length]);

  const goPrev = useCallback(() => {
    setCurrent((prev) => (prev - 1 + list.length) % list.length);
  }, [list.length]);

  useEffect(() => {
    const t = setInterval(goNext, AUTO_PLAY_MS);
    return () => clearInterval(t);
  }, [goNext]);

  return (
    <section className="w-full bg-slate-100 py-4">
      <div className="mx-auto grid max-w-content grid-cols-1 gap-4 px-4 lg:grid-cols-4 lg:px-8">
        <div className="relative overflow-hidden rounded-xl bg-slate-200 lg:col-span-3">
          <div className="relative aspect-[16/9] w-full">
            {list.map((slide, i) => (
              <Link
                key={slide.id}
                href={slide.href}
                className={`absolute inset-0 block transition-opacity duration-500 ${
                  i === current ? "opacity-100 z-10" : "opacity-0 z-0"
                }`}
              >
                <SafeImage
                  src={slide.image}
                  alt={slide.title}
                  fill
                  fallbackSrc="/ui/hero-16x9.svg"
                  priority={i === 0}
                  sizes="(max-width: 1024px) 100vw, 75vw"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/30 to-transparent" />
                <div className="absolute bottom-4 left-4 right-4 sm:bottom-6 sm:left-6 sm:right-6">
                  <h2 className="text-xl font-extrabold leading-tight text-white drop-shadow-[0_2px_8px_rgba(0,0,0,0.8)] sm:text-3xl lg:text-4xl">
                    {slide.title}
                  </h2>
                  {slide.subheadline && (
                    <p className="mt-1 text-sm font-bold text-white/90 sm:text-base">{slide.subheadline}</p>
                  )}
                </div>
              </Link>
            ))}
          </div>
          <button
            onClick={goPrev}
            className="absolute left-2 top-1/2 z-20 -translate-y-1/2 rounded-full bg-white/90 p-2 shadow-lg transition hover:bg-white lg:left-4"
            aria-label="Previous slide"
          >
            <ChevronLeft className="h-6 w-6 text-slate-900" />
          </button>
          <button
            onClick={goNext}
            className="absolute right-2 top-1/2 z-20 -translate-y-1/2 rounded-full bg-white/90 p-2 shadow-lg transition hover:bg-white lg:right-4"
            aria-label="Next slide"
          >
            <ChevronRight className="h-6 w-6 text-slate-900" />
          </button>
          <div className="absolute bottom-3 left-0 right-0 z-20 flex justify-center gap-2">
            {list.map((_, i) => (
              <button
                key={i}
                onClick={() => setCurrent(i)}
                className={`h-2 rounded-full transition-all ${
                  i === current ? "w-6 bg-accent" : "w-2 bg-white/70 hover:bg-white"
                }`}
                aria-label={`Go to slide ${i + 1}`}
              />
            ))}
          </div>
        </div>
        <div className="flex flex-col gap-4 lg:col-span-1">
          {sideBanners.map((banner) => (
            <Link
              key={banner.id}
              href={banner.href}
              className="group relative flex-1 overflow-hidden rounded-xl bg-slate-200"
            >
              <div className="relative aspect-[4/3] w-full lg:aspect-square">
                <SafeImage
                  src={banner.image}
                  alt={banner.title}
                  fill
                  fallbackSrc="/ui/hero-16x9.svg"
                  sizes="(max-width: 1024px) 100vw, 25vw"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/75 via-black/40 to-transparent" />
                <div className="absolute inset-0 flex flex-col items-center justify-center p-4 text-center">
                  <h3 className="text-lg font-extrabold leading-tight text-white drop-shadow-[0_2px_6px_rgba(0,0,0,0.9)] sm:text-2xl lg:text-3xl">{banner.title}</h3>
                  <p className="mt-1 text-sm font-bold text-white drop-shadow-[0_1px_4px_rgba(0,0,0,0.8)] sm:text-base lg:text-lg">{banner.subtitle}</p>
                  <span className="mt-4 inline-flex items-center gap-1.5 rounded-lg bg-accent px-5 py-2.5 text-sm font-bold text-white shadow-lg transition hover:bg-orange-600 sm:text-base">
                    {banner.id === "1" && <Phone className="h-4 w-4 sm:h-5 sm:w-5" />}
                    {banner.cta}
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
