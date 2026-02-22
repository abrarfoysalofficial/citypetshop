"use client";

import { usePathname, useRouter } from "next/navigation";
import { useCallback, useEffect } from "react";

/**
 * Phase 1: Predictive navigation – prefetch routes on hover/focus.
 * Only prefetches same-origin, non-auth routes.
 */
const PREFETCH_PATHS = [
  "/shop",
  "/cart",
  "/checkout",
  "/account",
  "/account/orders",
  "/blog",
  "/combo-offers",
  "/contact",
];

const SKIP_PREFIXES = ["/admin", "/api", "/auth", "/login", "/_next"];

function shouldPrefetch(href: string): boolean {
  if (!href || href.startsWith("#") || href.startsWith("mailto:") || href.startsWith("tel:")) return false;
  if (href.startsWith("http") && !href.startsWith(typeof window !== "undefined" ? window.location.origin : "")) return false;
  const path = href.replace(/^[^/]*\/\/[^/]+/, "") || "/";
  if (SKIP_PREFIXES.some((p) => path.startsWith(p))) return false;
  return true;
}

export function usePrefetch() {
  const router = useRouter();
  const pathname = usePathname();

  const prefetch = useCallback(
    (href: string) => {
      if (!shouldPrefetch(href)) return;
      const url = new URL(href, typeof window !== "undefined" ? window.location.origin : "http://localhost");
      const path = url.pathname + url.search;
      if (path === pathname) return;
      router.prefetch(path);
    },
    [router, pathname]
  );

  return prefetch;
}

/**
 * Attach prefetch to all same-origin links on hover/focus.
 * Call from layout or nav components.
 */
export function PreloadLinks() {
  const prefetch = usePrefetch();

  useEffect(() => {
    const handler = (e: MouseEvent | FocusEvent) => {
      const target = (e.target as HTMLElement).closest("a");
      if (!target?.href) return;
      prefetch(target.href);
    };

    document.addEventListener("mouseenter", handler, { capture: true });
    document.addEventListener("focusin", handler, { capture: true });
    return () => {
      document.removeEventListener("mouseenter", handler, { capture: true });
      document.removeEventListener("focusin", handler, { capture: true });
    };
  }, [prefetch]);

  return null;
}

/**
 * Prefetch high-priority routes on idle.
 */
export function PreloadCriticalRoutes() {
  const router = useRouter();

  useEffect(() => {
    const idle = "requestIdleCallback" in window ? requestIdleCallback : (cb: () => void) => setTimeout(cb, 500);
    idle(() => {
      PREFETCH_PATHS.forEach((path) => router.prefetch(path));
    });
  }, [router]);

  return null;
}
