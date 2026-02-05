"use client";

/**
 * Skeleton for product detail page – prevents CLS while loading.
 */
export default function ProductDetailSkeleton() {
  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
      <div className="mb-8 h-4 w-48 animate-pulse rounded bg-slate-200" />
      <div className="grid gap-8 lg:grid-cols-2">
        <div className="space-y-4">
          <div
            className="relative aspect-square animate-pulse overflow-hidden rounded-xl bg-slate-200"
          />
          <div className="flex gap-2">
            {[1, 2, 3, 4].map((i) => (
              <div
                key={i}
                className="h-20 w-20 shrink-0 animate-pulse rounded-lg bg-slate-200"
              />
            ))}
          </div>
        </div>
        <div>
          <div className="h-6 w-24 animate-pulse rounded bg-slate-200" />
          <div className="mt-4 h-9 w-3/4 animate-pulse rounded bg-slate-200" />
          <div className="mt-2 h-7 w-32 animate-pulse rounded bg-slate-200" />
          <div className="mt-4 h-4 w-full animate-pulse rounded bg-slate-200" />
          <div className="mt-2 h-4 w-5/6 animate-pulse rounded bg-slate-200" />
          <div className="mt-6 flex gap-4">
            <div className="h-12 w-24 animate-pulse rounded-lg bg-slate-200" />
            <div className="h-12 flex-1 animate-pulse rounded-lg bg-slate-200" />
            <div className="h-12 flex-1 animate-pulse rounded-lg bg-slate-200" />
          </div>
        </div>
      </div>
    </div>
  );
}
