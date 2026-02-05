"use client";

import Link from "next/link";
import { ArrowRight } from "lucide-react";

export default function DiscountStrip() {
  return (
    <section className="w-full bg-brand py-4">
      <div className="mx-auto flex max-w-7xl flex-wrap items-center justify-center gap-4 px-4 py-3 text-center sm:justify-between sm:px-6 lg:px-8">
        <p className="text-lg font-bold text-white sm:text-xl">
          Learn how to get a <span className="underline decoration-2 underline-offset-2">30% discount</span> on all products
        </p>
        <Link
          href="/offers"
          className="inline-flex items-center gap-2 rounded-lg bg-white px-5 py-2.5 text-sm font-bold text-brand shadow-md transition hover:bg-slate-100"
        >
          View Offers
          <ArrowRight className="h-4 w-4" />
        </Link>
      </div>
    </section>
  );
}
