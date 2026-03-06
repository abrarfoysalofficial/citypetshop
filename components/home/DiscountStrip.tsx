"use client";

import Link from "next/link";
import { ArrowRight } from "lucide-react";

export default function DiscountStrip() {
  return (
    <section className="mx-3 mb-4 rounded-card bg-gradient-to-r from-[var(--teal-from)] to-[var(--teal-to)] shadow-soft md:mx-6 lg:mx-8">
      <div className="mx-auto flex max-w-7xl flex-wrap items-center justify-center gap-3 px-4 py-4 text-center sm:justify-between md:px-6 lg:px-8">
        <p className="text-sm font-bold text-white sm:text-base md:text-lg lg:text-xl">
          Subscribe & Get <span className="underline decoration-2 underline-offset-2">10% Off</span> on your first order
        </p>
        <form
          onSubmit={(e) => e.preventDefault()}
          className="flex flex-wrap items-center justify-center gap-2"
        >
          <input
            type="email"
            placeholder="Enter your email"
            className="rounded-full border-0 px-4 py-2.5 text-sm text-slate-800 placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-white/50"
            aria-label="Email for newsletter"
          />
          <button
            type="submit"
            className="inline-flex items-center gap-2 rounded-full bg-white px-4 py-2.5 text-sm font-bold text-[var(--teal-from)] shadow-soft transition hover:bg-slate-100"
          >
            Subscribe
            <ArrowRight className="h-4 w-4" />
          </button>
        </form>
      </div>
    </section>
  );
}
