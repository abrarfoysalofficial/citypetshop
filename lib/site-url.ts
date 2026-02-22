/**
 * Environment-based base URL resolver.
 * Production: https://citypetshopbd.com (or NEXTAUTH_URL / NEXT_PUBLIC_SITE_URL / APP_URL)
 * Never use localhost in production.
 */

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
  return process.env.NODE_ENV === "production" ? "https://citypetshopbd.com" : "http://localhost:3000";
}

/** Client/public base URL (NEXT_PUBLIC_SITE_URL, APP_URL). */
export function getPublicBaseUrl(): string {
  const url =
    (typeof window !== "undefined" ? window.location.origin : null) ||
    process.env.NEXT_PUBLIC_SITE_URL ||
    process.env.APP_URL ||
    "";
  if (url && !isLocalhost(url)) return url;
  return process.env.NODE_ENV === "production" ? "https://citypetshopbd.com" : "http://localhost:3000";
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

/** Ensure callback/redirect URLs never point to localhost in production. */
export function getAuthBaseUrl(): string {
  const url =
    process.env.NEXTAUTH_URL ||
    process.env.APP_URL ||
    process.env.NEXT_PUBLIC_SITE_URL ||
    "";
  if (process.env.NODE_ENV === "production" && (!url || isLocalhost(url))) {
    return "https://citypetshopbd.com";
  }
  return url || getServerBaseUrl();
}
