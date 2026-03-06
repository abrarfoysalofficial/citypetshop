"use client";

import Link from "next/link";
import { Package } from "lucide-react";
import SafeImage from "@/components/media/SafeImage";
import type { ComboOffer } from "@/src/data/types";

interface HomeComboBlockProps {
  combos: ComboOffer[];
  title?: string;
  subtitle?: string;
}

export default function HomeComboBlock({
  combos,
  title = "Combo Offers",
  subtitle = "Bundle and save.",
}: HomeComboBlockProps) {
  if (combos.length === 0) return null;

  return (
    <section className="py-12 sm:py-16">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex flex-wrap items-end justify-between gap-4">
          <div>
            <h2 className="text-2xl font-extrabold text-slate-900 sm:text-3xl">
              {title}
            </h2>
            {subtitle && (
              <p className="mt-2 max-w-xl text-slate-600">{subtitle}</p>
            )}
          </div>
          <Link
            href="/combo-offers"
            className="font-semibold text-[var(--teal-from)] hover:underline"
          >
            View all →
          </Link>
        </div>
        <div className="mt-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {combos.slice(0, 6).map((combo) => (
            <Link
              key={combo.id}
              href={combo.href}
              className="group flex flex-col overflow-hidden rounded-card border border-[var(--border-light)] bg-white shadow-soft transition-all duration-200 hover:-translate-y-1 hover:shadow-card"
            >
              <div className="relative aspect-[4/3] w-full overflow-hidden bg-gray-100">
                <SafeImage
                  src={combo.image}
                  alt={combo.title}
                  fill
                  fallbackSrc="/ui/product-4x3.svg"
                  sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                  className="object-cover transition group-hover:scale-105"
                />
                {combo.comparePrice != null && combo.comparePrice > combo.price && (
                  <span className="absolute right-2 top-2 rounded-md bg-red-500 px-2 py-0.5 text-xs font-bold text-white">
                    {Math.round(
                      ((combo.comparePrice - combo.price) / combo.comparePrice) *
                        100
                    )}
                    % OFF
                  </span>
                )}
              </div>
              <div className="flex flex-1 flex-col p-5">
                <h3 className="font-bold text-slate-900 group-hover:text-[var(--teal-from)] sm:text-lg">
                  {combo.title}
                </h3>
                <p className="mt-1 line-clamp-2 text-sm text-slate-700">
                  {combo.description}
                </p>
                <div className="mt-3 flex items-center gap-2">
                  <p className="text-base font-bold text-[var(--teal-from)] sm:text-lg">
                    ৳{combo.price.toLocaleString("en-BD")}
                  </p>
                  {combo.comparePrice != null &&
                    combo.comparePrice > combo.price && (
                      <p className="text-sm text-gray-500 line-through">
                        ৳{combo.comparePrice.toLocaleString("en-BD")}
                      </p>
                    )}
                </div>
                <span className="mt-3 inline-flex items-center gap-2 font-semibold text-brand group-hover:underline">
                  <Package className="h-4 w-4" /> {combo.cta ?? "View Deal"}
                </span>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}
