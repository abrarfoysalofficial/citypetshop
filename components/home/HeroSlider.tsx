"use client";

import Link from "next/link";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { useState, useEffect, useCallback } from "react";
import SafeImage from "@/components/media/SafeImage";
import TwoToneText from "@/components/ui/TwoToneText";

export interface HeroSlide {
  id: string;
  title: string;
  subheadline?: string;
  image: string;
  href: string;
  cta?: string;
  discountText?: string;
}

const DEFAULT_SLIDES: HeroSlide[] = [
  { id: "1", title: "Premium Pet Food", subheadline: "Quality nutrition for your furry friends", image: "https://images.unsplash.com/photo-1587300003388-59208cc962cb?w=1200", href: "/shop", cta: "Shop Now", discountText: "SAVE UP 30%" },
  { id: "2", title: "Cat & Dog Essentials", subheadline: "Everything you need in one place", image: "https://images.unsplash.com/photo-1548199973-03cce0bbc87b?w=1200", href: "/category/dog-food", cta: "Shop Now", discountText: "UP TO 25% OFF" },
  { id: "3", title: "New Arrivals", subheadline: "Fresh stock every week", image: "https://images.unsplash.com/photo-1450778869180-41d0601e046e?w=1200", href: "/combo-offers", cta: "View Combos", discountText: "SAVE UP 30%" },
];

const AUTO_PLAY_MS = 5500;

interface HeroSliderProps {
  slides?: HeroSlide[];
}

export default function HeroSlider({ slides = DEFAULT_SLIDES }: HeroSliderProps) {
  const [current, setCurrent] = useState(0);
  const list = slides.length ? slides : DEFAULT_SLIDES;

  const goNext = useCallback(() => setCurrent((prev) => (prev + 1) % list.length), [list.length]);
  const goPrev = useCallback(() => setCurrent((prev) => (prev - 1 + list.length) % list.length), [list.length]);

  useEffect(() => {
    const t = setInterval(goNext, AUTO_PLAY_MS);
    return () => clearInterval(t);
  }, [goNext]);

  return (
    <section className="relative w-full overflow-hidden rounded-xl bg-slate-900 md:rounded-none">
      {/* aspect-[16/9] on mobile reserves space before images load → prevents CLS */}
      <div className="relative w-full aspect-[16/9] min-h-[180px] sm:min-h-[220px] md:aspect-[21/9] md:min-h-[320px] lg:min-h-[400px]">
        {list.map((slide, i) => (
          <Link
            key={slide.id}
            href={slide.href}
            className={`absolute inset-0 block transition-opacity duration-700 ease-in-out ${i === current ? "opacity-100 z-10" : "opacity-0 z-0"}`}
          >
            <SafeImage
              src={slide.image}
              alt={slide.title}
              fill
              fallbackSrc="/ui/hero-16x9.svg"
              priority={i === 0}
              sizes="100vw"
              className="object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-r from-black/60 via-black/30 to-transparent" />
            <div className="absolute inset-0 flex flex-col justify-center px-4 sm:px-6 md:px-10 lg:px-24">
              {slide.discountText && (
                <span className="mb-2 inline-block w-fit rounded-md bg-brand px-3 py-1.5 text-xs font-black uppercase tracking-wider text-white shadow-lg sm:mb-3 sm:px-4 sm:py-2 sm:text-lg md:text-xl">
                  {slide.discountText}
                </span>
              )}
              <h2 className="max-w-sm text-xl font-extrabold leading-tight drop-shadow-lg sm:max-w-xl sm:text-3xl md:text-5xl lg:text-6xl">
                <TwoToneText primary={slide.title} variant="on-dark" as="span" />
              </h2>
              {slide.subheadline && (
                <p className="mt-1 max-w-xs text-sm font-semibold text-white/95 sm:mt-2 sm:max-w-md sm:text-lg md:text-xl">{slide.subheadline}</p>
              )}
              <span className="mt-3 inline-flex w-fit items-center gap-2 rounded-lg bg-white px-4 py-2 text-sm font-bold text-slate-900 shadow-xl transition hover:bg-slate-100 sm:mt-6 sm:px-6 sm:py-3 sm:text-base">
                {slide.cta ?? "Shop Now"}
              </span>
            </div>
          </Link>
        ))}
        <button
          onClick={(e) => { e.preventDefault(); goPrev(); }}
          className="absolute left-2 top-1/2 z-20 -translate-y-1/2 rounded-full bg-white/90 p-2 shadow-lg transition hover:bg-white md:left-6 md:p-2.5"
          aria-label="Previous slide"
        >
          <ChevronLeft className="h-5 w-5 text-slate-900 md:h-6 md:w-6" />
        </button>
        <button
          onClick={(e) => { e.preventDefault(); goNext(); }}
          className="absolute right-2 top-1/2 z-20 -translate-y-1/2 rounded-full bg-white/90 p-2 shadow-lg transition hover:bg-white md:right-6 md:p-2.5"
          aria-label="Next slide"
        >
          <ChevronRight className="h-5 w-5 text-slate-900 md:h-6 md:w-6" />
        </button>
        <div className="absolute bottom-2 left-0 right-0 z-20 flex justify-center gap-1.5 md:bottom-4 md:gap-2">
          {list.map((_, i) => (
            <button
              key={i}
              onClick={(e) => { e.preventDefault(); setCurrent(i); }}
              className={`h-1.5 rounded-full transition-all md:h-2 ${i === current ? "w-6 bg-white md:w-8" : "w-1.5 bg-white/60 hover:bg-white/80 md:w-2"}`}
              aria-label={`Go to slide ${i + 1}`}
            />
          ))}
        </div>
      </div>
    </section>
  );
}
