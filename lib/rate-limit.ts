/**
 * Rate limiter: Redis-backed when REDIS_URL set, in-memory fallback otherwise.
 * Middleware (Edge runtime) uses rateLimitMemory — Redis not available in Edge.
 */
const memoryStore = new Map<string, { count: number; resetAt: number }>();

const DEFAULT_WINDOW_MS = 60 * 1000;

export type RateLimitResult = { ok: boolean; retryAfter?: number };

/** Sync in-memory rate limit — for Edge middleware only (Redis unavailable). */
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

/** Redis-backed rate limit (async). Uses INCR + EXPIRE. Falls back to in-memory if Redis unavailable. */
export async function rateLimit(
  key: string,
  limit: number,
  windowMs = DEFAULT_WINDOW_MS
): Promise<RateLimitResult> {
  try {
    const { getRedisClient } = await import("@/lib/redis");
    const redis = getRedisClient();
    if (redis) {
      const count = await redis.incr(`rl:${key}`);
      if (count === 1) {
        await redis.pexpire(`rl:${key}`, windowMs);
      }
      const ttl = await redis.pttl(`rl:${key}`);
      if (count > limit) {
        return { ok: false, retryAfter: Math.ceil(ttl / 1000) };
      }
      return { ok: true };
    }
  } catch {
    // Fall through to in-memory
  }
  return rateLimitMemory(key, limit, windowMs);
}

/** Sync rate limit for middleware — always in-memory (Edge runtime). */
export function rateLimitSync(
  key: string,
  limit: number,
  windowMs = DEFAULT_WINDOW_MS
): RateLimitResult {
  return rateLimitMemory(key, limit, windowMs);
}

export function getRateLimitKey(prefix: string, request: Request): string {
  const ip =
    request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ??
    request.headers.get("x-real-ip") ??
    "unknown";
  return `${prefix}:${ip}`;
}
