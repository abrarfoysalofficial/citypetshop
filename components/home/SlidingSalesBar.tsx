"use client";

import { useState, useEffect } from "react";

const DEFAULT_TEXT =
  "City Plus Pet Shop — 100% Authentic Pet Supplies • Fast Delivery • Best Price Guarantee • Hotline: 01643-390045";

export default function SlidingSalesBar() {
  const [text, setText] = useState(DEFAULT_TEXT);
  const [enabled, setEnabled] = useState(true);
  const [isPaused, setIsPaused] = useState(false);

  useEffect(() => {
    fetch("/api/settings/sales-top-bar")
      .then((r) => r.json())
      .then((d) => {
        const data = d as { text?: string; enabled?: boolean };
        if (data.enabled === false) setEnabled(false);
        const t = data.text;
        if (t && typeof t === "string" && t.trim()) setText(t.trim());
      })
      .catch(() => {});
  }, []);

  if (!enabled || !text) return null;

  return (
    <div
      className="relative w-full overflow-hidden border-b border-slate-200 bg-slate-50 py-2 text-sm font-medium text-slate-700"
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
