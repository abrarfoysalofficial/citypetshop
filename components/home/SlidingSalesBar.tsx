"use client";

import { useState } from "react";
import { useSiteSettings } from "@/store/SiteSettingsContext";

const DEFAULT_TEXT =
  "City Plus Pet Shop — 100% Authentic Pet Supplies • Fast Delivery • Best Price Guarantee • Hotline: 01643-390045";

export default function SlidingSalesBar() {
  const { settings } = useSiteSettings();
  const [isPaused, setIsPaused] = useState(false);

  const enabled = settings?.sales_top_bar_enabled !== false;
  const text = (settings?.sales_top_bar_text?.trim() || DEFAULT_TEXT) || DEFAULT_TEXT;

  if (!enabled || !text) return null;

  return (
    <div
      className="relative w-full overflow-hidden border-b border-white/10 bg-[var(--header-bg)] py-2 text-sm font-medium text-white/90"
      style={{ minHeight: 40 }}
      onMouseEnter={() => setIsPaused(true)}
      onMouseLeave={() => setIsPaused(false)}
    >
      <div
        className={`inline-flex w-max whitespace-nowrap ${isPaused ? "" : "animate-slide-sales"}`}
      >
        <span className="shrink-0 px-8" aria-live="polite">
          {text}
        </span>
        <span className="shrink-0 px-8" aria-hidden>
          {text}
        </span>
        <span className="shrink-0 px-8" aria-hidden>
          {text}
        </span>
      </div>
    </div>
  );
}
