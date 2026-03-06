/**
 * Edge-safe in-memory rate limiter. No Redis, no Node APIs.
 * Use this in middleware (Edge runtime). For API routes, use lib/rate-limit.ts.
 */
const memoryStore = new Map<string, { count: number; resetAt: number }>();

const DEFAULT_WINDOW_MS = 60 * 1000;

export type RateLimitResult = { ok: boolean; retryAfter?: number };

/** In-memory rate limit — safe for Edge runtime. */
export function rateLimitMemory(
  key: string,
  limit: number,
  windowMs = DEFAULT_WINDOW_MS
): RateLimitResult {
  const now = Date.now();
  const entry = memoryStore.get(key);
  if (!entry) {
    memoryStore.set(key, { count: 1, resetAt: now + windowMs });
    return { ok: true };
  }
  if (now > entry.resetAt) {
    memoryStore.set(key, { count: 1, resetAt: now + windowMs });
    return { ok: true };
  }
  entry.count++;
  if (entry.count > limit) {
    return { ok: false, retryAfter: Math.ceil((entry.resetAt - now) / 1000) };
  }
  return { ok: true };
}

/** Sync rate limit for middleware — always in-memory (Edge runtime). */
export function rateLimitSync(
  key: string,
  limit: number,
  windowMs = DEFAULT_WINDOW_MS
): RateLimitResult {
  return rateLimitMemory(key, limit, windowMs);
}
