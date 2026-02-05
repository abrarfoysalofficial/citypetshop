"use client";

/**
 * Skeleton for product card – fixed aspect ratio to avoid CLS.
 */
export default function ProductCardSkeleton() {
  return (
    <div className="flex flex-col overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm">
      <div
        className="relative w-full overflow-hidden bg-slate-200"
        style={{ aspectRatio: "4/3" }}
      >
        <div className="h-full w-full animate-pulse bg-slate-300" />
      </div>
      <div className="flex flex-1 flex-col p-4">
        <div className="h-4 w-3/4 animate-pulse rounded bg-slate-200" />
        <div className="mt-2 h-5 w-1/2 animate-pulse rounded bg-slate-200" />
        <div className="mt-3 h-4 w-1/3 animate-pulse rounded bg-slate-200" />
        <div className="mt-4 h-10 w-full animate-pulse rounded-lg bg-slate-200" />
      </div>
    </div>
  );
}
