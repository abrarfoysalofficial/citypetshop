"use client";

import Link from "next/link";
import { ArrowRight } from "lucide-react";

export default function DiscountStrip() {
  return (
    <section className="w-full bg-brand">
      <div className="mx-auto flex max-w-7xl flex-wrap items-center justify-center gap-3 px-4 py-4 text-center sm:justify-between md:px-6 lg:px-8">
        <p className="text-sm font-bold text-white sm:text-base md:text-lg lg:text-xl">
          Learn how to get a <span className="underline decoration-2 underline-offset-2">30% discount</span> on all products
        </p>
        <Link
          href="/offers"
          className="inline-flex items-center gap-2 rounded-lg bg-white px-4 py-2 text-sm font-bold text-brand shadow-sm transition hover:bg-slate-100"
        >
          View Offers
          <ArrowRight className="h-4 w-4" />
        </Link>
      </div>
    </section>
  );
}
