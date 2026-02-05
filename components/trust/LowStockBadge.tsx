"use client";

/**
 * Shows "Only X left" when quantity is below threshold. Threshold is admin-configurable (passed as prop).
 */
interface LowStockBadgeProps {
  quantity: number;
  threshold?: number;
  className?: string;
}

export default function LowStockBadge({
  quantity,
  threshold = 10,
  className = "",
}: LowStockBadgeProps) {
  if (quantity > threshold || quantity <= 0) return null;
  return (
    <span
      className={`inline-flex items-center rounded-md bg-amber-100 px-2 py-0.5 text-sm font-medium text-amber-800 ${className}`}
      role="status"
    >
      Only {quantity} left
    </span>
  );
}
