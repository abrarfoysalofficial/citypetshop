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
    <section className="relative w-full overflow-hidden bg-slate-900">
      <div className="relative aspect-[21/9] w-full min-h-[280px] sm:min-h-[320px] lg:min-h-[400px]">
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
            <div className="absolute inset-0 flex flex-col justify-center px-6 sm:px-10 md:px-16 lg:px-24">
              {slide.discountText && (
                <span className="mb-3 inline-block w-fit rounded-md bg-brand px-4 py-2 text-lg font-black uppercase tracking-wider text-white shadow-lg sm:text-xl">
                  {slide.discountText}
                </span>
              )}
              <h2 className="max-w-xl text-3xl font-extrabold leading-tight drop-shadow-lg sm:text-4xl md:text-5xl lg:text-6xl">
                <TwoToneText primary={slide.title} variant="on-dark" as="span" />
              </h2>
              {slide.subheadline && (
                <p className="mt-2 max-w-md text-lg font-semibold text-white/95 sm:text-xl">{slide.subheadline}</p>
              )}
              <span className="mt-6 inline-flex w-fit items-center gap-2 rounded-lg bg-white px-6 py-3 text-base font-bold text-slate-900 shadow-xl transition hover:bg-slate-100">
                {slide.cta ?? "Shop Now"}
              </span>
            </div>
          </Link>
        ))}
        <button
          onClick={(e) => { e.preventDefault(); goPrev(); }}
          className="absolute left-3 top-1/2 z-20 -translate-y-1/2 rounded-full bg-white/90 p-2.5 shadow-lg transition hover:bg-white md:left-6"
          aria-label="Previous"
        >
          <ChevronLeft className="h-6 w-6 text-slate-900" />
        </button>
        <button
          onClick={(e) => { e.preventDefault(); goNext(); }}
          className="absolute right-3 top-1/2 z-20 -translate-y-1/2 rounded-full bg-white/90 p-2.5 shadow-lg transition hover:bg-white md:right-6"
          aria-label="Next"
        >
          <ChevronRight className="h-6 w-6 text-slate-900" />
        </button>
        <div className="absolute bottom-4 left-0 right-0 z-20 flex justify-center gap-2">
          {list.map((_, i) => (
            <button
              key={i}
              onClick={(e) => { e.preventDefault(); setCurrent(i); }}
              className={`h-2 rounded-full transition-all ${i === current ? "w-8 bg-white" : "w-2 bg-white/60 hover:bg-white/80"}`}
              aria-label={`Slide ${i + 1}`}
            />
          ))}
        </div>
      </div>
    </section>
  );
}
