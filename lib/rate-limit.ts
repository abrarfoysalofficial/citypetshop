/**
 * Simple in-memory rate limiter for API routes.
 * For production at scale, use Redis. This suffices for single-instance PM2.
 */
const store = new Map<string, { count: number; resetAt: number }>();

const DEFAULT_WINDOW_MS = 60 * 1000; // 1 minute

export function rateLimit(key: string, limit: number, windowMs = DEFAULT_WINDOW_MS): { ok: boolean; retryAfter?: number } {
  const now = Date.now();
  const entry = store.get(key);
  if (!entry) {
    store.set(key, { count: 1, resetAt: now + windowMs });
    return { ok: true };
  }
  if (now > entry.resetAt) {
    store.set(key, { count: 1, resetAt: now + windowMs });
    return { ok: true };
  }
  entry.count++;
  if (entry.count > limit) {
    return { ok: false, retryAfter: Math.ceil((entry.resetAt - now) / 1000) };
  }
  return { ok: true };
}

export function getRateLimitKey(prefix: string, request: Request): string {
  const ip = request.headers.get("x-forwarded-for")?.split(",")[0]?.trim()
    ?? request.headers.get("x-real-ip")
    ?? "unknown";
  return `${prefix}:${ip}`;
}
