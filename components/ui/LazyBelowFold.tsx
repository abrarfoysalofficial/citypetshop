"use client";

import { useState, useEffect, useRef, type ReactNode } from "react";

interface LazyBelowFoldProps {
  children: ReactNode;
  /** Fallback until in view (skeleton height) */
  fallback?: ReactNode;
  /** Root margin for IntersectionObserver (e.g. "100px" to trigger earlier) */
  rootMargin?: string;
}

export default function LazyBelowFold({
  children,
  fallback = <div className="min-h-[120px] animate-pulse rounded-xl bg-slate-100" />,
  rootMargin = "100px",
}: LazyBelowFoldProps) {
  const [isVisible, setIsVisible] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const obs = new IntersectionObserver(
      ([entry]) => {
        if (entry?.isIntersecting) setIsVisible(true);
      },
      { rootMargin, threshold: 0 }
    );
    obs.observe(el);
    return () => obs.disconnect();
  }, [rootMargin]);

  return (
    <div ref={ref}>
      {isVisible ? children : fallback}
    </div>
  );
}
