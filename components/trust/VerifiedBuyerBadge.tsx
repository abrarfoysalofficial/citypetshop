"use client";

import { CheckCircle } from "lucide-react";

/**
 * Verified purchase badge – show when review is linked to a delivered order (admin/API sets verified).
 */
interface VerifiedBuyerBadgeProps {
  verified?: boolean;
  className?: string;
}

export default function VerifiedBuyerBadge({
  verified,
  className = "",
}: VerifiedBuyerBadgeProps) {
  if (!verified) return null;
  return (
    <span
      className={`inline-flex items-center gap-1 text-xs font-medium text-emerald-600 ${className}`}
      title="Verified purchase"
    >
      <CheckCircle className="h-3.5 w-3.5" />
      Verified purchase
    </span>
  );
}
