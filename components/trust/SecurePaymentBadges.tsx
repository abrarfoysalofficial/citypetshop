"use client";

/**
 * Secure payment badges – labels/URLs from Admin; no hardcoded payment config.
 */
interface SecurePaymentBadgesProps {
  /** List of badge labels or "icon" keys (e.g. ["SSL", "bKash", "COD"]) */
  badges?: string[] | null;
  className?: string;
}

export default function SecurePaymentBadges({
  badges,
  className = "",
}: SecurePaymentBadgesProps) {
  if (!badges?.length) return null;
  return (
    <div className={`flex flex-wrap items-center gap-2 text-sm text-slate-500 ${className}`}>
      <span className="font-medium">Secure payment</span>
      {badges.map((b) => (
        <span
          key={b}
          className="rounded border border-slate-200 bg-slate-50 px-2 py-0.5 text-xs font-medium text-slate-600"
        >
          {b}
        </span>
      ))}
    </div>
  );
}
