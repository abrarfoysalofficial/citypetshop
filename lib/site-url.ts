/**
 * Environment-based base URL resolver.
 * Production: https://citypetshop.bd (or NEXTAUTH_URL / NEXT_PUBLIC_SITE_URL / APP_URL)
 * Never use localhost in production.
 * Uses X-Forwarded-Proto for HTTPS detection behind reverse proxy.
 */

import type { NextRequest } from "next/server";

/** Detect HTTPS from request (X-Forwarded-Proto takes precedence behind Nginx). */
export function isHttpsFromRequest(request: NextRequest): boolean {
  const proto = (request.headers.get("x-forwarded-proto") ?? request.nextUrl.protocol?.replace(":", "") ?? "https")
    .split(",")[0]
    ?.trim()
    .toLowerCase();
  return proto === "https";
}

/** Single source of truth: build redirect URL from request (respects X-Forwarded-*). Never returns localhost in production. */
export function getPublicBaseUrlFromRequest(request: NextRequest): string {
  const proto = (request.headers.get("x-forwarded-proto") ?? request.nextUrl.protocol?.replace(":", "") ?? "https")
    .split(",")[0]
    ?.trim() || "https";
  const host = (request.headers.get("x-forwarded-host") ?? request.headers.get("host") ?? "")
    .split(",")[0]
    ?.trim() || "";
  if (host && (host.includes("localhost") || host.includes("127.0.0.1"))) {
    return process.env.NODE_ENV === "production" ? "https://citypetshop.bd" : `http://${host}`;
  }
  if (host && proto) {
    const canonicalHost = getCanonicalHost(host);
    return `${proto}://${canonicalHost}`;
  }
  return getServerBaseUrl();
}

/** Normalize www vs non-www: use canonical host from NEXTAUTH_URL when set. */
function getCanonicalHost(host: string): string {
  const canonical = process.env.NEXTAUTH_URL || process.env.APP_URL || process.env.NEXT_PUBLIC_SITE_URL || "";
  if (canonical) {
    try {
      const u = new URL(canonical);
      if (u.hostname && !isLocalhost(canonical)) return u.hostname;
    } catch {
      /* ignore */
    }
  }
  return host;
}

/** Build absolute URL for redirect (path must start with /). */
export function buildRedirectUrl(request: NextRequest, path: string): string {
  const base = getPublicBaseUrlFromRequest(request);
  return path.startsWith("/") ? `${base}${path}` : `${base}/${path}`;
}

/** Server-side base URL (NEXTAUTH_URL, APP_URL, or NEXT_PUBLIC_SITE_URL). */
export function getServerBaseUrl(): string {
  if (typeof window !== "undefined") {
    return getPublicBaseUrl();
  }
  const url =
    process.env.NEXTAUTH_URL ||
    process.env.APP_URL ||
    process.env.NEXT_PUBLIC_SITE_URL ||
    "";
  if (url && !isLocalhost(url)) return url;
  return process.env.NODE_ENV === "production" ? "https://citypetshop.bd" : "http://localhost:3000";
}

/** Client/public base URL (NEXT_PUBLIC_SITE_URL, APP_URL). */
export function getPublicBaseUrl(): string {
  const url =
    (typeof window !== "undefined" ? window.location.origin : null) ||
    process.env.NEXT_PUBLIC_SITE_URL ||
    process.env.APP_URL ||
    "";
  if (url && !isLocalhost(url)) return url;
  return process.env.NODE_ENV === "production" ? "https://citypetshop.bd" : "http://localhost:3000";
}

/** Check if URL is localhost (dev only). */
function isLocalhost(url: string): boolean {
  try {
    const u = new URL(url);
    return u.hostname === "localhost" || u.hostname === "127.0.0.1";
  } catch {
    return false;
  }
}

/** Auth base URL for NextAuth callbacks. Production: never escape https://citypetshop.bd. */
export function getAuthBaseUrl(): string {
  const canonical = "https://citypetshop.bd";
  if (process.env.NODE_ENV === "production") {
    const url = process.env.NEXTAUTH_URL || process.env.APP_URL || process.env.NEXT_PUBLIC_SITE_URL || "";
    if (!url || isLocalhost(url)) return canonical;
    try {
      const u = new URL(url);
      if (u.hostname !== "citypetshop.bd" && u.hostname !== "www.citypetshop.bd") return canonical;
      return url;
    } catch {
      return canonical;
    }
  }
  const url = process.env.NEXTAUTH_URL || process.env.APP_URL || process.env.NEXT_PUBLIC_SITE_URL || "";
  return (url && !isLocalhost(url)) ? url : getServerBaseUrl();
}
