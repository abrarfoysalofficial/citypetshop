const CALLBACK_QUERY_KEYS = ["callbackUrl", "next"] as const;

function safeDecode(value: string): string {
  let current = value;
  for (let i = 0; i < 2; i += 1) {
    try {
      const decoded = decodeURIComponent(current);
      if (decoded === current) break;
      current = decoded;
    } catch {
      break;
    }
  }
  return current;
}

function normalizeToPath(raw: string, allowedOrigin?: string): string | null {
  const value = safeDecode(raw.trim());
  if (!value) return null;

  if (value.startsWith("/")) return value;

  try {
    const parsed = new URL(value);
    if (allowedOrigin && parsed.origin !== allowedOrigin) return null;
    return `${parsed.pathname}${parsed.search}`;
  } catch {
    return null;
  }
}

function isLoginPath(pathname: string): boolean {
  return pathname === "/login" || pathname === "/admin/login";
}

function cleanPath(pathLike: string): string {
  const parsed = new URL(pathLike, "https://callback.local");
  for (const key of CALLBACK_QUERY_KEYS) {
    parsed.searchParams.delete(key);
  }
  const query = parsed.searchParams.toString();
  return `${parsed.pathname}${query ? `?${query}` : ""}`;
}

export function sanitizeAdminCallbackUrl(raw: string | null | undefined, allowedOrigin?: string): string {
  const fallback = "/admin";
  if (!raw) return fallback;

  const normalized = normalizeToPath(raw, allowedOrigin);
  if (!normalized) return fallback;

  const cleaned = cleanPath(normalized);
  const parsed = new URL(cleaned, "https://callback.local");
  const pathname = parsed.pathname.replace(/\/+$/, "") || "/";

  if (pathname.includes("..") || isLoginPath(pathname)) return fallback;
  if (pathname !== "/admin" && !pathname.startsWith("/admin/")) return fallback;

  const query = parsed.searchParams.toString();
  return `${pathname}${query ? `?${query}` : ""}`;
}

export function sanitizeCustomerCallbackUrl(raw: string | null | undefined, allowedOrigin?: string): string {
  const fallback = "/account";
  if (!raw) return fallback;

  const normalized = normalizeToPath(raw, allowedOrigin);
  if (!normalized) return fallback;

  const cleaned = cleanPath(normalized);
  const parsed = new URL(cleaned, "https://callback.local");
  const pathname = parsed.pathname.replace(/\/+$/, "") || "/";

  if (pathname.includes("..") || isLoginPath(pathname)) return fallback;
  if (pathname === "/admin" || pathname.startsWith("/admin/")) return fallback;
  if (!pathname.startsWith("/")) return fallback;

  const query = parsed.searchParams.toString();
  return `${pathname}${query ? `?${query}` : ""}`;
}

