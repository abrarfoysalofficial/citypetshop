"use client";

/**
 * Delivery ETA text – must come from Admin/settings, not hardcoded.
 */
interface DeliveryETAProps {
  /** ETA for inside delivery zone (e.g. "2–4 business days") */
  inside?: string | null;
  /** ETA for outside delivery zone (e.g. "4–7 business days") */
  outside?: string | null;
  /** Which zone to show (e.g. from checkout/address) */
  zone?: "inside" | "outside";
  className?: string;
}

export default function DeliveryETA({
  inside,
  outside,
  zone = "inside",
  className = "",
}: DeliveryETAProps) {
  const text = zone === "inside" ? inside : outside;
  if (!text?.trim()) return null;
  return (
    <p className={`text-sm text-slate-600 ${className}`}>
      Delivery: {text}
    </p>
  );
}
