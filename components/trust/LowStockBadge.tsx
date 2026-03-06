"use client";

import { DEFAULT_LOW_STOCK_THRESHOLD } from "@lib/commerce-settings";

/**
 * Shows a pulsing red "Only [x] left in stock!" when quantity is below threshold.
 * Syncs with real-time data from the current data source (product.stockQuantity).
 * Threshold is admin-configurable via DEFAULT_LOW_STOCK_THRESHOLD or passed as prop.
 */
interface LowStockBadgeProps {
  quantity: number;
  /** Admin-configurable threshold; defaults to DEFAULT_LOW_STOCK_THRESHOLD */
  threshold?: number;
  className?: string;
}

export default function LowStockBadge({
  quantity,
  threshold = DEFAULT_LOW_STOCK_THRESHOLD,
  className = "",
}: LowStockBadgeProps) {
  if (quantity > threshold || quantity <= 0) return null;
  return (
    <span
      className={`inline-flex items-center rounded-md bg-red-100 px-2.5 py-1 text-sm font-semibold text-red-700 shadow-sm ring-1 ring-red-200/60 ${className}`}
      role="status"
      aria-live="polite"
    >
      <span className="relative flex h-2 w-2 mr-1.5">
        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75" />
        <span className="relative inline-flex rounded-full h-2 w-2 bg-red-500" />
      </span>
      Only {quantity} left in stock!
    </span>
  );
}
